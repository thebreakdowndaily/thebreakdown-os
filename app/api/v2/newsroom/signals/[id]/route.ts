import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const userContext = { id: session.user.id, role: gate.role };
  const { id } = await params;

  try {
    await newsroomIntelligenceCore.ensureLoaded();
    const signal = newsroomIntelligenceCore.getSignal(id, userContext);
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }
    return NextResponse.json({ signal });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
