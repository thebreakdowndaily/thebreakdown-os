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
import {
  RECOGNIZED_EDITORIAL_PUBLISH_OUTCOMES,
  type EditorialPublishOutcome,
  type PostPublicationErrorCategory,
  type PublicationGateResult,
} from '@/types/editorial-calendar';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export type { EditorialPublishOutcome, PostPublicationErrorCategory };

function logOutcomeAnomaly(
  result: PublicationGateResult,
  event: 'editorial.publish_due.unknown_outcome' | 'editorial.publish_due.inconsistent_outcome',
  reason: string,
): void {
  console.warn(
    JSON.stringify({
      event,
      storyId: result.storyId,
      scheduleId: result.scheduleId,
      passed: result.passed,
      outcome: result.outcome ?? null,
      reason,
      classification: 'blocked',
      timestamp: new Date().toISOString(),
    }),
  );
}

function classifyGateResult(result: PublicationGateResult): EditorialPublishOutcome {
  const { outcome, passed, checks } = result;

  // 1. Missing or unrecognized outcome -> fail closed to 'blocked'
  if (!outcome || !RECOGNIZED_EDITORIAL_PUBLISH_OUTCOMES.includes(outcome as EditorialPublishOutcome)) {
    logOutcomeAnomaly(
      result,
      'editorial.publish_due.unknown_outcome',
      !outcome ? 'missing_outcome' : 'unrecognized_outcome',
    );
    return 'blocked';
  }

  const hasFailedCheck = checks.some(c => !c.passed);
  const hasAlreadyPublishedMarker = checks.some(c => c.name === 'already_published');
  const hasAlreadyClaimedMarker = checks.some(c => c.name === 'already_claimed');

  // 2. Explicit 'blocked' outcome:
  // Must NEVER be overridden by check names (e.g. already_published or already_claimed).
  // If contradictory markers exist or passed is true, log inconsistency and remain blocked.
  if (outcome === 'blocked') {
    if (passed === true || hasAlreadyPublishedMarker || hasAlreadyClaimedMarker) {
      logOutcomeAnomaly(
        result,
        'editorial.publish_due.inconsistent_outcome',
        'blocked_with_contradictory_state_or_markers',
      );
    }
    return 'blocked';
  }

  // 3. Explicit 'published' outcome:
  // Requires passed === true, zero failed checks, and no conflicting markers.
  if (outcome === 'published') {
    if (passed !== true || hasFailedCheck || hasAlreadyPublishedMarker || hasAlreadyClaimedMarker) {
      logOutcomeAnomaly(
        result,
        'editorial.publish_due.inconsistent_outcome',
        'published_with_failed_checks_or_invalid_state',
      );
      return 'blocked';
    }
    return 'published';
  }

  // 4. Explicit 'already_published' outcome:
  // Requires passed === true, zero failed checks, and no conflicting skipped markers.
  if (outcome === 'already_published') {
    if (passed !== true || hasFailedCheck || hasAlreadyClaimedMarker) {
      logOutcomeAnomaly(
        result,
        'editorial.publish_due.inconsistent_outcome',
        'already_published_with_inconsistent_state',
      );
      return 'blocked';
    }
    return 'already_published';
  }

  // 5. Explicit 'skipped' outcome:
  // Requires passed === false (did not publish) and no conflicting already_published markers.
  if (outcome === 'skipped') {
    if (passed !== false || hasAlreadyPublishedMarker) {
      logOutcomeAnomaly(
        result,
        'editorial.publish_due.inconsistent_outcome',
        'skipped_with_inconsistent_state',
      );
      return 'blocked';
    }
    return 'skipped';
  }

  // Fall-through safety (unreachable due to RECOGNIZED_EDITORIAL_PUBLISH_OUTCOMES guard)
  logOutcomeAnomaly(result, 'editorial.publish_due.unknown_outcome', 'unhandled_outcome_branch');
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
      results: categorized.map(c => {
        const passed = c.outcome === 'published' || c.outcome === 'already_published';
        let failedChecks = c.raw.checks.filter(chk => !chk.passed).map(chk => chk.name);
        if (c.outcome === 'blocked' && failedChecks.length === 0) {
          failedChecks = ['gate_blocked'];
        } else if (c.outcome === 'published' || c.outcome === 'already_published') {
          failedChecks = [];
        }
        return {
          storyId: c.raw.storyId,
          passed,
          outcome: c.outcome,
          checksCount: c.raw.checks.length,
          failedChecks,
          ...(c.raw.postPublicationError
            ? {
                postPublicationError: true,
                ...(c.raw.postPublicationErrorCategory
                  ? { postPublicationErrorCategory: c.raw.postPublicationErrorCategory }
                  : {}),
                ...(c.raw.correlationId ? { correlationId: c.raw.correlationId } : {}),
              }
            : {}),
        };
      }),
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
