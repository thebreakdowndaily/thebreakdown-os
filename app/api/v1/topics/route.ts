import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Topic, APIResponse, APIListParams } from '@/types/canonical';

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

  const result = services.topics.getTopics(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
  const body = (await request.json()) as Partial<Topic>;

  const now = new Date().toISOString();
  const topic: Topic = {
    id: body.id || crypto.randomUUID(),
    name: body.name || '',
    slug: body.slug || '',
    description: body.description || '',
    overview: body.overview,
    image: body.image,
    storyIds: body.storyIds || [],
    relatedEntityIds: body.relatedEntityIds || [],
    featuredStoryIds: body.featuredStoryIds || [],
    countries: body.countries || [],
    faq: body.faq || [],
    timeline: body.timeline || [],
    statistics: body.statistics || [],
    createdAt: now,
    updatedAt: now,
  };

  const saved = services.topics.saveTopic(topic);
  const res: APIResponse<Topic> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
