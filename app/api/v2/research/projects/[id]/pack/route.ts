import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import type { ResearchPackFormat } from '@/types/research-intelligence';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'unauthenticated' ? 401 : 403 });
  }
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') ?? 'markdown') as ResearchPackFormat;

  await researchIntelligenceCore.ensureLoaded();
  if (!researchIntelligenceCore.getProject(id)) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const pack = researchIntelligenceCore.exportResearchPack(id, format, 'api');
  if (!pack) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (format === 'json') {
    return NextResponse.json(JSON.parse(pack.content));
  }
  if (format === 'csv') {
    return new NextResponse(pack.content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="research-pack-${id}.csv"`,
      },
    });
  }
  return new NextResponse(pack.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="research-pack-${id}.md"`,
    },
  });
}
