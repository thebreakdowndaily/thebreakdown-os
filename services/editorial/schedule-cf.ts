/**
 * Editorial Schedule - Cloudflare Worker variant
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
  APP_URL: string;
  CRON_SECRET: string;
}

function getCfDb(env: CfEnv): DbClient {
  return createClient<TypedDatabase>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Publish due stories - Cloudflare Worker entry point.
 *
 * In accordance with Phase 4B-2G/2H Unified Publication Authority,
 * Cloudflare Worker cron dispatches to the central Next.js publication API
 * which runs the authoritative Node.js EvidenceVaultService and canonical gates.
 */
export async function publishDueStories(
  env: CfEnv,
  now: Date = new Date(),
): Promise<PublicationGateResult[]> {
  const appUrl = env.APP_URL;
  const cronSecret = env.CRON_SECRET;

  if (cronSecret) {
    try {
      const resp = await fetch(`${appUrl}/api/editorial/publish-due`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      if (resp.ok) {
        const body = (await resp.json()) as any;
        return body.results || [];
      }
      console.error(`[Cloudflare Scheduler] Canonical cron dispatch returned ${resp.status}`);
    } catch (err) {
      console.error('[Cloudflare Scheduler] Canonical cron dispatch failed:', err);
    }
  }

  // If internal endpoint not configured or dispatch fails, fallback to RPC-based database transition
  console.warn('[Cloudflare Scheduler] Canonical dispatch failed. Falling back to RPC execution.');
  const db = getCfDb(env);
  const results: PublicationGateResult[] = [];
  
  let hasMore = true;
  while (hasMore) {
    const result = await processNextEntry(db, now);
    if (result) {
      results.push(result);
    } else {
      hasMore = false;
    }
  }

  return results;
}

async function processNextEntry(
  db: DbClient,
  now: Date,
): Promise<PublicationGateResult | null> {
  // ⚡ ATOMIC CLAIM: transition next due schedule to 'validated' via RPC
  const { data: claimed, error: claimError } = await (db as any).rpc('fn_claim_due_schedule_entry');

  if (claimError || !claimed || !claimed.claimed_story_id) {
    return null; // No more due entries or claim failed
  }

  const storyId = claimed.claimed_story_id as string;
  const scheduleId = claimed.schedule_id as string;

  // ⚡ Fetch the story
  const { data: storyRow, error: storyError } = await db
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (storyError || !storyRow) {
    // If the story doesn't exist, we just return a failure result without raw gate log mutation
    // since the RPC contract does not expose direct INSERT to publication_gate_log
    return {
      storyId,
      scheduleId,
      passed: false,
      checks: [{ name: 'story_exists', passed: false, reason: 'Story not found' }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
  }

  // ⚡ IDEMPOTENCY GUARD
  if (storyRow.status === 'published') {
    return {
      storyId,
      scheduleId,
      passed: true,
      checks: [{ name: 'already_published', passed: true, reason: 'Already published - skipping' }],
      checkedAt: now.toISOString(),
      triggeredBy: 'cron',
    };
  }

  // ⚡ Convert to canonical Story shape
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

  // ⚡ Run publication gate locally
  const result = validateStoryForPublication(
    { storyId, scheduleId, triggeredBy: 'cron' },
    story as never,
    now,
  );

  if (result.passed) {
    // ⚡ PUBLISH via RPC (Atomically updates story to 'published' and inserts audit log)
    const { error: publishError } = await (db as any).rpc('fn_publish_story_with_audit', { p_story_id: storyId });

    if (publishError) {
      result.passed = false;
      result.checks.push({
        name: 'rpc_publish_error',
        passed: false,
        reason: publishError.message,
      });
    } else {
      result.publishedAt = now.toISOString();
    }
  } else {
    // ⚡ BLOCK
    // The RPC contract restricts updating editorial_schedule and raw INSERTs to publication_gate_log.
    // The failed checks remain in the returned result object, but are not persisted to DB by this worker.
    // This complies strictly with the privilege boundaries of Phase 6.
  }

  return result;
}
