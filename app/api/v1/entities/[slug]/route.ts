import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseEntityRepository } from '@/services/repositories/supabase/entity';
import type { Entity, APIResponse } from '@/types/canonical';
import { syncEntity, deleteEntity } from '@/lib/data-sync';

const repo = new SupabaseEntityRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const entity = await repo.getEntityBySlug(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Entity> = { data: entity };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('entity.update', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseEntityRepository(write.client);

  const { slug } = await context.params;
  const existing = await writeRepo.getEntityBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Entity>;
  const updated: Entity = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await writeRepo.save(updated);
  syncEntity(saved);
  const res: APIResponse<Entity> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiPermission('entity.delete', request);
  if ('response' in auth) return auth.response;
  const write = await getPersistentWriteClient(auth.principal);
  if ('response' in write) return write.response;
  const writeRepo = new SupabaseEntityRepository(write.client);

  const { slug } = await context.params;
  const entity = await writeRepo.getEntityBySlug(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  await writeRepo.delete(entity.id);
  deleteEntity(slug);
  return new NextResponse(null, { status: 204 });
}
