import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { INTEL_ROLE_ORDER } from '@/features/auth/roles';
import { isDemoMode } from '@/features/auth/demo';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { seedNewsroomDemoBaseline } from '@/lib/intelligence/newsroom-demo-baseline';
import { NewsroomPersistenceError } from '@/services/intelligence/newsroom/persistence/state';

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

  if (!isDemoMode() && process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Demo seeding is disabled outside demo mode' }, { status: 404 });
  }

  try {
    await newsroomIntelligenceCore.ensureLoaded();
    const result = seedNewsroomDemoBaseline(newsroomIntelligenceCore);
    await newsroomIntelligenceCore.persistAsync();

    return NextResponse.json({
      success: true,
      observationsSeeded: result.observationsSeeded,
      clustersSeeded: result.clustersSeeded,
      signalsCreated: result.signalsCreated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof NewsroomPersistenceError) {
      console.error('[NewsroomSeed] durable write failed:', error.code);
      return NextResponse.json({ error: 'Demo baseline could not be durably saved' }, { status: 503 });
    }
    console.error('[NewsroomSeed] operation failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Demo baseline seeding failed' }, { status: 500 });
  }
}
