import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Timeline, APIResponse, APIListParams } from '@/types/canonical';

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

  const result = services.timelines.getTimelines(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
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

  const saved = services.timelines.saveTimeline(timeline);
  const res: APIResponse<Timeline> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
