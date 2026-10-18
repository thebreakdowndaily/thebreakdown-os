/**
 * Cloudflare Cron Worker — Editorial Calendar Autonomous Publishing
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * This is a scheduler/dispatcher only. It never publishes from the Worker and
 * never connects directly to the database. The canonical Next.js endpoint is
 * the sole publication authority and applies the editorial/evidence gates.
 *
 * Architecture:
 *   Cloudflare Cron Trigger (hourly)
 *     → scheduled()
 *       → publishDueStories() in services/editorial/schedule-cf.ts
 *         → HTTPS /api/editorial/publish-due
 *           → canonical editorial, fact-check, evidence, and audit workflow
 *
 * Required bindings: APP_URL (non-secret HTTPS origin) and CRON_SECRET (Worker secret).
 */

import { publishDueStories } from '../../services/editorial/schedule-cf';

// Minimal Cloudflare Worker type declarations (avoids @cloudflare/workers-types dependency)
interface ScheduledController {
  readonly cron: string;
  readonly scheduledTime: number;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  CRON_SECRET: string;
  APP_URL: string;
}

export const SCHEDULED_PUBLISH_PROPAGATED_ERROR = 'Scheduled publishing request failed';

export const APPROVED_CANONICAL_ERROR_MESSAGES = new Set([
  'Canonical publishing APP_URL is not configured',
  'Canonical publishing APP_URL is invalid',
  'Canonical publishing APP_URL must be an HTTPS origin without credentials, path, query, or fragment',
  'Canonical publishing APP_URL host is not trusted',
  'Canonical publishing CRON_SECRET is not configured',
  'Canonical publishing endpoint request failed',
  'Canonical publishing endpoint returned invalid JSON',
  'Canonical publishing endpoint returned an invalid response',
  'Canonical publishing endpoint returned an invalid summary',
  'Canonical publishing endpoint returned an invalid story result',
  'Canonical publishing endpoint returned inconsistent result counts',
]);

export function isApprovedDiagnosticMessage(msg: string): boolean {
  if (APPROVED_CANONICAL_ERROR_MESSAGES.has(msg)) {
    return true;
  }
  return /^Canonical publishing endpoint returned HTTP \d{3}$/.test(msg);
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const startTime = Date.now();

    console.log(JSON.stringify({
      event: 'editorial.publish_due.start',
      timestamp: new Date().toISOString(),
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
    }));

    try {
      const summary = await publishDueStories(env);
      const duration = Date.now() - startTime;

      console.log(JSON.stringify({
        event: 'editorial.publish_due.complete',
        timestamp: new Date().toISOString(),
        duration,
        totalChecked: summary.totalChecked,
        published: summary.published,
        alreadyPublished: summary.alreadyPublished,
        blocked: summary.blocked,
        skipped: summary.skipped,
        details: summary.results,
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      const rawMsg = error instanceof Error ? error.message : 'Unknown error';
      const safeMsg = isApprovedDiagnosticMessage(rawMsg)
        ? rawMsg
        : 'Scheduled publishing request failed due to an upstream error';

      console.error(JSON.stringify({
        event: 'editorial.publish_due.failed',
        timestamp: new Date().toISOString(),
        duration,
        category: 'DISPATCH_ERROR',
        error: safeMsg,
      }));
      // Propagate a sanitized generic error without attaching the raw original exception or cause.
      // This ensures runtime unhandled exception records never disclose sensitive connection info,
      // while still failing the scheduled invocation so Cloudflare monitors the invocation as failed.
      throw new Error(SCHEDULED_PUBLISH_PROPAGATED_ERROR);
    }
  },

  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    return new Response(
      JSON.stringify({
        service: 'thebreakdown-scheduled-publish',
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  },
};
