import { NextRequest, NextResponse } from 'next/server';
import { RepositoryFactory } from '@/services/factory/repository';
import type { Story, APIResponse } from '@/types/canonical';
import { syncStory, deleteStory } from '@/lib/data-sync';
import { requireApiPermission } from '@/features/auth/require-role';
import { can } from '@/features/auth/policy';
import { evaluatePublicationContract, executePostPublicationEffects } from '@/lib/editorial/canonical-publication';

const repo = RepositoryFactory.getStoryRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const story = await repo.getStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Story> = { data: story };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('story.update', request);
  if ('response' in auth) {
    return auth.response;
  }
  const principal = auth.principal;

  const { slug } = await context.params;
  const existing = await repo.getStoryBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Story>;
  const targetStory: Story = {
    ...existing,
    ...body,
    slug: existing.slug,
    id: existing.id,
    updatedAt: new Date().toISOString(),
    updatedBy: principal.userId,
  };

  if (body.status === 'published') {
    if (!can(principal, 'story.publish')) {
      return NextResponse.json(
        { error: `Forbidden: Principal with role '${principal.role}' cannot publish stories. Editor role or higher required.` },
        { status: 403 }
      );
    }

    const { evaluatePublicationContractAsync } = await import('@/lib/editorial/canonical-publication');
    const decision = await evaluatePublicationContractAsync(existing, targetStory, principal);
    if (!decision.allowed) {
      return NextResponse.json(
        { error: decision.error, details: decision.gateResult },
        { status: decision.httpStatus }
      );
    }

    const saved = await repo.saveStory(decision.updatedStory!, { publicationToken: decision.publicationToken });
    syncStory(saved);
    executePostPublicationEffects(saved, principal, decision.gateResult);
    const res: APIResponse<Story> = { data: saved };
    return NextResponse.json(res);
  }

  const saved = await repo.saveStory(targetStory);
  syncStory(saved);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('story.delete', request);
  if ('response' in auth) {
    return auth.response;
  }

  const { slug } = await context.params;
  const story = await repo.getStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  await repo.deleteStory(story.id);
  deleteStory(slug);
  return new NextResponse(null, { status: 204 });
}