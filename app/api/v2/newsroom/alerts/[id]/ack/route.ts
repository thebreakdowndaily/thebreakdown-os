import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

export async function POST(
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

  const { id } = await params;
  await req.json().catch(() => ({}));
  // Actor identity comes exclusively from the authenticated session.
  // Body-supplied actorId is ignored to prevent identity spoofing.
  const actorId = session.user.id;

  try {
    await newsroomIntelligenceCore.ensureLoaded();
    const acked = newsroomIntelligenceCore.acknowledgeAlert(id, actorId, gate.role);
    if (!acked) {
      return NextResponse.json({ error: 'Alert not found or already acknowledged' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      alertId: id,
      acknowledgedBy: actorId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
