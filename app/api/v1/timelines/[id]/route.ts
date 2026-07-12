import { NextRequest, NextResponse } from 'next/server';
import { SupabaseTimelineRepository } from '@/services/repositories/supabase/timeline';
import type { Timeline, APIResponse } from '@/types/canonical';
import { syncTimeline, deleteTimeline } from '@/lib/data-sync';

const repo = new SupabaseTimelineRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const timeline = await repo.getTimeline(id);
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
  const existing = await repo.getTimeline(id);
  if (!existing) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }
  const body = (await request.json()) as Partial<Timeline>;
  const updated: Timeline = { ...existing, ...body, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.saveTimeline(updated);
  syncTimeline(saved);
  const res: APIResponse<Timeline> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const timeline = await repo.getTimeline(id);
  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }
  await repo.deleteTimeline(id);
  deleteTimeline(id);
  return new NextResponse(null, { status: 204 });
}
