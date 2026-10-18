/**
 * Editorial Schedule Service — manages the calendar and orchestrates publishing.
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * Core principle: scheduled timestamp alone NEVER causes publication.
 * Every publish goes through the publication gate. Every gate check is logged.
 *
 * Concurrency safety: every publish uses an atomic WHERE status='scheduled'
 * update. If another worker already published, the update affects 0 rows
 * and we skip. This prevents duplicate publication without distributed locks.
 *
 * Idempotency: already-published stories are detected and skipped.
 */

import { getServiceClient } from '@/supabase/client';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import type {
  EditorialScheduleEntry,
  PublicationGateResult,
  ScheduleStatus,
  WeeklyPlan,
  WeeklySlot,
} from '@/types/editorial-calendar';

export const SCHEDULE_CLAIM_LEASE_DURATION_MS = 5 * 60 * 1000; // 5-minute lease duration

// ─── Schedule CRUD ───────────────────────────────────────────────────────────

export async function createScheduleEntry(
  entry: Omit<EditorialScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<EditorialScheduleEntry> {
  const db = getServiceClient();

  const { data, error } = await db
    .from('editorial_schedule')
    .insert({
      story_id: entry.storyId,
      slot_date: entry.slotDate,
      slot_position: entry.slotPosition,
      priority: entry.priority,
      category: entry.category,
      rationale: entry.rationale || null,
      notes: entry.notes || null,
      status: entry.status,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(data);
}

export async function updateScheduleEntry(
  id: string,
  updates: Partial<Pick<EditorialScheduleEntry, 'status' | 'priority' | 'rationale' | 'notes' | 'blockReason'>>,
): Promise<EditorialScheduleEntry> {
  const db = getServiceClient();
  const now = new Date().toISOString();

  const updatePayload: Record<string, string | number | null> = { updated_at: now };
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.priority !== undefined) updatePayload.priority = updates.priority;
  if (updates.rationale !== undefined) updatePayload.rationale = updates.rationale;
  if (updates.notes !== undefined) updatePayload.notes = updates.notes;
  if (updates.blockReason !== undefined) {
    updatePayload.block_reason = updates.blockReason;
    updatePayload.blocked_at = now;
  }

  const { data, error } = await db
    .from('editorial_schedule')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updatePayload as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(data);
}

export async function getScheduleEntries(
  weekStart: string,
): Promise<EditorialScheduleEntry[]> {
  const db = getServiceClient();
  const weekEnd = getWeekEnd(weekStart);

  const { data, error } = await db
    .from('editorial_schedule')
    .select('*')
    .gte('slot_date', weekStart)
    .lte('slot_date', weekEnd)
    .order('slot_date', { ascending: true })
    .order('slot_position', { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToEntry);
}

export async function getEntryByStoryId(
  storyId: string,
): Promise<EditorialScheduleEntry | null> {
  const db = getServiceClient();

  const { data, error } = await db
    .from('editorial_schedule')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToEntry(data) : null;
}

// ─── Validation & Publishing ─────────────────────────────────────────────────

export async function validateAndPublishDueStories(
  now: Date = new Date(),
): Promise<PublicationGateResult[]> {
  const db = getServiceClient();
  const results: PublicationGateResult[] = [];

  const today = formatDate(now);

  // Only pick entries with status 'validated' or 'ready' (ready = re-validate on cron).
  // 'planned', 'in_progress', 'blocked', 'skipped', 'published' are NOT eligible.
  const { data: dueEntries, error: fetchError } = await db
    .from('editorial_schedule')
    .select('*')
    .in('status', ['validated', 'ready'])
    .lte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('priority', { ascending: false });

  if (fetchError) throw fetchError;

  for (const entry of dueEntries || []) {
    const result = await validateAndPublishEntry(entry, now);
    results.push(result);
  }

  return results;
}

/**
 * Validate and publish a single schedule entry.
 *
 * Concurrency safety: uses atomic WHERE status='...' on both the schedule
 * update and the story update. If another worker already processed this
 * entry, the updates affect 0 rows and we skip.
 */
async function validateAndPublishEntry(
  entry: Record<string, unknown>,
  now: Date,
): Promise<PublicationGateResult> {
  const db = getServiceClient();
  const storyId = entry.story_id as string;
  const scheduleId = entry.id as string;
  const currentScheduleStatus = entry.status as string;

  // ── ATOMIC CLAIM: acquire exclusive lease on the schedule entry
  // If status is 'ready': atomically transition to 'validated' and set validated_at
  // If status is 'validated': atomically acquire/renew lease only if validated_at is null or expired (< leaseCutoff)
  // If status is anything else: entry is not eligible for publication claim
  const nowIso = now.toISOString();
  let claimedEntry: Record<string, unknown> | null = null;
  let claimError: unknown = null;

  if (currentScheduleStatus === 'ready') {
    const res = await db
      .from('editorial_schedule')
      .update({
        status: 'validated',
        validated_at: nowIso,
        updated_at: nowIso,
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'ready')
      .select()
      .maybeSingle();
    claimedEntry = res.data;
    claimError = res.error;
  } else if (currentScheduleStatus === 'validated') {
    const leaseCutoff = new Date(now.getTime() - SCHEDULE_CLAIM_LEASE_DURATION_MS).toISOString();
    const res = await db
      .from('editorial_schedule')
      .update({
        validated_at: nowIso,
        updated_at: nowIso,
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .or(`validated_at.is.null,validated_at.lt.${leaseCutoff}`)
      .select()
      .maybeSingle();
    claimedEntry = res.data;
    claimError = res.error;
  }

  if (claimError) {
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.claim_query_failed',
        storyId,
        scheduleId,
        category: 'SCHEDULE_CLAIM_FAILED',
        timestamp: nowIso,
      }),
    );
    return {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'blocked',
      checks: [{
        name: 'schedule_claim',
        passed: false,
        reason: 'SCHEDULE_CLAIM_FAILED',
      }],
      checkedAt: nowIso,
      triggeredBy: 'cron',
    };
  }

  if (!claimedEntry) {
    // Another worker already claimed or active lease is held — legitimate contention
    return {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'skipped',
      checks: [{
        name: 'already_claimed',
        passed: false,
        reason: `Schedule entry already claimed or active lease held by another worker (current status: ${currentScheduleStatus})`,
      }],
      checkedAt: nowIso,
      triggeredBy: 'cron',
    };
  }

  const claimedValidatedAt = (claimedEntry.validated_at as string) || nowIso;
  const claimTimeMs = now.getTime();

  // ── Fetch the story
  const { data: storyRow, error: storyError } = await db
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .maybeSingle();

  if (storyError || !storyRow) {
    const isDbError = Boolean(storyError);
    const safeReason = isDbError
      ? 'STORY_VERIFICATION_QUERY_FAILED'
      : 'STORY_MISSING_PRE_PERSISTENCE';

    if (isDbError) {
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.story_fetch_failed',
          storyId,
          scheduleId,
          category: 'STORY_VERIFICATION_QUERY_FAILED',
          timestamp: now.toISOString(),
        }),
      );
    } else {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.story_not_found',
          storyId,
          scheduleId,
          category: 'STORY_MISSING_PRE_PERSISTENCE',
          timestamp: now.toISOString(),
        }),
      );
    }

    const { data: updatedRows } = await db
      .from('editorial_schedule')
      .update({
        status: 'blocked',
        block_reason: safeReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id');

    const isUpdated = Boolean(
      Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
    );

    if (!isUpdated) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    const result: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'blocked',
      checks: [{
        name: isDbError ? 'story_verification' : 'story_exists',
        passed: false,
        reason: safeReason,
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGateResult(result);
    return result;
  }

  const expectedVersion = typeof (storyRow as { version?: number })?.version === 'number'
    ? (storyRow as { version?: number }).version!
    : 1;

  // ── IDEMPOTENCY GUARD: skip if already published
  if (storyRow.status === 'published') {
    const { data: updatedRows } = await db
      .from('editorial_schedule')
      .update({ status: 'published', published_at: now.toISOString(), updated_at: now.toISOString() } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id');

    const isUpdated = Boolean(
      Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
    );

    if (!isUpdated) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    const result: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: true,
      outcome: 'already_published',
      checks: [{
        name: 'already_published',
        passed: true,
        reason: 'Story is already published — skipping',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
      publishedAt: (storyRow as { published_at?: string }).published_at || (storyRow as { updated_at?: string }).updated_at || now.toISOString(),
    };
    await logGateResult(result);
    return result;
  }

  // ── Convert story row to canonical Story shape for validation
  const story = rowToStory(storyRow);

  // ── Run Canonical Publication Contract (All 12 Gates + Gate 13 Evidence Vault)
  const { evaluatePublicationContractAsync, executePostPublicationEffects } = await import('@/lib/editorial/canonical-publication');
  const { RepositoryFactory } = await import('@/services/factory/repository');

  const schedulerPrincipal = {
    userId: 'system-scheduler',
    email: 'scheduler@breakdown.local',
    name: 'Editorial Scheduler',
    role: 'owner' as const,
    isSuperAdmin: true,
    status: 'active' as const,
    organizationId: null,
  };

  const decision = await evaluatePublicationContractAsync(
    story,
    story,
    schedulerPrincipal,
    { scheduleId, triggeredBy: 'cron', now }
  );

  const result: PublicationGateResult = decision.gateResult || {
    storyId,
    scheduleId,
    passed: decision.allowed,
    checks: [],
    checkedAt: now.toISOString(),
    triggeredBy: 'cron',
  };

  // ── Handle gate blockage or missing publication token
  if (!decision.allowed || !decision.publicationToken) {
    result.passed = false;
    result.outcome = 'blocked';

    if (decision.allowed && !decision.publicationToken) {
      result.checks.push({
        name: 'missing_publication_token',
        passed: false,
        reason: 'Publication decision allowed but publication token is absent',
      });
    }

    const isLeaseExpired = Date.now() - claimTimeMs >= SCHEDULE_CLAIM_LEASE_DURATION_MS;
    if (isLeaseExpired) {
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_expired',
          passed: false,
          reason: 'Schedule claim lease expired during gate validation',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    await logGateResult(result);

    const failedChecks = result.checks.filter(c => !c.passed);
    const blockReason = failedChecks.map(c => c.reason).join('; ') || 'Publication gate failed or publication token missing';

    // Atomically transition schedule to 'blocked' ONLY if this worker still holds the lease
    const { data: blockedSched } = await db
      .from('editorial_schedule')
      .update({
        status: 'blocked',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id')
      .maybeSingle();

    const isBlockedUpdated = Boolean(
      Array.isArray(blockedSched) ? blockedSched.length > 0 : blockedSched
    );

    if (!isBlockedUpdated) {
      // Lease was stolen or superseded by another claimant — fence cleanly
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    // Also block the story (revert to review) with version fencing to prevent overwriting concurrent updates
    let storyBlockQuery = db
      .from('stories')
      .update({
        status: 'review',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', storyId)
      .neq('status', 'published'); // never un-publish

    const currentStoryVersion = (storyRow as { version?: number })?.version;
    if (typeof currentStoryVersion === 'number') {
      storyBlockQuery = storyBlockQuery.eq('version', currentStoryVersion);
    }

    await storyBlockQuery;

    return result;
  }

  // ── PUBLISH via Story Repository with validated Publication Token
  const repo = RepositoryFactory.getStoryRepository();
  const publishedAt = now.toISOString();

  // ── Check local lease expiry before pre-persistence phase
  if (Date.now() - claimTimeMs >= SCHEDULE_CLAIM_LEASE_DURATION_MS) {
    console.warn(
      JSON.stringify({
        event: 'editorial.schedule.lease_lost',
        storyId,
        scheduleId,
        category: 'SCHEDULE_LEASE_LOST',
        timestamp: now.toISOString(),
      }),
    );
    return {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'skipped',
      checks: [{
        name: 'lease_fenced',
        passed: false,
        reason: 'SCHEDULE_LEASE_LOST',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
  }

  // ── PRE-PERSISTENCE STATE VERIFICATION: Fail closed on DB error or missing row
  const { data: latestStoryRow, error: storyVerifyError } = await db
    .from('stories')
    .select('id, status, published_at, version')
    .eq('id', storyId)
    .maybeSingle();

  if (storyVerifyError || !latestStoryRow) {
    const isDbError = Boolean(storyVerifyError);
    const safeReason = isDbError
      ? 'STORY_VERIFICATION_QUERY_FAILED'
      : 'STORY_MISSING_PRE_PERSISTENCE';

    if (isDbError) {
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.story_verify_failed',
          storyId,
          scheduleId,
          category: 'STORY_VERIFICATION_QUERY_FAILED',
          timestamp: now.toISOString(),
        }),
      );
    } else {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.story_missing_pre_persistence',
          storyId,
          scheduleId,
          category: 'STORY_MISSING_PRE_PERSISTENCE',
          timestamp: now.toISOString(),
        }),
      );
    }

    // Only update schedule if we still own the lease
    const { data: updatedRows } = await db
      .from('editorial_schedule')
      .update({
        status: 'blocked',
        block_reason: safeReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id');

    const isUpdated = Boolean(
      Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
    );

    if (!isUpdated) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    const blockedResult: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'blocked',
      checks: [{
        name: 'pre_persistence_verification',
        passed: false,
        reason: safeReason,
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGateResult(blockedResult);

    return blockedResult;
  }

  // Idempotency check: skip persistence if already published in DB
  if ((latestStoryRow as { status?: string }).status === 'published') {
    const publishedTimestamp = (latestStoryRow as { published_at?: string }).published_at || publishedAt;
    const { data: updatedRows } = await db
      .from('editorial_schedule')
      .update({ status: 'published', published_at: publishedTimestamp, updated_at: publishedAt } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id');

    const isUpdated = Boolean(
      Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
    );

    if (!isUpdated) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    const idempotentResult: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: true,
      outcome: 'already_published',
      checks: [{
        name: 'already_published',
        passed: true,
        reason: 'Story is already published in database — skipping persistence',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
      publishedAt: publishedTimestamp,
    };
    await logGateResult(idempotentResult);
    return idempotentResult;
  }

  // Re-verify schedule lease immediately before persistence
  const { data: currentScheduleCheck, error: schedCheckErr } = await db
    .from('editorial_schedule')
    .select('status, validated_at')
    .eq('id', scheduleId)
    .maybeSingle();

  if (
    schedCheckErr ||
    !currentScheduleCheck ||
    currentScheduleCheck.validated_at !== claimedValidatedAt ||
    currentScheduleCheck.status !== 'validated'
  ) {
    console.warn(
      JSON.stringify({
        event: 'editorial.schedule.lease_lost',
        storyId,
        scheduleId,
        category: 'SCHEDULE_LEASE_LOST',
        timestamp: now.toISOString(),
      }),
    );
    return {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'skipped',
      checks: [{
        name: 'lease_lost_pre_persistence',
        passed: false,
        reason: 'SCHEDULE_LEASE_LOST',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
  }

  const storyVersionToUse = typeof (latestStoryRow as { version?: number }).version === 'number'
    ? (latestStoryRow as { version?: number }).version!
    : expectedVersion;

  // 1. PERSISTENCE PHASE (OCC fenced)
  try {
    if (typeof repo.saveStoryOCC === 'function') {
      await repo.saveStoryOCC(
        {
          ...decision.updatedStory!,
          status: 'published',
          publicationStatus: 'published',
          publishedAt,
          updatedAt: publishedAt,
        },
        storyVersionToUse,
        { publicationToken: decision.publicationToken }
      );
    } else {
      await repo.saveStory(
        {
          ...decision.updatedStory!,
          status: 'published',
          publicationStatus: 'published',
          publishedAt,
          updatedAt: publishedAt,
        },
        {
          publicationToken: decision.publicationToken,
          expectedVersion: storyVersionToUse,
        } as never
      );
    }
  } catch (_publishErr) {
    // Failure before persistence: story was not published
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.persistence_failed',
        storyId,
        scheduleId,
        category: 'REPOSITORY_PERSISTENCE_FAILED',
        timestamp: now.toISOString(),
      }),
    );

    const isLeaseExpired = Date.now() - claimTimeMs >= SCHEDULE_CLAIM_LEASE_DURATION_MS;
    let updateSucceeded = false;

    if (!isLeaseExpired) {
      const { data: updatedRows } = await db
        .from('editorial_schedule')
        .update({
          status: 'blocked',
          block_reason: 'Repository rejected publication persistence',
          blocked_at: now.toISOString(),
          updated_at: now.toISOString(),
        } as never)
        .eq('id', scheduleId)
        .eq('status', 'validated')
        .eq('validated_at', claimedValidatedAt)
        .select('id');

      updateSucceeded = Boolean(
        Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
      );
    }

    if (!updateSucceeded) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: now.toISOString(),
        }),
      );
      return {
        storyId,
        scheduleId,
        passed: false,
        outcome: 'skipped',
        checks: [{
          name: 'lease_fenced',
          passed: false,
          reason: 'SCHEDULE_LEASE_LOST',
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    result.passed = false;
    result.outcome = 'blocked';
    result.checks.push({
      name: 'repository_publish_failed',
      passed: false,
      reason: 'Repository rejected publication persistence',
    });
    await logGateResult(result);
    return result;
  }

  // ── AT THIS POINT: PERSISTENCE SUCCEEDED!
  result.passed = true;
  result.outcome = 'published';
  result.publishedAt = publishedAt;

  // 2. POST-PERSISTENCE HOUSEKEEPING & POST-PUBLICATION EFFECTS:
  // Distinguish publication persistence from subsequent housekeeping.
  // A failure after successful publication must not falsely report that the story
  // was never published. Preserve the error signal separately with structured diagnostics.
  const correlationId = crypto.randomUUID();
  result.correlationId = correlationId;

  try {
    const postEffectsRes = await executePostPublicationEffects(decision.updatedStory!, schedulerPrincipal, result);
    if (postEffectsRes && (!postEffectsRes.eventBusEmitted || postEffectsRes.revalidationStatus === 'failed' || postEffectsRes.errorCategory)) {
      result.postPublicationError = true;
      result.postPublicationErrorCategory = postEffectsRes.errorCategory || 'POST_PUBLICATION_EFFECTS_FAILED';
    }
  } catch (_postErr) {
    result.postPublicationError = true;
    result.postPublicationErrorCategory = 'POST_PUBLICATION_EFFECTS_FAILED';
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.post_effects_failed',
        storyId,
        correlationId,
        category: 'POST_PUBLICATION_EFFECTS_FAILED',
        timestamp: new Date().toISOString(),
      }),
    );
  }

  try {
    const { data: schedRows, error: schedUpdateError } = await db
      .from('editorial_schedule')
      .update({
        status: 'published',
        published_at: publishedAt,
        updated_at: publishedAt,
      } as never)
      .eq('id', scheduleId)
      .eq('status', 'validated')
      .eq('validated_at', claimedValidatedAt)
      .select('id');

    if (schedUpdateError) throw schedUpdateError;
    const isSchedUpdated = Boolean(
      Array.isArray(schedRows) ? schedRows.length > 0 : schedRows
    );
    if (!isSchedUpdated) {
      result.postPublicationError = true;
      result.postPublicationErrorCategory = 'SCHEDULE_STATUS_UPDATE_FAILED';
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost_post_persistence',
          storyId,
          scheduleId,
          category: 'SCHEDULE_LEASE_LOST',
          timestamp: new Date().toISOString(),
        }),
      );
    }
  } catch (_schedErr) {
    result.postPublicationError = true;
    result.postPublicationErrorCategory = result.postPublicationErrorCategory || 'SCHEDULE_STATUS_UPDATE_FAILED';
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.status_update_failed',
        storyId,
        correlationId,
        category: 'SCHEDULE_STATUS_UPDATE_FAILED',
        timestamp: new Date().toISOString(),
      }),
    );
  }

  try {
    await logGateResult(result);
  } catch (_logErr) {
    result.postPublicationError = true;
    result.postPublicationErrorCategory = result.postPublicationErrorCategory || 'AUDIT_LOG_FAILED';
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.gate_log_failed',
        storyId,
        correlationId,
        category: 'AUDIT_LOG_FAILED',
        timestamp: new Date().toISOString(),
      }),
    );
  }

  return result;
}

// ─── Weekly Plan ─────────────────────────────────────────────────────────────

export async function getWeeklyPlan(weekStart: string): Promise<WeeklyPlan> {
  const entries = await getScheduleEntries(weekStart);
  const weekEnd = getWeekEnd(weekStart);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots: WeeklySlot[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dayEntries = entries.filter(e => e.slotDate === date);
    slots.push({
      date,
      dayName: dayNames[i],
      dayIndex: i,
      entry: dayEntries[0] || undefined,
    });
  }

  const publishedCount = entries.filter(e => e.status === 'published').length;
  const blockedCount = entries.filter(e => e.status === 'blocked').length;
  const pendingCount = entries.filter(e =>
    ['planned', 'in_progress', 'ready', 'validated'].includes(e.status),
  ).length;

  return {
    weekStart,
    weekEnd,
    slots,
    totalEntries: entries.length,
    publishedCount,
    blockedCount,
    pendingCount,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowToEntry(row: Record<string, unknown>): EditorialScheduleEntry {
  return {
    id: row.id as string,
    storyId: row.story_id as string,
    slotDate: row.slot_date as string,
    slotPosition: row.slot_position as number,
    priority: row.priority as number,
    category: row.category as string,
    rationale: (row.rationale as string) || undefined,
    notes: (row.notes as string) || undefined,
    status: row.status as ScheduleStatus,
    validatedAt: (row.validated_at as string) || undefined,
    publishedAt: (row.published_at as string) || undefined,
    blockedAt: (row.blocked_at as string) || undefined,
    blockReason: (row.block_reason as string) || undefined,
    fallbackScheduleId: (row.fallback_schedule_id as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToStory(row: Record<string, unknown>) {
  const status = (row.status as string) || 'draft';
  const publicationStatus =
    status === 'published' ? 'published'
    : status === 'scheduled' ? 'scheduled'
    : status === 'review' ? 'review'
    : 'draft';

  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    headline: (row.headline as string) || (row.title as string),
    summary: (row.summary as string) || '',
    heroImage: (row.hero_image as string) || '',
    author: (row.author as string) || '',
    category: (row.category as string) || '',
    status: status as import('@/types/canonical').StoryStatus,
    publicationStatus: publicationStatus as import('@/types/canonical').PublicationStatus,
    storyType: 'standard' as import('@/types/canonical').StoryType,
    evidenceScore: (row.evidence_score as number) || 0,
    readingTime: (row.reading_time as number) || 0,
    publishedAt: (row.published_at as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    updatedBy: (row.updated_by as string) || undefined,
    tags: (row.tags as string[]) || [],
    blocks: (row.blocks as import('@/types/canonical').StoryBlock[]) || [],
    sources: (row.sources as import('@/types/canonical').Source[]) || [],
    claims: (row.claims as import('@/types/canonical').Claim[]) || [],
    timeline: (row.timeline as import('@/types/canonical').TimelineEvent[]) || [],
    faq: (row.faq as import('@/types/canonical').FAQItem[]) || [],
    charts: (row.charts as import('@/types/canonical').ChartDef[]) || [],
    relatedStoryIds: (row.related_story_ids as string[]) || [],
    relatedEntityIds: (row.related_entity_ids as string[]) || [],
    relatedTopicIds: (row.related_topic_ids as string[]) || [],
    blockReason: (row.block_reason as string) || undefined,
  } as import('@/types/canonical').Story;
}

async function logGateResult(result: PublicationGateResult): Promise<void> {
  const db = getServiceClient();
  const { error } = await db.from('publication_gate_log').insert({
    story_id: result.storyId,
    schedule_id: result.scheduleId || null,
    gate_result: result.passed ? 'pass' : 'fail',
    checks: result.checks,
    checked_at: result.checkedAt,
    published_at: result.publishedAt || null,
    triggered_by: result.triggeredBy,
  });
  if (error) throw error;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getWeekEnd(weekStart: string): string {
  return addDays(weekStart, 6);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
}
