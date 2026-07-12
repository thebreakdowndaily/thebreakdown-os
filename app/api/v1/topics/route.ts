import { NextRequest, NextResponse } from 'next/server';
import { SupabaseTopicRepository } from '@/services/repositories/supabase/topic';
import type { Topic, APIResponse, APIListParams } from '@/types/canonical';
import { syncTopic } from '@/lib/data-sync';

const repo = new SupabaseTopicRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.getTopics(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
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

  const saved = await repo.saveTopic(topic);
  syncTopic(saved);
  const res: APIResponse<Topic> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}