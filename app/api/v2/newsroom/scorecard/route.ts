import { NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

/**
 * GET /api/v2/newsroom/scorecard
 *
 * Live operational scorecard for the newsroom observation period. Read-only —
 * aggregates canonical state timestamps plus the frozen v1.2 baseline reference.
 *
 * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 * (Baseline 1.2 freeze + observation-mode section).
 */
export async function GET() {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  await newsroomIntelligenceCore.ensureLoaded();
  const scorecard = newsroomIntelligenceCore.getScorecard();

  return NextResponse.json({
    scorecard,
  });
}
