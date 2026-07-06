import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Story, APIResponse, APIListParams } from '@/types/canonical';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const services = getServices();

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = services.stories.getStories(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
  const body = (await request.json()) as Partial<Story>;

  const now = new Date().toISOString();
  const story: Story = {
    id: body.id || crypto.randomUUID(),
    title: body.title || '',
    slug: body.slug || '',
    headline: body.headline || '',
    summary: body.summary || '',
    heroImage: body.heroImage || '',
    author: body.author || '',
    category: body.category || '',
    status: body.status || 'draft',
    evidenceScore: body.evidenceScore || 0,
    readingTime: body.readingTime || 0,
    publishedAt: body.publishedAt || '',
    createdAt: now,
    updatedAt: now,
    tags: body.tags || [],
    blocks: body.blocks || [],
    sources: body.sources || [],
    claims: body.claims || [],
    timeline: body.timeline || [],
    faq: body.faq || [],
    charts: body.charts || [],
    relatedStoryIds: body.relatedStoryIds || [],
    relatedEntityIds: body.relatedEntityIds || [],
    relatedTopicIds: body.relatedTopicIds || [],
    notes: body.notes,
    updatedBy: body.updatedBy,
  };

  const saved = services.stories.saveStory(story);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
