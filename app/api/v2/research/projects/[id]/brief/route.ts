import { NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { researchIntelligenceCore } from '@/services/intelligence/research';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { id } = await params;
  await researchIntelligenceCore.ensureLoaded();
  if (!researchIntelligenceCore.getProject(id)) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const brief = researchIntelligenceCore.generateStoryBrief(id, session.user.id);
  if (!brief) {
    return NextResponse.json({ error: 'Brief generation failed' }, { status: 500 });
  }
  return NextResponse.json({ brief }, { status: 201 });
}
