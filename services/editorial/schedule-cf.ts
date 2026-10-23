/**
 * Editorial Schedule - Cloudflare Worker variant
 *
 * In accordance with Phase 4B-2G/2H Unified Publication Authority,
 * Cloudflare Worker cron dispatches exclusively to the central Next.js canonical publication API
 * which runs the authoritative Node.js EvidenceVaultService, cryptographic integrity verification,
 * and fenced atomic publication controls.
 *
 * Direct database RPC fallback (fn_publish_story_with_audit) and synchronous gate bypasses
 * are strictly removed: if canonical dispatch is unauthenticated, unavailable, or fails,
 * all stories remain unpublished and an auditable failure is emitted.
 */

import type { PublicationGateResult } from '@/types/editorial-calendar';

export interface CfEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_URL?: string;
  CRON_SECRET?: string;
}

/**
 * Publish due stories - Cloudflare Worker entry point.
 *
 * Dispatches to the canonical Next.js publication API.
 * Fails closed on missing CRON_SECRET, network errors, timeouts, or non-200 responses.
 */
export async function publishDueStories(
  env: CfEnv,
  now: Date = new Date(),
): Promise<PublicationGateResult[]> {
  const appUrl = env.APP_URL || '';
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret) {
    const reason = 'CRON_SECRET missing: canonical dispatch cannot be authenticated; publication halted';
    console.error(`[Cloudflare Scheduler] Audit Failure: ${reason}`);
    return [
      {
        storyId: 'unknown',
        scheduleId: 'none',
        passed: false,
        checks: [
          {
            name: 'canonical_cron_secret',
            passed: false,
            reason,
          },
        ],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      },
    ];
  }

  if (!appUrl) {
    const reason = 'APP_URL missing: canonical publication endpoint cannot be resolved; publication halted';
    console.error(`[Cloudflare Scheduler] Audit Failure: ${reason}`);
    return [
      {
        storyId: 'unknown',
        scheduleId: 'none',
        passed: false,
        checks: [
          {
            name: 'canonical_app_url',
            passed: false,
            reason,
          },
        ],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      },
    ];
  }

  try {
    const resp = await fetch(`${appUrl}/api/editorial/publish-due`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) {
      const reason = `Canonical cron dispatch returned HTTP ${resp.status}`;
      console.error(`[Cloudflare Scheduler] Audit Failure: ${reason}`);
      return [
        {
          storyId: 'unknown',
          scheduleId: 'none',
          passed: false,
          checks: [
            {
              name: 'canonical_dispatch_response',
              passed: false,
              reason,
            },
          ],
          checkedAt: now.toISOString(),
          triggeredBy: 'cron',
        },
      ];
    }

    const body = (await resp.json()) as any;
    return body.results || [];
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    const reason = isTimeout
      ? 'Canonical cron dispatch timed out (10s)'
      : `Canonical cron dispatch failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Cloudflare Scheduler] Audit Failure: ${reason}`);
    return [
      {
        storyId: 'unknown',
        scheduleId: 'none',
        passed: false,
        checks: [
          {
            name: 'canonical_dispatch_reachability',
            passed: false,
            reason,
          },
        ],
        checkedAt: now.toISOString(),
        triggeredBy: 'cron',
      },
    ];
  }
}
