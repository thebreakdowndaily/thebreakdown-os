import { NextRequest, NextResponse } from 'next/server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import {
  PibFeedError,
  pullPibObservations,
  DEFAULT_PIB_FEED_URL,
} from '@/lib/intelligence/pib-adapter';

export const maxDuration = 60;

/**
 * POST /api/v2/newsroom/observations/pull
 *
 * Vercel Cron ingestion endpoint. Authenticated by the `x-vercel-cron` header
 * (set only by the Vercel cron scheduler) plus a bearer token matching
 * `CRON_SECRET`. Not reachable by normal users.
 *
 * Governing documents:
 *   - NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §21 (Persistence & Durability)
 *   - NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md §0 (LIVE
 *     PRODUCTION CONVERGENCE — production ingestion adapter)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('x-vercel-cron') !== '1') {
    return NextResponse.json({ error: 'forbidden: cron-only endpoint' }, { status: 403 });
  }

  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
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
