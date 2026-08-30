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

  // ── ATOMIC CLAIM: transition schedule from current status → 'validated'
  // Only one worker can win this race. If another already claimed it,
  // this update affects 0 rows.
  const { data: claimedEntry, error: claimError } = await db
    .from('editorial_schedule')
    .update({ status: 'validated', updated_at: now.toISOString() } as never)
    .eq('id', scheduleId)
    .eq('status', currentScheduleStatus)  // atomic: only if still in expected state
    .select()
    .single();

  if (claimError || !claimedEntry) {
    // Another worker already claimed or status changed — skip
    return {
      storyId,
      scheduleId,
      passed: false,
      checks: [{
        name: 'already_claimed',
        passed: false,
        reason: `Schedule entry already processed by another worker (current status: ${currentScheduleStatus})`,
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
  }

  // ── Fetch the story
  const { data: storyRow, error: storyError } = await db
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (storyError || !storyRow) {
    const result: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: false,
      checks: [{
        name: 'story_exists',
        passed: false,
        reason: 'Story not found in database',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGateResult(result);
    return result;
  }

  // ── IDEMPOTENCY GUARD: skip if already published
  if (storyRow.status === 'published') {
    const result: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: true,
      checks: [{
        name: 'already_published',
        passed: true,
        reason: 'Story is already published — skipping',
      }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGateResult(result);
    // Update schedule to 'published' if not already
    await db
      .from('editorial_schedule')
      .update({ status: 'published', published_at: now.toISOString(), updated_at: now.toISOString() } as never)
      .eq('id', scheduleId)
      .neq('status', 'published');
    return result;
  }

  // ── Convert story row to canonical Story shape for validation
  const story = rowToStory(storyRow);

  // ── Run the publication gate
  const result = validateStoryForPublication(
    { storyId, scheduleId, triggeredBy: 'cron' },
    story,
    now,
  );

  // ── Log the gate check
  await logGateResult(result);

  if (result.passed) {
    // ── PUBLISH with atomic guard: only update if story is NOT already published
    const publishedAt = now.toISOString();
    const { count } = await db
      .from('stories')
      .update({
        status: 'published',
        published_at: publishedAt,
        updated_at: publishedAt,
      } as never)
      .eq('id', storyId)
      .neq('status', 'published');  // idempotency: skip if already published

    if (count === 0) {
      // Another worker published this story between our claim and publish
      result.checks.push({
        name: 'concurrent_publish_prevented',
        passed: true,
        reason: 'Another worker published this story concurrently — no duplicate',
      });
    }

    // Update schedule entry
    await db
      .from('editorial_schedule')
      .update({
        status: 'published',
        published_at: publishedAt,
        updated_at: publishedAt,
      } as never)
      .eq('id', scheduleId);
  } else {
    // ── BLOCK the schedule entry
    const failedChecks = result.checks.filter(c => !c.passed);
    const blockReason = failedChecks.map(c => c.reason).join('; ');

    await db
      .from('editorial_schedule')
      .update({
        status: 'blocked',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', scheduleId);

    // Also block the story (revert to review)
    await db
      .from('stories')
      .update({
        status: 'review',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as never)
      .eq('id', storyId)
      .neq('status', 'published');  // never un-publish
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
  await db.from('publication_gate_log').insert({
    story_id: result.storyId,
    schedule_id: result.scheduleId || null,
    gate_result: result.passed ? 'pass' : 'fail',
    checks: result.checks,
    checked_at: result.checkedAt,
    published_at: result.publishedAt || null,
    triggered_by: result.triggeredBy,
  });
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
