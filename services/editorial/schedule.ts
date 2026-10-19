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
  ensureCanonicalEventConsumers();
  const db = getServiceClient();
  const results: PublicationGateResult[] = [];

  // ── DATABASE-AUTHORITATIVE SCHEDULE ENTRY DISCOVERY (Checkpoint A)
  // Canonical editorial scheduling timezone is UTC (UTC+00:00).
  // Discovery evaluates due slot_date directly against database clock_timestamp() AT TIME ZONE 'UTC'
  // via fn_discover_due_schedule_entries RPC, completely eliminating caller clock skew.
  if (typeof (db as any).rpc !== 'function') {
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.discovery_rpc_unavailable',
        category: 'SCHEDULE_CLAIM_FAILED',
        error: 'RPC_UNAVAILABLE',
        timestamp: now.toISOString(),
      }),
    );
    throw new Error('Database RPC interface unavailable for authoritative schedule discovery (RPC_UNAVAILABLE)');
  }

  const { data: dueEntries, error: fetchError } = await (db as any).rpc(
    'fn_discover_due_schedule_entries',
    { p_limit: 50 },
  );

  if (fetchError) throw fetchError;

  for (const entry of dueEntries || []) {
    const result = await validateAndPublishEntry(entry, now);
    results.push(result);
  }

  // ── RECOVER PENDING PUBLICATION OUTBOX (Single Authority & At-Least-Once Delivery)
  // Ensures pending post-publication effects are processed through the single authoritative outbox path.
  // Delivery is at-least-once; side-effect consumers are idempotent.
  try {
    const recoverySummary = await processPendingPublicationOutbox();
    if (recoverySummary.state === 'claim_error') {
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.outbox_claim_error',
          correlationId: recoverySummary.correlationId,
          category: 'OUTBOX_CLAIM_FAILED',
          error: recoverySummary.error,
          timestamp: new Date().toISOString(),
        }),
      );
    } else if (recoverySummary.state === 'malformed_claim_response') {
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.outbox_claim_malformed',
          correlationId: recoverySummary.correlationId,
          category: 'OUTBOX_CLAIM_MALFORMED',
          timestamp: new Date().toISOString(),
        }),
      );
    } else if (recoverySummary.processed > 0) {
      console.log(
        JSON.stringify({
          event: 'editorial.schedule.outbox_recovery_summary',
          state: recoverySummary.state,
          correlationId: recoverySummary.correlationId,
          processed: recoverySummary.processed,
          succeeded: recoverySummary.succeeded,
          failed: recoverySummary.failed,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  } catch (outboxRecoveryErr) {
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.outbox_recovery_error',
        category: 'OUTBOX_RECOVERY_FAILED',
        error: sanitizeDiagnosticError(outboxRecoveryErr),
        timestamp: new Date().toISOString(),
      }),
    );
    // Non-blocking: outbox recovery failures do not alter published status of committed stories
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
  const scheduleId = (entry.id || entry.schedule_id) as string;
  const currentScheduleStatus = entry.status as string;

  // ── DATABASE-AUTHORITATIVE LEASE CLAIM (Checkpoint A)
  // Invokes fn_claim_schedule_entry_fenced RPC to acquire or renew the lease directly
  // against PostgreSQL's authoritative clock_timestamp(), completely eliminating caller clock skew.
  const nowIso = now.toISOString();
  let claimedValidatedAt: string | null = null;
  let claimError: unknown = null;
  let claimOutcome: 'claimed' | 'already_claimed' | 'already_published' | 'blocked' = 'claimed';
  let claimBlockReason = 'SCHEDULE_CLAIM_FAILED';

  if (typeof (db as any).rpc === 'function') {
    const { data: rawClaimData, error: claimRpcError } = await (db as any).rpc('fn_claim_schedule_entry_fenced', {
      p_schedule_id: scheduleId,
      p_story_id: storyId,
    });
    const claimData = rawClaimData as {
      success?: boolean;
      code?: string;
      error?: string;
      validated_at?: string;
    } | null;

    if (claimRpcError) {
      claimError = claimRpcError;
    } else if (!claimData || !claimData.success) {
      if (claimData?.code === 'ALREADY_PUBLISHED') {
        claimOutcome = 'already_published';
      } else if (claimData?.code === 'SCHEDULE_LEASE_ACTIVE') {
        claimOutcome = 'already_claimed';
      } else {
        claimOutcome = 'blocked';
        claimBlockReason = claimData?.code
          ? `${claimData.code}${claimData.error ? `: ${claimData.error}` : ''}`
          : (claimData?.error || 'SCHEDULE_CLAIM_FAILED');
      }
    } else if (claimData.validated_at && typeof claimData.validated_at === 'string') {
      claimedValidatedAt = claimData.validated_at;
      claimOutcome = 'claimed';
    } else {
      claimOutcome = 'blocked';
      claimBlockReason = 'CLAIM_MISSING_VALIDATED_AT';
    }
  } else {
    // Unsafe application-clock fallbacks are eliminated (Phase 44 Checkpoint A)
    // Fail closed with SCHEDULE_CLAIM_FAILED (RPC_UNAVAILABLE)
    claimError = new Error('RPC_UNAVAILABLE');
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

  if (claimOutcome === 'already_published') {
    const idempotentResult: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: true,
      outcome: 'already_published',
      checks: [{
        name: 'already_published',
        passed: true,
        reason: 'Schedule entry is already published in database — skipping persistence',
      }],
      checkedAt: nowIso,
      triggeredBy: 'cron',
    };
    await logGateResult(idempotentResult);
    return idempotentResult;
  }

  if (claimOutcome === 'blocked') {
    return {
      storyId,
      scheduleId,
      passed: false,
      outcome: 'blocked',
      checks: [{
        name: 'schedule_claim',
        passed: false,
        reason: claimBlockReason,
      }],
      checkedAt: nowIso,
      triggeredBy: 'cron',
    };
  }

  if (claimOutcome === 'already_claimed' || !claimedValidatedAt) {
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

    const blockRes = await blockScheduleEntryAtomic({
      scheduleId,
      storyId,
      claimedValidatedAt,
      claimTimeMs,
      blockReason: safeReason,
      result,
      db,
    });

    if (!blockRes.success) {
      if (
        blockRes.code === 'SCHEDULE_LEASE_LOST' ||
        blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
        blockRes.code === 'SCHEDULE_NOT_VALIDATED'
      ) {
        console.warn(
          JSON.stringify({
            event: 'editorial.schedule.lease_lost',
            storyId,
            scheduleId,
            category: blockRes.code,
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
            reason: blockRes.code,
          }],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        };
      }

      if (blockRes.code === 'AUDIT_LOG_FAILED') {
        const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
        const correlationId = result.correlationId || crypto.randomUUID();
        result.correlationId = correlationId;
        console.error(
          JSON.stringify({
            event: 'editorial.schedule.gate_log_failed',
            storyId,
            correlationId,
            category: 'AUDIT_LOG_FAILED',
            error: sanitizedErr,
            timestamp: now.toISOString(),
          }),
        );
        result.checks.push({
          name: 'transactional_audit_log',
          passed: false,
          reason: sanitizedErr,
        });
        return result;
      }
    }

    return result;
  }

  const expectedVersion = typeof (storyRow as { version?: number })?.version === 'number'
    ? (storyRow as { version?: number }).version!
    : 1;

  // ── IDEMPOTENCY GUARD: skip if already published
  // Concurrency Semantics:
  // If the story row is already in 'published' status in the database, this execution
  // path safely aligns the editorial_schedule status to 'published' strictly conditioned
  // on lease ownership (eq('validated_at', claimedValidatedAt)). It never mutates the
  // story entity, ensuring no alternate publication route exists. If another claimant
  // stole the schedule lease, isUpdated is false and the operation fails closed with
  // SCHEDULE_LEASE_LOST / outcome='skipped'.
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
  const { evaluatePublicationContractAsync } = await import('@/lib/editorial/canonical-publication');
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

    const failedChecks = result.checks.filter(c => !c.passed);
    const blockReason = failedChecks.map(c => c.reason).join('; ') || 'Publication gate failed or publication token missing';

    // Atomically transition schedule to 'blocked' and persist audit log via transactional RPC
    const blockRes = await blockScheduleEntryAtomic({
      scheduleId,
      storyId,
      claimedValidatedAt,
      claimTimeMs,
      blockReason,
      result,
      db,
    });

    if (!blockRes.success) {
      if (
        blockRes.code === 'SCHEDULE_LEASE_LOST' ||
        blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
        blockRes.code === 'SCHEDULE_NOT_VALIDATED'
      ) {
        // Lease was stolen, expired or superseded by another claimant — fence cleanly
        console.warn(
          JSON.stringify({
            event: 'editorial.schedule.lease_lost',
            storyId,
            scheduleId,
            category: blockRes.code,
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
            reason: blockRes.code,
          }],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        };
      }

      if (blockRes.code === 'AUDIT_LOG_FAILED') {
        const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
        const correlationId = result.correlationId || crypto.randomUUID();
        result.correlationId = correlationId;
        console.error(
          JSON.stringify({
            event: 'editorial.schedule.gate_log_failed',
            storyId,
            correlationId,
            category: 'AUDIT_LOG_FAILED',
            error: sanitizedErr,
            timestamp: now.toISOString(),
          }),
        );
        result.passed = false;
        result.outcome = 'blocked';
        result.checks.push({
          name: 'transactional_audit_log',
          passed: false,
          reason: sanitizedErr,
        });
        return result;
      }

      // Generic database or RPC error blocking schedule
      result.passed = false;
      result.outcome = 'blocked';
      result.checks.push({
        name: 'gate_block_failed',
        passed: false,
        reason: blockRes.error || 'Failed to atomically block schedule entry',
      });
      return result;
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

    const blockRes = await blockScheduleEntryAtomic({
      scheduleId,
      storyId,
      claimedValidatedAt,
      claimTimeMs,
      blockReason: safeReason,
      result: blockedResult,
      db,
    });

    if (!blockRes.success) {
      if (
        blockRes.code === 'SCHEDULE_LEASE_LOST' ||
        blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
        blockRes.code === 'SCHEDULE_NOT_VALIDATED'
      ) {
        console.warn(
          JSON.stringify({
            event: 'editorial.schedule.lease_lost',
            storyId,
            scheduleId,
            category: blockRes.code,
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
            reason: blockRes.code,
          }],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        };
      }

      if (blockRes.code === 'AUDIT_LOG_FAILED') {
        const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
        const correlationId = blockedResult.correlationId || crypto.randomUUID();
        blockedResult.correlationId = correlationId;
        console.error(
          JSON.stringify({
            event: 'editorial.schedule.gate_log_failed',
            storyId,
            correlationId,
            category: 'AUDIT_LOG_FAILED',
            error: sanitizedErr,
            timestamp: now.toISOString(),
          }),
        );
        blockedResult.checks.push({
          name: 'transactional_audit_log',
          passed: false,
          reason: sanitizedErr,
        });
        return blockedResult;
      }
    }

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

  // 1. ATOMIC PERSISTENCE PHASE (Fenced cross-table transaction)
  // Scheduled publishing requires atomic cross-table fencing. If the repository
  // does not support publishScheduledStoryAtomic, fail closed without fallback.
  if (typeof repo.publishScheduledStoryAtomic !== 'function') {
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.atomic_persistence_unavailable',
        storyId,
        scheduleId,
        category: 'ATOMIC_PERSISTENCE_UNAVAILABLE',
        timestamp: now.toISOString(),
      }),
    );

    result.passed = false;
    result.outcome = 'blocked';
    result.checks.push({
      name: 'atomic_persistence_unavailable',
      passed: false,
      reason: 'Repository does not support atomic scheduled publication fencing',
    });

    const blockRes = await blockScheduleEntryAtomic({
      scheduleId,
      storyId,
      claimedValidatedAt,
      claimTimeMs,
      blockReason: 'Repository does not support atomic scheduled publication fencing',
      result,
      db,
    });

    if (!blockRes.success) {
      if (
        blockRes.code === 'SCHEDULE_LEASE_LOST' ||
        blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
        blockRes.code === 'SCHEDULE_NOT_VALIDATED'
      ) {
        return {
          storyId,
          scheduleId,
          passed: false,
          outcome: 'skipped',
          checks: [{
            name: 'lease_fenced',
            passed: false,
            reason: blockRes.code,
          }],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        };
      }

      if (blockRes.code === 'AUDIT_LOG_FAILED') {
        const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
        result.checks.push({
          name: 'transactional_audit_log',
          passed: false,
          reason: sanitizedErr,
        });
      }
    }

    return result;
  }

  let atomicRes: import('@/services/interfaces/story').PublishScheduledStoryAtomicResult;
  try {
    atomicRes = await repo.publishScheduledStoryAtomic({
      scheduleId,
      storyId,
      expectedValidatedAt: claimedValidatedAt,
      expectedVersion,
      publishedStory: decision.updatedStory!,
      publicationToken: decision.publicationToken,
      publishedAt,
      updatedBy: schedulerPrincipal.userId,
      gateChecks: result.checks,
      gateCheckedAt: result.checkedAt,
      triggeredBy: result.triggeredBy || 'cron',
    });
  } catch (atomicErr: any) {
    atomicRes = {
      success: false,
      code: 'DATABASE_ERROR',
      error: atomicErr?.message || String(atomicErr),
    };
  }

  if (!atomicRes.success) {
    if (
      atomicRes.code === 'SCHEDULE_LEASE_LOST' ||
      atomicRes.code === 'SCHEDULE_NOT_VALIDATED' ||
      atomicRes.code === 'SCHEDULE_LEASE_EXPIRED'
    ) {
      console.warn(
        JSON.stringify({
          event: 'editorial.schedule.lease_lost',
          storyId,
          scheduleId,
          category: atomicRes.code,
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
          reason: atomicRes.code,
        }],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      };
    }

    if (atomicRes.code === 'ALREADY_PUBLISHED') {
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
        publishedAt,
      };
      await logGateResult(idempotentResult);
      return idempotentResult;
    }

    if (atomicRes.code === 'STORY_VERSION_CONFLICT') {
      result.passed = false;
      result.outcome = 'blocked';
      result.checks.push({
        name: 'version_conflict',
        passed: false,
        reason: 'Story version conflict during publication',
      });

      const blockRes = await blockScheduleEntryAtomic({
        scheduleId,
        storyId,
        claimedValidatedAt,
        claimTimeMs,
        blockReason: 'Story version conflict during publication',
        result,
        db,
      });

      if (!blockRes.success) {
        if (
          blockRes.code === 'SCHEDULE_LEASE_LOST' ||
          blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
          blockRes.code === 'SCHEDULE_NOT_VALIDATED'
        ) {
          return {
            storyId,
            scheduleId,
            passed: false,
            outcome: 'skipped',
            checks: [{
              name: 'lease_fenced',
              passed: false,
              reason: blockRes.code,
            }],
            checkedAt: now.toISOString(),
            triggeredBy: 'cron',
          };
        }

        if (blockRes.code === 'AUDIT_LOG_FAILED') {
          const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
          result.checks.push({
            name: 'transactional_audit_log',
            passed: false,
            reason: sanitizedErr,
          });
        }
      }

      return result;
    }

    if (atomicRes.code === 'TOKEN_INVALID') {
      result.passed = false;
      result.outcome = 'blocked';
      result.checks.push({
        name: 'token_invalid',
        passed: false,
        reason: 'Invalid or missing publication token',
      });

      const blockRes = await blockScheduleEntryAtomic({
        scheduleId,
        storyId,
        claimedValidatedAt,
        claimTimeMs,
        blockReason: 'Invalid or missing publication token',
        result,
        db,
      });

      if (!blockRes.success) {
        if (
          blockRes.code === 'SCHEDULE_LEASE_LOST' ||
          blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
          blockRes.code === 'SCHEDULE_NOT_VALIDATED'
        ) {
          return {
            storyId,
            scheduleId,
            passed: false,
            outcome: 'skipped',
            checks: [{
              name: 'lease_fenced',
              passed: false,
              reason: blockRes.code,
            }],
            checkedAt: now.toISOString(),
            triggeredBy: 'cron',
          };
        }

        if (blockRes.code === 'AUDIT_LOG_FAILED') {
          const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
          result.checks.push({
            name: 'transactional_audit_log',
            passed: false,
            reason: sanitizedErr,
          });
        }
      }

      return result;
    }

    if (atomicRes.code === 'RECONCILIATION_ERROR') {
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.reconciliation_error',
          storyId,
          scheduleId,
          category: 'AUTHORITATIVE_RECONCILIATION_ERROR',
          error: atomicRes.error,
          timestamp: now.toISOString(),
        }),
      );
      result.passed = false;
      result.outcome = 'blocked';
      result.checks.push({
        name: 'authoritative_reconciliation',
        passed: false,
        reason: atomicRes.error || 'RPC response contract violation during atomic publication reconciliation',
      });
      await logGateResult(result);
      return result;
    }

    if (atomicRes.code === 'AUDIT_LOG_FAILED') {
      const sanitizedErr = sanitizeDiagnosticError(atomicRes.error);
      const correlationId = result.correlationId || crypto.randomUUID();
      result.correlationId = correlationId;
      console.error(
        JSON.stringify({
          event: 'editorial.schedule.gate_log_failed',
          storyId,
          correlationId,
          category: 'AUDIT_LOG_FAILED',
          error: sanitizedErr,
          timestamp: now.toISOString(),
        }),
      );
      result.passed = false;
      result.outcome = 'blocked';
      result.checks.push({
        name: 'transactional_audit_log',
        passed: false,
        reason: sanitizedErr,
      });
      return result;
    }

    // Generic repository / database error
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.persistence_failed',
        storyId,
        scheduleId,
        category: 'REPOSITORY_PERSISTENCE_FAILED',
        timestamp: now.toISOString(),
      }),
    );

    result.passed = false;
    result.outcome = 'blocked';
    result.checks.push({
      name: 'repository_publish_failed',
      passed: false,
      reason: 'Repository rejected publication persistence',
    });

    const blockRes = await blockScheduleEntryAtomic({
      scheduleId,
      storyId,
      claimedValidatedAt,
      claimTimeMs,
      blockReason: 'Repository rejected publication persistence',
      result,
      db,
    });

    if (!blockRes.success) {
      if (
        blockRes.code === 'SCHEDULE_LEASE_LOST' ||
        blockRes.code === 'SCHEDULE_LEASE_EXPIRED' ||
        blockRes.code === 'SCHEDULE_NOT_VALIDATED'
      ) {
        console.warn(
          JSON.stringify({
            event: 'editorial.schedule.lease_lost',
            storyId,
            scheduleId,
            category: blockRes.code,
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
            reason: blockRes.code,
          }],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        };
      }

      if (blockRes.code === 'AUDIT_LOG_FAILED') {
        const sanitizedErr = sanitizeDiagnosticError(blockRes.error);
        const correlationId = result.correlationId || crypto.randomUUID();
        result.correlationId = correlationId;
        console.error(
          JSON.stringify({
            event: 'editorial.schedule.gate_log_failed',
            storyId,
            correlationId,
            category: 'AUDIT_LOG_FAILED',
            error: sanitizedErr,
            timestamp: now.toISOString(),
          }),
        );
        result.checks.push({
          name: 'transactional_audit_log',
          passed: false,
          reason: sanitizedErr,
        });
        return result;
      }
    }

    return result;
  }

  // ── AT THIS POINT: ATOMIC PERSISTENCE SUCCEEDED!
  // Both stories and editorial_schedule committed simultaneously in a single transaction.
  if (!atomicRes.story || !atomicRes.story.publishedAt || typeof atomicRes.story.version !== 'number') {
    console.error(
      JSON.stringify({
        event: 'editorial.schedule.atomic_contract_violation',
        storyId,
        scheduleId,
        category: 'CONTRACT_VIOLATION_MISSING_AUTHORITATIVE_STORY',
        timestamp: now.toISOString(),
      }),
    );
    result.passed = false;
    result.outcome = 'blocked';
    result.checks.push({
      name: 'authoritative_contract',
      passed: false,
      reason: 'Atomic publish succeeded but omitted authoritative committed story object or required fields',
    });
    await logGateResult(result);
    return result;
  }

  const authoritativeStory = atomicRes.story;
  result.passed = true;
  result.outcome = 'published';
  result.publishedAt = authoritativeStory.publishedAt;

  // 2. SINGLE AUTHORITATIVE DELIVERY VIA TRANSACTIONAL OUTBOX:
  // Scheduled publishing side-effects (cache invalidation, event dispatch) are atomically
  // enqueued into publication_outbox by fn_publish_story_fenced. The durable outbox
  // is the single authoritative delivery path for scheduled publication; inline side effects
  // are NOT executed here to prevent duplicate executions in the same invocation.
  // Delivery is at-least-once through processPendingPublicationOutbox(); effect handlers must be idempotent.
  const correlationId = crypto.randomUUID();
  result.correlationId = correlationId;

  // 3. ATOMIC AUDIT INTEGRITY:
  // The mandatory publication gate audit record is atomically written inside the
  // single database transaction by fn_publish_story_fenced (Phase 50 Finding C).
  // No post-commit application insert is performed here, eliminating the risk of
  // a published story lacking an audit record or generating duplicate gate entries.

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

