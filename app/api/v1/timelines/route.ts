import { NextRequest, NextResponse } from 'next/server';
import { SupabaseTimelineRepository } from '@/services/repositories/supabase/timeline';
import type { Timeline, APIResponse, APIListParams } from '@/types/canonical';
import { syncTimeline } from '@/lib/data-sync';

const repo = new SupabaseTimelineRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.getTimelines(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Timeline>;

  const now = new Date().toISOString();
  const timeline: Timeline = {
    id: body.id || crypto.randomUUID(),
    title: body.title || '',
    description: body.description || '',
    category: body.category || '',
    storyIds: body.storyIds || [],
    entityIds: body.entityIds || [],
    topicIds: body.topicIds || [],
    events: body.events || [],
    createdAt: now,
    updatedAt: now,
  };

  const saved = await repo.saveTimeline(timeline);
  syncTimeline(saved);
  const res: APIResponse<Timeline> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
