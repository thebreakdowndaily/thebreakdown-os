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
import type { EditorialPublishOutcome, PublicationGateResult } from '@/types/editorial-calendar';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export type { EditorialPublishOutcome };

function classifyGateResult(result: PublicationGateResult): EditorialPublishOutcome {
  if (result.outcome === 'already_published' || result.checks.some(c => c.name === 'already_published')) {
    return 'already_published';
  }
  if (result.outcome === 'skipped' || result.checks.some(c => c.name === 'already_claimed')) {
    return 'skipped';
  }
  if (
    result.outcome === 'published' &&
    result.passed === true &&
    !result.checks.some(c => !c.passed)
  ) {
    return 'published';
  }
  if (
    !result.outcome &&
    result.passed === true &&
    result.checks.length > 0 &&
    !result.checks.some(c => !c.passed)
  ) {
    return 'published';
  }
  return 'blocked';
}

function categorizePublishingError(error: unknown): string {
  if (!error) return 'UNKNOWN_ERROR';
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();

  if (
    msg.includes('password') ||
    msg.includes('user "') ||
    msg.includes('role "') ||
    msg.includes('credential') ||
    msg.includes('token') ||
    msg.includes('secret') ||
    msg.includes('auth')
  ) {
    return 'DATABASE_AUTH_ERROR';
  }
  if (
    msg.includes('connect') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('host') ||
    msg.includes('network') ||
    msg.includes('socket')
  ) {
    return 'DATABASE_NETWORK_ERROR';
  }
  if (
    msg.includes('syntax') ||
    msg.includes('relation') ||
    msg.includes('table') ||
    msg.includes('column') ||
    msg.includes('query') ||
    msg.includes('sql')
  ) {
    return 'DATABASE_QUERY_ERROR';
  }
  if (error instanceof TypeError) {
    return 'TYPE_ERROR';
  }
  return 'INTERNAL_PUBLISHING_ERROR';
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
        ...(c.raw.postPublicationError ? { postPublicationError: c.raw.postPublicationError } : {}),
      })),
    });
  } catch (error) {
    const correlationId = request.headers.get('x-request-id') || crypto.randomUUID();
    const category = categorizePublishingError(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    console.error(
      '[Editorial Cron] Scheduled publishing run failed:',
      JSON.stringify({
        event: 'editorial.publish_due.failed',
        correlationId,
        category,
        errorName,
        timestamp: new Date().toISOString(),
      }),
    );

    return NextResponse.json(
      {
        ok: false,
        error: 'An internal error occurred while processing scheduled publishing',
        correlationId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
