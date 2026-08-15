import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import type { ResearchProjectStatus, ResearchProject } from '@/types/research-intelligence';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  const { id } = await params;
  await researchIntelligenceCore.ensureLoaded();
  const project = researchIntelligenceCore.getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  return NextResponse.json({
    project,
    overview: researchIntelligenceCore.getProjectOverview(id),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  await researchIntelligenceCore.ensureLoaded();
  const patch: {
    title?: string;
    description?: string;
    researchQuestion?: string;
    priority?: ResearchProject['priority'];
    status?: ResearchProjectStatus;
  } = {};
  if (typeof body.title === 'string') patch.title = body.title;
  if (typeof body.description === 'string') patch.description = body.description;
  if (typeof body.researchQuestion === 'string') patch.researchQuestion = body.researchQuestion;
  if (typeof body.priority === 'string') patch.priority = body.priority as ResearchProject['priority'];
  if (typeof body.status === 'string') patch.status = body.status as ResearchProjectStatus;

  const updated = researchIntelligenceCore.updateProject(id, patch);
  if (!updated) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  return NextResponse.json({ project: updated });
}
