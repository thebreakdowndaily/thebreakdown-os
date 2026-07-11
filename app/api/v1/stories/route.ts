import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStoryRepository } from '@/services/stories/repository';
import type { Story, APIResponse, APIListParams } from '@/types/canonical';
import { syncStory } from '@/lib/data-sync';

const repo = new SupabaseStoryRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.findAll(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
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

  const story: Story = {
    id,
    title: body.title || '',
    slug: body.slug || '',
    headline,
    summary,
    heroImage,
    author,
    category,
    status: body.status || 'draft',
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
    updatedBy: body.updatedBy,
  };

  const saved = await repo.save(story);
  syncStory(saved);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}