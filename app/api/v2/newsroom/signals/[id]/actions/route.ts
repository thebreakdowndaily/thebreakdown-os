import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { NewsroomActionPayload, NewsroomTriageAction } from '@/types/newsroom-intelligence';

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
  const rawBody = (await req.json().catch(() => null)) as unknown;
  const body =
    rawBody && typeof rawBody === 'object'
      ? (rawBody as Record<string, unknown>)
      : {};

  const action = body.action as NewsroomTriageAction;
  if (typeof action !== 'string') {
    return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
  }

  try {
    await newsroomIntelligenceCore.ensureLoaded();
    // Actor identity is derived exclusively from the authenticated session.
    // Body-supplied actorId/actorName are ignored to prevent identity spoofing.
    const updated = newsroomIntelligenceCore.executeAction({
      signalId: id,
      action,
      actorId: session.user.id,
      actorName: session.user.name || gate.roleLabel,
      assignedTo: typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
      note: typeof body.note === 'string' ? body.note : undefined,
      escalatedPriority: body.escalatedPriority as NewsroomActionPayload['escalatedPriority'],
      mutationId: typeof body.mutationId === 'string' ? body.mutationId : undefined,
      expectedVersion: typeof body.expectedVersion === 'number' ? body.expectedVersion : undefined,
    }, gate.role);

    if (!updated) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      signal: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden';
    if (message.includes('Version conflict')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
