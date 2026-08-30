/**
 * Editorial Schedule — Cloudflare Worker variant
 *
 * This module reuses the publication gate and audit logging from the main
 * service but accepts Cloudflare Worker environment bindings instead of
 * using the Next.js Supabase client singleton.
 *
 * One business logic path, two invocation surfaces:
 *   - services/editorial/schedule.ts (Next.js server actions / HTTP cron)
 *   - services/editorial/schedule-cf.ts (Cloudflare scheduled handler)
 */

import { createClient } from '@supabase/supabase-js';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import type { PublicationGateResult } from '@/types/editorial-calendar';
import type { TypedDatabase } from '@/supabase/client';

type DbClient = ReturnType<typeof createClient<TypedDatabase>>;

interface CfEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function getCfDb(env: CfEnv): DbClient {
  return createClient<TypedDatabase>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Publish due stories — Cloudflare Worker entry point.
 *
 * Identical logic to validateAndPublishDueStories() in schedule.ts,
 * but uses env-bound Supabase client instead of getServiceClient().
 *
 * Concurrency safety: uses atomic WHERE status='...' on both schedule
 * and story updates. If another invocation already processed the entry,
 * the updates affect 0 rows and we skip.
 */
export async function publishDueStories(
  env: CfEnv,
  now: Date = new Date(),
): Promise<PublicationGateResult[]> {
  const db = getCfDb(env);
  const results: PublicationGateResult[] = [];
  const today = now.toISOString().split('T')[0];

  // Only pick entries with status 'validated' or 'ready'
  const { data: dueEntries, error: fetchError } = await db
    .from('editorial_schedule')
    .select('*')
    .in('status', ['validated', 'ready'])
    .lte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('priority', { ascending: false });

  if (fetchError) throw fetchError;

  for (const entry of dueEntries || []) {
    const result = await processEntry(db, entry, now);
    results.push(result);
  }

  return results;
}

async function processEntry(
  db: DbClient,
  entry: Record<string, unknown>,
  now: Date,
): Promise<PublicationGateResult> {
  const storyId = entry.story_id as string;
  const scheduleId = entry.id as string;
  const currentStatus = entry.status as string;

  // ── ATOMIC CLAIM: transition schedule from current status → 'validated'
  const { data: claimed, error: claimError } = await db
    .from('editorial_schedule')
    .update({ status: 'validated', updated_at: now.toISOString() })
    .eq('id', scheduleId)
    .eq('status', currentStatus)
    .select()
    .single();

  if (claimError || !claimed) {
    return {
      storyId,
      scheduleId,
      passed: false,
      checks: [{
        name: 'already_claimed',
        passed: false,
        reason: `Schedule entry already processed (current status: ${currentStatus})`,
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
      checks: [{ name: 'story_exists', passed: false, reason: 'Story not found' }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGate(db, result);
    return result;
  }

  // ── IDEMPOTENCY GUARD
  if (storyRow.status === 'published') {
    const result: PublicationGateResult = {
      storyId,
      scheduleId,
      passed: true,
      checks: [{ name: 'already_published', passed: true, reason: 'Already published — skipping' }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
    await logGate(db, result);
    await db
      .from('editorial_schedule')
      .update({ status: 'published', published_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', scheduleId)
      .neq('status', 'published');
    return result;
  }

  // ── Convert to canonical Story shape
  const status = (storyRow.status as string) || 'draft';
  const publicationStatus =
    status === 'published' ? 'published'
    : status === 'scheduled' ? 'scheduled'
    : status === 'review' ? 'review'
    : 'draft';

  const story = {
    id: storyRow.id,
    slug: storyRow.slug,
    title: storyRow.title,
    headline: storyRow.headline || storyRow.title,
    summary: storyRow.summary || '',
    heroImage: storyRow.hero_image || '',
    author: storyRow.author || '',
    category: storyRow.category || '',
    status,
    publicationStatus,
    storyType: 'standard',
    evidenceScore: storyRow.evidence_score || 0,
    readingTime: storyRow.reading_time || 0,
    publishedAt: storyRow.published_at || '',
    createdAt: storyRow.created_at,
    updatedAt: storyRow.updated_at,
    updatedBy: storyRow.updated_by || undefined,
    tags: storyRow.tags || [],
    blocks: storyRow.blocks || [],
    sources: storyRow.sources || [],
    claims: storyRow.claims || [],
    timeline: storyRow.timeline || [],
    faq: storyRow.faq || [],
    charts: storyRow.charts || [],
    relatedStoryIds: storyRow.related_story_ids || [],
    relatedEntityIds: storyRow.related_entity_ids || [],
    relatedTopicIds: storyRow.related_topic_ids || [],
    blockReason: storyRow.block_reason || undefined,
  };

  // ── Run publication gate
  const result = validateStoryForPublication(
    { storyId, scheduleId, triggeredBy: 'cron' },
    story as never,
    now,
  );

  await logGate(db, result);

  if (result.passed) {
    // ── PUBLISH with atomic guard
    const publishedAt = now.toISOString();
    const { count } = await db
      .from('stories')
      .update({ status: 'published', published_at: publishedAt, updated_at: publishedAt })
      .eq('id', storyId)
      .neq('status', 'published');

    if (count === 0) {
      result.checks.push({
        name: 'concurrent_publish_prevented',
        passed: true,
        reason: 'Another invocation published concurrently — no duplicate',
      });
    }

    await db
      .from('editorial_schedule')
      .update({ status: 'published', published_at: publishedAt, updated_at: publishedAt })
      .eq('id', scheduleId);
  } else {
    // ── BLOCK
    const failedChecks = result.checks.filter(c => !c.passed);
    const blockReason = failedChecks.map(c => c.reason).join('; ');

    await db
      .from('editorial_schedule')
      .update({
        status: 'blocked',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', scheduleId);

    await db
      .from('stories')
      .update({
        status: 'review',
        block_reason: blockReason,
        blocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', storyId)
      .neq('status', 'published');
  }

  return result;
}

async function logGate(
  db: DbClient,
  result: PublicationGateResult,
): Promise<void> {
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
