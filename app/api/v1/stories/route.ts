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

  const saved = await repo.save(story);
  syncStory(saved);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}