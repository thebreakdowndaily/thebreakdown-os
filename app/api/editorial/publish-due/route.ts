/**
 * Editorial Calendar — Publishing Cron Job
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * Triggered hourly by the deployment platform's cron mechanism.
 * Validates due stories and publishes them if they pass the gate.
 * Every gate check is logged. Every failure is blocked.
 *
 * SECURITY: CRON_SECRET must be set. The endpoint is fully protected
 * by a shared secret. Without the correct Bearer token, all requests
 * are rejected with 401.
 *
 * DEPLOYMENT NOTE: This project deploys to Cloudflare Workers via
 * OpenNext/wrangler. Vercel cron jobs (vercel.json) do NOT fire on
 * Cloudflare. For autonomous publishing, a Cloudflare Cron Worker
 * trigger or equivalent must be configured separately. See deployment
 * blocker note in the final report.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAndPublishDueStories } from '@/services/editorial/schedule';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  // MANDATORY: CRON_SECRET must be set in the environment.
  // If not set, the endpoint is fully locked down — no requests accepted.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Editorial Cron] CRON_SECRET not configured — rejecting all requests');
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET not set' },
      { status: 500 },
    );
  }

  // Verify this is a legitimate cron request via Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await validateAndPublishDueStories();

    const published = results.filter(r => r.passed);
    const blocked = results.filter(r => !r.passed);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      totalChecked: results.length,
      published: published.length,
      blocked: blocked.length,
      results: results.map(r => ({
        storyId: r.storyId,
        passed: r.passed,
        checksCount: r.checks.length,
        failedChecks: r.checks.filter(c => !c.passed).map(c => c.name),
      })),
    });
  } catch (error) {
    console.error('[Editorial Cron] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
