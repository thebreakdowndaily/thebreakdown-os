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
      const safeMsg = env.CRON_SECRET ? rawMsg.replaceAll(env.CRON_SECRET, '[REDACTED]') : rawMsg;
      console.error(JSON.stringify({
        event: 'editorial.publish_due.failed',
        timestamp: new Date().toISOString(),
        duration,
        error: safeMsg,
      }));
      // Re-throw so the platform records the scheduled invocation as failed.
      // The dispatcher has no lower-authority database fallback.
      throw error;
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