import { sanitizeDiagnosticError } from '@/lib/security/diagnostic-sanitizer';
export { sanitizeDiagnosticError };

export type OutboxRecoveryState =
  | 'empty'
  | 'claim_error'
  | 'malformed_claim_response'
  | 'claimed'
  | 'partial_failure';

export interface OutboxRecoverySummary {
  state: OutboxRecoveryState;
  processed: number;
  succeeded: number;
  failed: number;
  correlationId: string;
  errorCategory?: string;
  error?: string;
  details: Array<{
    id: string;
    effectType: string;
    status: 'completed' | 'failed';
    error?: string;
    failureRecordError?: string;
  }>;
}

/**
 * Recovers pending post-publication effects (cache revalidation, event dispatch)
 * from the durable transactional outbox (Checkpoint C).
 * Safe to execute concurrently; uses FOR UPDATE SKIP LOCKED in fn_claim_publication_outbox.
 *
 * Single-Authority & At-Least-Once Delivery:
 * The transactional outbox is the single authoritative delivery path for scheduled publication.
 * Scheduled publication side effects are enqueued during the database publication transaction
 * and executed here. If an effect fails or times out, it is retried up to max_retries.
 * Handlers must be idempotent.
 */
export async function processPendingPublicationOutbox(
  batchSize = 10,
): Promise<OutboxRecoverySummary> {
  ensureCanonicalEventConsumers();
  const db = getServiceClient();
  const correlationId = crypto.randomUUID();
  const summary: OutboxRecoverySummary = {
    state: 'empty',
    processed: 0,
    succeeded: 0,
    failed: 0,
    correlationId,
    details: [],
  };

  if (typeof (db as any).rpc !== 'function') {
    summary.state = 'claim_error';
    summary.errorCategory = 'OUTBOX_CLAIM_FAILED';
    summary.error = 'Database RPC interface unavailable for claiming outbox items';
    return summary;
  }

  let claimedItems: unknown;
  try {
    const { data, error: claimErr } = await (db as any).rpc('fn_claim_publication_outbox', {
      p_batch_size: batchSize,
    });

    if (claimErr) {
      summary.state = 'claim_error';
      summary.errorCategory = 'OUTBOX_CLAIM_FAILED';
      summary.error = sanitizeDiagnosticError(claimErr);
      console.error(
        JSON.stringify({
          event: 'outbox.claim_failed',
          correlationId,
          category: 'OUTBOX_CLAIM_FAILED',
          error: summary.error,
          timestamp: new Date().toISOString(),
        }),
      );
      return summary;
    }
    claimedItems = data;
  } catch (claimEx) {
    summary.state = 'claim_error';
    summary.errorCategory = 'OUTBOX_CLAIM_FAILED';
    summary.error = sanitizeDiagnosticError(claimEx);
    console.error(
      JSON.stringify({
        event: 'outbox.claim_failed',
        correlationId,
        category: 'OUTBOX_CLAIM_FAILED',
        error: summary.error,
        timestamp: new Date().toISOString(),
      }),
    );
    return summary;
  }

  if (claimedItems === null || !Array.isArray(claimedItems)) {
    summary.state = 'malformed_claim_response';
    summary.errorCategory = 'OUTBOX_CLAIM_MALFORMED';
    summary.error = 'Claim RPC returned malformed non-array response';
    console.error(
      JSON.stringify({
        event: 'outbox.claim_malformed_response',
        correlationId,
        category: 'OUTBOX_CLAIM_MALFORMED',
        timestamp: new Date().toISOString(),
      }),
    );
    return summary;
  }

  if (claimedItems.length === 0) {
    summary.state = 'empty';
    return summary;
  }

  try {
    for (const rawItem of claimedItems) {
      summary.processed++;

      // Strict structural validation of claimed outbox item
      if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
        summary.failed++;
        summary.details.push({
          id: 'unknown',
          effectType: 'unknown',
          status: 'failed',
          error: 'MALFORMED_OUTBOX_ITEM: item is not an object',
        });
        console.warn(
          JSON.stringify({
            event: 'outbox.item_malformed',
            category: 'OUTBOX_ITEM_MALFORMED',
            correlationId,
            timestamp: new Date().toISOString(),
          }),
        );
        continue;
      }

      const item = rawItem as Record<string, unknown>;
      const itemId = typeof item.id === 'string' ? item.id.trim() : '';
      const claimToken =
        typeof item.claim_token === 'string'
          ? item.claim_token.trim()
          : typeof item.claimToken === 'string'
            ? item.claimToken.trim()
            : '';
      const effectType = typeof item.effect_type === 'string' ? item.effect_type.trim() : '';
      const rawPayload = item.payload;
      const payload =
        rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload)
          ? (rawPayload as Record<string, unknown>)
          : {};

      if (!itemId || !claimToken) {
        summary.failed++;
        const reason = !itemId
          ? 'MALFORMED_OUTBOX_ITEM: missing or empty id'
          : 'MALFORMED_OUTBOX_ITEM: missing or empty claim_token';
        summary.details.push({
          id: itemId || 'unknown',
          effectType: effectType || 'unknown',
          status: 'failed',
          error: reason,
        });
        console.warn(
          JSON.stringify({
            event: 'outbox.item_malformed',
            itemId: itemId || 'unknown',
            category: 'OUTBOX_ITEM_MALFORMED',
            error: reason,
            correlationId,
            timestamp: new Date().toISOString(),
          }),
        );
        continue;
      }

      let itemSuccess = false;
      let itemError: string | undefined;

      try {
        if (effectType === 'cache_invalidation') {
          // In Next.js runtime, revalidatePath revalidates routes.
          // Errors are NOT swallowed; failures mark the item failed for retry.
          const { revalidatePath } = await import('next/cache');
          revalidatePath('/');
          revalidatePath('/stories');
          const slug = (payload.slug as string) || undefined;
          if (slug) {
            revalidatePath(`/story/${slug}`);
          }
          itemSuccess = true;
        } else if (effectType === 'event_dispatch') {
          ensureCanonicalEventConsumers();
          const { eventBus } = await import('@/lib/events/event-bus');
          const idempotencyKey = `outbox:${itemId}`;
          const publishRes = await eventBus.publishAsync(
            {
              type: 'story:published',
              payload: {
                storyId: (payload.story_id || payload.storyId) as string,
                scheduleId: (payload.schedule_id || payload.scheduleId) as string,
                slug: (payload.slug as string) || undefined,
                version: (payload.version as number) || 1,
                publishedAt: (payload.published_at || payload.publishedAt) as string || new Date().toISOString(),
                publisherId: (payload.actor || payload.publisherId) as string || 'system-scheduler',
                gatePassed: true,
                idempotencyKey,
                outboxId: itemId,
              },
            },
            { minSubscribers: 1 },
          );

          if (!publishRes || publishRes.deliveredCount === 0) {
            throw new Error('NO_EVENT_CONSUMERS: event_dispatch delivered to 0 consumers');
          }
          itemSuccess = true;
        } else {
          itemError = `Unknown effect_type: ${effectType}`;
        }
      } catch (effectErr: unknown) {
        itemError = sanitizeDiagnosticError(effectErr);
        itemSuccess = false;
      }

      if (itemSuccess) {
        let completeResult: { success?: boolean; code?: string } | null = null;
        let completeRpcErr: unknown = null;
        try {
          const { data, error } = await (db as any).rpc('fn_complete_publication_outbox', {
            p_outbox_id: itemId,
            p_claim_token: claimToken,
            p_status: 'completed',
          });
          completeResult = data as { success?: boolean; code?: string } | null;
          completeRpcErr = error;
        } catch (rpcEx) {
          completeRpcErr = rpcEx;
        }

        const isExplicitCompleted =
          !completeRpcErr &&
          completeResult !== null &&
          typeof completeResult === 'object' &&
          completeResult.success === true &&
          completeResult.code === 'COMPLETED';

        if (isExplicitCompleted) {
          summary.succeeded++;
          summary.details.push({ id: itemId, effectType, status: 'completed' });
        } else {
          summary.failed++;
          const failureReason = completeRpcErr
            ? 'RPC_COMPLETION_ERROR'
            : (completeResult?.code || 'MALFORMED_COMPLETION_RESPONSE');
          summary.details.push({
            id: itemId,
            effectType,
            status: 'failed',
            error: failureReason,
          });
          console.warn(
            JSON.stringify({
              event: 'outbox.completion_failed',
              itemId,
              effectType,
              category: 'OUTBOX_COMPLETION_FAILED',
              code: failureReason,
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } else {
        summary.failed++;
        const sanitizedItemError = sanitizeDiagnosticError(itemError || 'Outbox effect execution failed');
        let failRecordResult: { success?: boolean; code?: string } | null = null;
        let failRecordRpcErr: unknown = null;
        try {
          const { data, error } = await (db as any).rpc('fn_complete_publication_outbox', {
            p_outbox_id: itemId,
            p_claim_token: claimToken,
            p_status: 'failed',
            p_error: sanitizedItemError,
          });
          failRecordResult = data as { success?: boolean; code?: string } | null;
          failRecordRpcErr = error;
        } catch (rpcEx) {
          failRecordRpcErr = rpcEx;
        }

        const isFailureRecorded =
          !failRecordRpcErr &&
          failRecordResult !== null &&
          typeof failRecordResult === 'object' &&
          failRecordResult.success === true &&
          failRecordResult.code === 'FAILED';

        if (isFailureRecorded) {
          summary.details.push({
            id: itemId,
            effectType,
            status: 'failed',
            error: sanitizedItemError,
          });
        } else {
          const recordingFailureReason = failRecordRpcErr
            ? 'FAILURE_RECORDING_RPC_ERROR'
            : (failRecordResult?.code ? `FAILURE_RECORDING_${failRecordResult.code}` : 'FAILURE_RECORDING_MALFORMED_RESPONSE');
          summary.details.push({
            id: itemId,
            effectType,
            status: 'failed',
            error: `${sanitizedItemError} [recording_error: ${recordingFailureReason}]`,
            failureRecordError: recordingFailureReason,
          });
          console.warn(
            JSON.stringify({
              event: 'outbox.failure_recording_failed',
              itemId,
              effectType,
              category: 'OUTBOX_COMPLETION_FAILED',
              code: recordingFailureReason,
              timestamp: new Date().toISOString(),
            }),
          );
        }
      }
    }

    if (summary.failed > 0) {
      summary.state = 'partial_failure';
      summary.errorCategory = 'OUTBOX_PARTIAL_FAILURE';
    } else {
      summary.state = 'claimed';
    }
  } catch (err) {
    summary.state = 'partial_failure';
    summary.errorCategory = 'OUTBOX_RECOVERY_FAILED';
    summary.error = sanitizeDiagnosticError(err);
    console.error(
      JSON.stringify({
        event: 'outbox.recovery_batch_failed',
        correlationId,
        category: 'OUTBOX_RECOVERY_FAILED',
        error: summary.error,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  return summary;
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

export interface BlockScheduleEntryAtomicParams {
  scheduleId: string;
  storyId: string;
  claimedValidatedAt: string;
  claimTimeMs: number;
  blockReason: string;
  result: PublicationGateResult;
  db: ReturnType<typeof getServiceClient>;
}

export interface BlockScheduleEntryAtomicResult {
  success: boolean;
  code: string;
  error?: string;
}

/**
 * Atomically transitions an editorial schedule entry to 'blocked' status
 * and persists the matching failure publication_gate_log audit record.
 * Uses fn_block_schedule_entry_fenced in PostgreSQL to ensure the schedule
 * mutation and audit log commit together in a single transaction.
 */
export async function blockScheduleEntryAtomic(
  params: BlockScheduleEntryAtomicParams,
): Promise<BlockScheduleEntryAtomicResult> {
  const isLeaseExpired = Date.now() - params.claimTimeMs >= SCHEDULE_CLAIM_LEASE_DURATION_MS;
  if (isLeaseExpired) {
    return {
      success: false,
      code: 'SCHEDULE_LEASE_EXPIRED',
      error: 'Schedule claim lease expired before block transition',
    };
  }

  // 1. If database client exposes rpc (e.g. Supabase client), use canonical atomic RPC
  if (params.db && typeof (params.db as any).rpc === 'function') {
    try {
      const { data, error } = await (params.db as any).rpc('fn_block_schedule_entry_fenced', {
        p_schedule_id: params.scheduleId,
        p_story_id: params.storyId,
        p_expected_validated_at: params.claimedValidatedAt,
        p_block_reason: params.blockReason,
        p_gate_checks: params.result.checks,
        p_gate_checked_at: params.result.checkedAt || new Date().toISOString(),
        p_triggered_by: params.result.triggeredBy || 'cron',
      });

      if (error) {
        const isAuditSpecific = typeof error.message === 'string' && error.message.includes('AUDIT_LOG_FAILED');
        return {
          success: false,
          code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : 'DATABASE_ERROR',
          error: sanitizeDiagnosticError(error.message || 'Atomic block RPC failed'),
        };
      }

      if (!data || typeof data !== 'object') {
        return {
          success: false,
          code: 'DATABASE_ERROR',
          error: 'Atomic block RPC returned invalid response',
        };
      }

      if (!data.success) {
        const isAuditSpecific = typeof data.error === 'string' && data.error.includes('AUDIT_LOG_FAILED');
        return {
          success: false,
          code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : (data.code || 'DATABASE_ERROR'),
          error: sanitizeDiagnosticError(data.error || 'Atomic block RPC reported failure'),
        };
      }

      return {
        success: true,
        code: 'BLOCKED',
      };
    } catch (rpcEx: any) {
      const isAuditSpecific = typeof rpcEx?.message === 'string' && rpcEx.message.includes('AUDIT_LOG_FAILED');
      return {
        success: false,
        code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : 'DATABASE_ERROR',
        error: sanitizeDiagnosticError(rpcEx?.message || 'Atomic block RPC invocation threw exception'),
      };
    }
  }

  // 2. In memory / mock test environment where db.rpc is absent:
  // Must insert gate log first; only if log succeeds, mutate schedule status.
  try {
    await logGateResult(params.result);
  } catch (auditErr: any) {
    return {
      success: false,
      code: 'AUDIT_LOG_FAILED',
      error: sanitizeDiagnosticError(auditErr?.message || 'Failed to record gate result audit entry'),
    };
  }

  if (params.db && typeof (params.db as any).from === 'function') {
    try {
      const nowIso = new Date().toISOString();
      const { data: updatedRows, error: updateErr } = await (params.db as any)
        .from('editorial_schedule')
        .update({
          status: 'blocked',
          block_reason: params.blockReason,
          blocked_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', params.scheduleId)
        .eq('status', 'validated')
        .eq('validated_at', params.claimedValidatedAt)
        .select('id');

      if (updateErr) {
        return {
          success: false,
          code: 'DATABASE_ERROR',
          error: sanitizeDiagnosticError(updateErr.message || 'Database update failed'),
        };
      }

      const isUpdated = Boolean(
        Array.isArray(updatedRows) ? updatedRows.length > 0 : updatedRows
      );
      if (!isUpdated) {
        return {
          success: false,
          code: 'SCHEDULE_LEASE_LOST',
          error: 'Schedule lease was lost or already claimed by another worker',
        };
      }
    } catch (dbEx: any) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: sanitizeDiagnosticError(dbEx?.message || 'Database update threw exception'),
      };
    }
  }

  return {
    success: true,
    code: 'BLOCKED',
  };
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

/**
 * Ensures that canonical platform event consumers (such as GraphProjectionService)
 * are initialized and subscribed to the EventBus. If services have not yet been
 * initialized in this runtime isolate, bootstraps canonical services first.
 */
export function ensureCanonicalEventConsumers(): void {
  let services: import('@/services/registry').Services | null = null;
  try {
    const { getServices } = require('@/services/registry');
    services = getServices();
  } catch {
    // Services were not initialized in this process/isolate; bootstrap canonical services
    try {
      const { initCanonicalServices } = require('@/services/init');
      services = initCanonicalServices();
    } catch {
      // Services may not be initialized in isolated test harness
    }
  }

  if (services?.graph && typeof services.graph.subscribeToEvents === 'function') {
    services.graph.subscribeToEvents();
  }
}

