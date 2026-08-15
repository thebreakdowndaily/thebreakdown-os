import { NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

export async function GET() {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }

  await newsroomIntelligenceCore.ensureLoaded();
  const gaps = newsroomIntelligenceCore.getCoverageGaps();
  return NextResponse.json({
    gaps,
    total: gaps.length,
  });
}
