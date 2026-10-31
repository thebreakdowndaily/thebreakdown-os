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
import { isValidCronRequest } from '@/lib/security/cron-auth';
import { recordPublishJobExecution, type PublishJobLedgerRecord } from '@/services/editorial/publish-ledger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  return handlePublishDue(request);
}

export async function POST(request: NextRequest) {
  return handlePublishDue(request);
}

async function handlePublishDue(request: NextRequest) {
  // MANDATORY: CRON_SECRET must be set in the environment.
  // If not set, the endpoint is fully locked down — no requests accepted.
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.error('[Editorial Cron] CRON_SECRET not configured — rejecting all requests');
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET not set' },
      { status: 500 },
    );
  }

  // Verify this is a legitimate cron request via Bearer token
  if (!isValidCronRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing cron credentials' },
      { status: 401 }
    );
  }

  const startTime = Date.now();
  const started_at = new Date(startTime).toISOString();
  const job_id = crypto.randomUUID();

  try {
    const results = await validateAndPublishDueStories();

    const published = results.filter(r => r.passed);
    const blocked = results.filter(r => !r.passed);
    const completed_at = new Date().toISOString();
    const duration_ms = Date.now() - startTime;
    const status: 'success' | 'partial' | 'failed' =
      blocked.length === 0 ? 'success' : 'partial';

    const ledger: PublishJobLedgerRecord = {
      job_id,
      started_at,
      completed_at,
      status,
      stories_checked: results.length,
      stories_published: published.length,
      stories_blocked: blocked.length,
      error: null,
      duration_ms,
    };

    await recordPublishJobExecution(ledger);

    return NextResponse.json({
      ok: true,
      jobId: job_id,
      startedAt: started_at,
      completedAt: completed_at,
      durationMs: duration_ms,
      status,
      timestamp: completed_at,
      totalChecked: results.length,
      published: published.length,
      blocked: blocked.length,
      ledger,
      results: results.map(r => ({
        storyId: r.storyId,
        passed: r.passed,
        checksCount: r.checks.length,
        failedChecks: r.checks.filter(c => !c.passed).map(c => c.name),
      })),
    });
  } catch (error) {
    console.error('[Editorial Cron] Error:', error);
    const completed_at = new Date().toISOString();
    const duration_ms = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    const ledger: PublishJobLedgerRecord = {
      job_id,
      started_at,
      completed_at,
      status: 'failed',
      stories_checked: 0,
      stories_published: 0,
      stories_blocked: 0,
      error: errorMsg,
      duration_ms,
    };

    await recordPublishJobExecution(ledger);

    return NextResponse.json(
      {
        ok: false,
        jobId: job_id,
        status: 'failed',
        durationMs: duration_ms,
        error: errorMsg,
        timestamp: completed_at,
        ledger,
      },
      { status: 500 },
    );
  }
}
