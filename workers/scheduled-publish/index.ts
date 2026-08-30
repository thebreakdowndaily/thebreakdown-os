/**
 * Cloudflare Cron Worker — Editorial Calendar Autonomous Publishing
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * This is a standalone Cloudflare Worker that handles Cron Trigger events.
 * It reuses the existing publish-due service and publication gate from the
 * main application — zero duplicated business logic.
 *
 * Architecture:
 *   Cloudflare Cron Trigger (hourly)
 *     → scheduled()
 *       → publishDueStories() from services/editorial/schedule.ts
 *         → publication gate (10 checks)
 *           → publish or block
 *
 * Environment variables required:
 *   SUPABASE_URL              — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (bypasses RLS)
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
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CRON_SECRET: string;
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
      const results = await publishDueStories(env);

      const published = results.filter(r => r.passed);
      const blocked = results.filter(r => !r.passed);
      const duration = Date.now() - startTime;

      console.log(JSON.stringify({
        event: 'editorial.publish_due.complete',
        timestamp: new Date().toISOString(),
        duration,
        totalChecked: results.length,
        published: published.length,
        blocked: blocked.length,
        details: results.map(r => ({
          storyId: r.storyId,
          passed: r.passed,
          failedChecks: r.checks.filter(c => !c.passed).map(c => c.name),
        })),
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(JSON.stringify({
        event: 'editorial.publish_due.failed',
        timestamp: new Date().toISOString(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      // Do not rethrow — Cloudflare will retry on unhandled exceptions,
      // but we want bounded retries. Log and exit cleanly.
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
