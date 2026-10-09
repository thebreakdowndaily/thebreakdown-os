import { NextRequest, NextResponse } from 'next/server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import {
  PibFeedError,
  pullPibObservations,
  DEFAULT_PIB_FEED_URL,
} from '@/lib/intelligence/pib-adapter';
import { isValidCronRequest } from '@/lib/security/cron-auth';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * GET & POST /api/v2/newsroom/observations/pull
 *
 * Vercel Cron ingestion endpoint. Authenticated via CRON_SECRET matching
 * `Authorization: Bearer <CRON_SECRET>`.
 *
 * Governing documents:
 *   - NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §21 (Persistence & Durability)
 *   - NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md §0 (LIVE
 *     PRODUCTION CONVERGENCE — production ingestion adapter)
 */
async function handlePull(req: NextRequest): Promise<NextResponse> {
  if (!isValidCronRequest(req)) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Invalid or missing cron credentials' },
      { status: 401 }
    );
  }

  try {
    await newsroomIntelligenceCore.ensureLoaded();
    const result = await pullPibObservations(newsroomIntelligenceCore, {
      feedUrl: process.env.PIB_FEED_URL || DEFAULT_PIB_FEED_URL,
    });
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof PibFeedError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    throw err;
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handlePull(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handlePull(req);
}
