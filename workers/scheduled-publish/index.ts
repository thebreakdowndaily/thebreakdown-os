/**
 * Cloudflare Cron Worker — Editorial Calendar Autonomous Publishing.
 *
 * This Worker delegates publication to the canonical Next.js API. It must not
 * duplicate editorial policy or directly mutate publication state in Supabase.
 */

import { publishDueStories } from '../../services/editorial/schedule-cf';

interface ScheduledController {
  readonly cron: string;
  readonly scheduledTime: number;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  APP_URL?: string;
  CRON_SECRET?: string;
  DRY_RUN?: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const startTime = Date.now();
    const dryRun = (env.DRY_RUN || 'true').trim() !== 'false';

    console.log(JSON.stringify({
      event: 'editorial.publish_due.start',
      timestamp: new Date().toISOString(),
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
    }));

    try {
      const results = await publishDueStories(env);

      if (dryRun) {
        const failure = results.find((result) => !result.passed);
        if (failure) {
          console.error(JSON.stringify({
            event: 'editorial.publish_due.preflight.failed',
            mode: 'preflight',
            dryRun: true,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            failedChecks: failure.failedChecks,
          }));
        } else {
          console.log(JSON.stringify({
            event: 'editorial.publish_due.preflight.complete',
            mode: 'preflight',
            dryRun: true,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            status: 'ok',
          }));
        }
        return;
      }

      const gatePassed = results.filter((result) => result.passed).length;
      const blocked = results.filter((result) => !result.passed).length;

      console.log(JSON.stringify({
        event: 'editorial.publish_due.complete',
        mode: 'live',
        dryRun: false,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalChecked: results.length,
        gatePassed,
        blocked,
        details: results.map((result) => ({
          storyId: result.storyId,
          passed: result.passed,
          checksCount: result.checksCount,
          failedChecks: result.failedChecks,
        })),
      }));
    } catch (error: unknown) {
      console.error(JSON.stringify({
        event: 'editorial.publish_due.failed',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  },

  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    return new Response(JSON.stringify({
      service: 'thebreakdown-scheduled-publish',
      status: 'ok',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
