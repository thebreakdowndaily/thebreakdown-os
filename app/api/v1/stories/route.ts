import { NextRequest, NextResponse } from 'next/server';
import { RepositoryFactory } from '@/services/factory/repository';
import type { Story, APIResponse, APIListParams } from '@/types/canonical';
import { syncStory } from '@/lib/data-sync';
import { requireApiPermission } from '@/features/auth/require-role';
import { can } from '@/features/auth/policy';
import { evaluatePublicationContract, executePostPublicationEffects } from '@/lib/editorial/canonical-publication';

const repo = RepositoryFactory.getStoryRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.getStories(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission('story.create', request);
  if ('response' in auth) {
    return auth.response;
  }
  const principal = auth.principal;

  const body = (await request.json()) as Partial<Story> & { blocks?: Array<{ type?: string; data?: Record<string, unknown> }> };

  const now = new Date().toISOString();
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const id = body.id && UUID_RE.test(body.id) ? body.id : crypto.randomUUID();

  const blocks = body.blocks || [];
  const heroBlock = blocks.find((b) => b.type === 'hero')?.data as Record<string, unknown> | undefined;
  const sourcesBlock = blocks.find((b) => b.type === 'sources')?.data as Record<string, unknown> | undefined;
  const faqBlock = blocks.find((b) => b.type === 'faq')?.data as Record<string, unknown> | undefined;

  const headline = body.headline || (heroBlock?.headline as string) || body.title || '';
  const summary = body.summary || (heroBlock?.summary as string) || '';
  const author = body.author || (heroBlock?.author as string) || '';
  const heroImage = body.heroImage || (heroBlock?.heroImage as string) || '';
  const category = body.category || (heroBlock?.category as string) || '';
  const publishedAtFromHero = (heroBlock?.publishedAt as string) || '';
  const sources = body.sources || (sourcesBlock?.sources as Story['sources']) || [];
  const faq = body.faq || (faqBlock?.items as Story['faq']) || [];
  const publishedAt = body.publishedAt || (body.status === 'published' ? (publishedAtFromHero || now) : publishedAtFromHero);

  const baseStory: Story = {
    id,
    title: body.title || '',
    slug: body.slug || '',
    headline,
    summary,
    heroImage,
    author: body.author || author || principal.name,
    category,
    status: body.status || 'draft',
    storyType: body.storyType || 'standard',
    evidenceScore: body.evidenceScore || 0,
    readingTime: body.readingTime || 0,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    tags: body.tags || [],
    blocks,
    sources,
    claims: body.claims || [],
    timeline: body.timeline || [],
    faq,
    charts: body.charts || [],
    relatedStoryIds: body.relatedStoryIds || [],
    relatedEntityIds: body.relatedEntityIds || [],
    relatedTopicIds: body.relatedTopicIds || [],
    notes: body.notes,
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
    const decision = await evaluatePublicationContractAsync(undefined, baseStory, principal);
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
    return NextResponse.json(res, { status: 201 });
  }

  const saved = await repo.saveStory(baseStory);
  syncStory(saved);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}