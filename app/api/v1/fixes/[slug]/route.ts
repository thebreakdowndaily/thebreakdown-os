import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseFixRepository } from '@/services/repositories/supabase/fix';
import type { Fix, APIResponse } from '@/types/canonical';
import { syncFix, deleteFix } from '@/lib/data-sync';

const repo = new SupabaseFixRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const fix = await repo.getFixBySlug(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Fix> = { data: fix };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('fix.update', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseFixRepository(write.client);

  const { slug } = await context.params;
  const existing = await writeRepo.getFixBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Fix>;
  const updated: Fix = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await writeRepo.saveFix(updated);
  syncFix(saved);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('fix.delete', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseFixRepository(write.client);

  const { slug } = await context.params;
  const fix = await writeRepo.getFixBySlug(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  await writeRepo.deleteFix(fix.id);
  deleteFix(slug);
  return new NextResponse(null, { status: 204 });
}
