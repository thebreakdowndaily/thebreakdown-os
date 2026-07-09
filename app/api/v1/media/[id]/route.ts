import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMediaRepository } from '@/services/media/repository';
import type { MediaItem, APIResponse } from '@/types/canonical';

const repo = new SupabaseMediaRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const item = await repo.findById(id);
  if (!item) {
    return NextResponse.json({ error: `Media item not found: ${id}` }, { status: 404 });
  }
  const res: APIResponse<MediaItem> = { data: item };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const existing = await repo.findById(id);
  if (!existing) {
    return NextResponse.json({ error: `Media item not found: ${id}` }, { status: 404 });
  }
  const body = (await request.json()) as Partial<MediaItem>;
  const updated: MediaItem = { ...existing, ...body, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.save(updated);
  const res: APIResponse<MediaItem> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const item = await repo.findById(id);
  if (!item) {
    return NextResponse.json({ error: `Media item not found: ${id}` }, { status: 404 });
  }
  await repo.delete(id);
  return new NextResponse(null, { status: 204 });
}