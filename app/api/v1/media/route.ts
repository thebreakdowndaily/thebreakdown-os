import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMediaRepository } from '@/services/repositories/supabase/media';
import type { MediaItem, APIResponse, APIListParams } from '@/types/canonical';

const repo = new SupabaseMediaRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const typeFilter = searchParams.get('type');

  if (typeFilter) {
    const result = await repo.getMedia();
    const filtered = result.data.filter(item => item.type === typeFilter);
    const res: APIResponse<MediaItem[]> = { data: filtered, meta: { total: filtered.length, page: 1, pageSize: filtered.length } };
    return NextResponse.json(res);
  }

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.getMedia(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission('media.create', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseMediaRepository(write.client);
  const body = (await request.json()) as Partial<MediaItem>;

  const now = new Date().toISOString();
  const item: MediaItem = {
    id: body.id || crypto.randomUUID(),
    type: body.type || 'image',
    src: body.src || '',
    alt: body.alt || '',
    caption: body.caption || '',
    tags: body.tags || [],
    credit: body.credit || '',
    width: body.width,
    height: body.height,
    fileSize: body.fileSize,
    version: body.version || 1,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await writeRepo.saveMediaItem(item);
  const res: APIResponse<MediaItem> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
