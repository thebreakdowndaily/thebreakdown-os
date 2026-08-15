import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

export async function GET(req: NextRequest) {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const userContext = { id: session.user.id, role: gate.role };
  await newsroomIntelligenceCore.ensureLoaded();
  const { searchParams } = new URL(req.url);
  const priority = searchParams.get('priority');
  const state = searchParams.get('state');

  let signals = newsroomIntelligenceCore.getSignals(userContext);

  if (priority) {
    signals = signals.filter((s) => s.priority === priority);
  }
  if (state) {
    signals = signals.filter((s) => s.lifecycleState === state);
  }

  return NextResponse.json({
    signals,
    total: signals.length,
    timestamp: new Date().toISOString(),
  });
}
