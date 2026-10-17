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
import type { PublicationGateResult } from '@/types/editorial-calendar';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export type EditorialPublishOutcome = 'published' | 'already_published' | 'blocked' | 'skipped';

function classifyGateResult(result: PublicationGateResult): EditorialPublishOutcome {
  if (result.checks.some(c => c.name === 'already_published')) {
    return 'already_published';
  }
  if (result.checks.some(c => c.name === 'already_claimed')) {
    return 'skipped';
  }
  if (result.passed) {
    return 'published';
  }
  return 'blocked';
}

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
    const rawResults = await validateAndPublishDueStories();

    const categorized = rawResults.map(r => ({
      raw: r,
      outcome: classifyGateResult(r),
    }));

    const newlyPublished = categorized.filter(c => c.outcome === 'published');
    const alreadyPublished = categorized.filter(c => c.outcome === 'already_published');
    const blocked = categorized.filter(c => c.outcome === 'blocked');
    const skipped = categorized.filter(c => c.outcome === 'skipped');

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      totalChecked: rawResults.length,
      published: newlyPublished.length,
      alreadyPublished: alreadyPublished.length,
      blocked: blocked.length,
      skipped: skipped.length,
      results: categorized.map(c => ({
        storyId: c.raw.storyId,
        passed: c.raw.passed,
        outcome: c.outcome,
        checksCount: c.raw.checks.length,
        failedChecks: c.raw.checks.filter(chk => !chk.passed).map(chk => chk.name),
      })),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const safeMsg = cronSecret ? errorMsg.replaceAll(cronSecret, '[REDACTED]') : errorMsg;
    console.error('[Editorial Cron] Scheduled publishing run failed:', safeMsg);

    return NextResponse.json(
      {
        ok: false,
        error: 'An internal error occurred while processing scheduled publishing',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
