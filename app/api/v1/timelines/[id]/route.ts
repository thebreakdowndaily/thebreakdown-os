import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
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
  const auth = await requireApiPermission('timeline.update', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseTimelineRepository(write.client);

  const { id } = await context.params;
  const existing = await writeRepo.getTimeline(id);
  if (!existing) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }
  const body = (await request.json()) as Partial<Timeline>;
  const updated: Timeline = { ...existing, ...body, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await writeRepo.saveTimeline(updated);
  syncTimeline(saved);
  const res: APIResponse<Timeline> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiPermission('timeline.delete', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseTimelineRepository(write.client);

  const { id } = await context.params;
  const timeline = await writeRepo.getTimeline(id);
  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${id}` }, { status: 404 });
  }
  await writeRepo.deleteTimeline(id);
  deleteTimeline(id);
  return new NextResponse(null, { status: 204 });
}
