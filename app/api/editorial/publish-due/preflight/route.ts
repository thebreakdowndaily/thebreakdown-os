/**
 * Scheduled-publication preflight — READ ONLY.
 *
 * Confirms that the canonical production runtime is reachable and that
 * CRON_SECRET authentication is configured. It intentionally does not read
 * story/schedule tables, evaluate editorial gates, or write any state.
 *
 * Real publication is exclusively performed by ../route.ts. Never call that
 * live route as a connectivity test.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Editorial Cron Preflight] CRON_SECRET not configured — rejecting all requests');
    return NextResponse.json(
      { ok: false, error: 'Server misconfiguration: CRON_SECRET not set' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    mode: 'preflight',
    dryRun: true,
    timestamp: new Date().toISOString(),
    totalChecked: 0,
    gatePassed: 0,
    blocked: 0,
    results: [],
  });
}
