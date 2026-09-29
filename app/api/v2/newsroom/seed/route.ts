import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { INTEL_ROLE_ORDER } from '@/features/auth/roles';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { seedNewsroomDemoBaseline } from '@/lib/intelligence/newsroom-demo-baseline';

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json(
      { error: gate.reason },
      { status: gate.reason === 'unauthenticated' ? 401 : 403 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (INTEL_ROLE_ORDER.indexOf(gate.role) < INTEL_ROLE_ORDER.indexOf('editor')) {
    return NextResponse.json(
      { error: 'forbidden: editor or above required to seed signals' },
      { status: 403 }
    );
  }

  await newsroomIntelligenceCore.ensureLoaded();
  const result = seedNewsroomDemoBaseline(newsroomIntelligenceCore);
  newsroomIntelligenceCore.persist();

  return NextResponse.json({
    success: true,
    observationsSeeded: result.observationsSeeded,
    clustersSeeded: result.clustersSeeded,
    signalsCreated: result.signalsCreated,
    timestamp: new Date().toISOString(),
  });
}
