import { NextRequest, NextResponse } from 'next/server';
import { RadarPipeline } from '@/services/radar/pipeline';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import { isValidCronRequest } from '@/lib/security/cron-auth';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/v2/radar/poll
 * GET /api/v2/radar/poll (for cron runners and monitoring probes)
 *
 * Continuous sensing endpoint for The Breakdown News Radar.
 * Authenticated via CRON_SECRET (matching Authorization: Bearer <secret>) or x-api-key.
 *
 * Response schema matches Operating Standard §3:
 * {
 *   runId: string,
 *   sourcesConsidered: number,
 *   sourcesPolled: number,
 *   successful: number,
 *   failed: number,
 *   newArtifacts: number,
 *   changedArtifacts: number,
 *   unchanged: number,
 *   eventsOrSignalsCreated: number,
 *   durationMs: number
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handlePoll(req);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handlePoll(req);
}

async function handlePoll(req: NextRequest): Promise<NextResponse> {
  const isCronAuthorized = isValidCronRequest(req);
  const hasApiKey = Boolean(req.headers.get('x-api-key'));
  const isAuthorized = isCronAuthorized || hasApiKey;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'unauthorized: invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const forceAll = req.nextUrl.searchParams.get('force') === 'true';
    const pipeline = new RadarPipeline(MP_RADAR_SOURCES);
    const metrics = await pipeline.poll({ forceAll });

    const responsePayload = {
      runId: metrics.runId,
      sourcesConsidered: metrics.sourcesConsidered,
      sourcesPolled: metrics.sourcesPolled,
      successful: metrics.successful,
      failed: metrics.failed,
      newArtifacts: metrics.newArtifacts,
      changedArtifacts: metrics.changedArtifacts,
      unchanged: metrics.unchanged,
      eventsOrSignalsCreated: metrics.eventsOrSignalsCreated,
      durationMs: metrics.cycleDurationMs,
      status: metrics.status,
      error: metrics.error,
      medianDetectionLatencyMs: metrics.medianDetectionLatencyMs,
      p90DetectionLatencyMs: metrics.p90DetectionLatencyMs,
    };

    if (metrics.status === 'failed' && metrics.error?.includes('Concurrency lock')) {
      return NextResponse.json(responsePayload, { status: 409 });
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'radar_poll_failure',
        message: err instanceof Error ? err.message : 'Internal pipeline error',
      },
      { status: 500 }
    );
  }
}
