import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import type { ResearchProject } from '@/types/research-intelligence';

export async function GET() {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  await researchIntelligenceCore.ensureLoaded();
  return NextResponse.json({
    projects: researchIntelligenceCore.getProjects(),
  });
}

export async function POST(req: NextRequest) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const researchQuestion = typeof body?.researchQuestion === 'string' ? body.researchQuestion.trim() : '';
  if (!title || !researchQuestion) {
    return NextResponse.json({ error: 'title and researchQuestion are required' }, { status: 400 });
  }

  await researchIntelligenceCore.ensureLoaded();
  // Actor identity is derived exclusively from the authenticated session.
  const project = researchIntelligenceCore.createProject({
    title,
    researchQuestion,
    description: typeof body?.description === 'string' ? body.description : '',
    priority: (body?.priority as ResearchProject['priority'] | undefined) ?? 'P2',
    createdBy: session.user.id,
  });

  return NextResponse.json({ project }, { status: 201 });
}
