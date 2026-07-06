import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Timeline, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const timeline = services.timelines.getTimeline(id);

  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }

  const res: APIResponse<Timeline> = { data: timeline };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const existing = services.timelines.getTimeline(id);

  if (!existing) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Timeline>;
  const updated: Timeline = { ...existing, ...body, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.timelines.saveTimeline(updated);
  const res: APIResponse<Timeline> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const timeline = services.timelines.getTimeline(id);

  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }

  services.timelines.deleteTimeline(id);
  return new NextResponse(null, { status: 204 });
}
