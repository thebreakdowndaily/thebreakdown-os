import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { MediaItem, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const item = services.media.getMediaItem(id);

  if (!item) {
    return NextResponse.json({ error: `Media not found: ${id}` }, { status: 404 });
  }

  const res: APIResponse<MediaItem> = { data: item };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const existing = services.media.getMediaItem(id);

  if (!existing) {
    return NextResponse.json({ error: `Media not found: ${id}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<MediaItem>;
  const updated: MediaItem = { ...existing, ...body, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.media.saveMediaItem(updated);
  const res: APIResponse<MediaItem> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = getServices();
  const item = services.media.getMediaItem(id);

  if (!item) {
    return NextResponse.json({ error: `Media not found: ${id}` }, { status: 404 });
  }

  services.media.deleteMediaItem(id);
  return new NextResponse(null, { status: 204 });
}
