import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/auth-server';
import { canAccessIntelModule, normalizeIntelRole } from '@/features/auth/roles';
import { computeStoryDetail, exportStoryPackage } from '@/lib/intel/story';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Publication Package)
// Exports the canonical story-package-v1 JSON for a story draft. Authorization happens here,
// server-side, before the package is computed.

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = normalizeIntelRole(session.user.role);
  if (!canAccessIntelModule(role, 'story-builder')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const story = await computeStoryDetail(id);
  if (!story) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const pkg = exportStoryPackage(story);
  return new NextResponse(JSON.stringify(pkg, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${pkg.metadata.slug}.story-package.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
