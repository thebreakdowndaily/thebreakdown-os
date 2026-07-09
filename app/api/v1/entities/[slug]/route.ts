import { NextRequest, NextResponse } from 'next/server';
import { SupabaseEntityRepository } from '@/services/entities/repository';
import type { Entity, APIResponse } from '@/types/canonical';
import { syncEntity, deleteEntity } from '@/lib/data-sync';

const repo = new SupabaseEntityRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const entity = await repo.findBySlug(slug);

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
  const { slug } = await context.params;
  const existing = await repo.findBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Entity>;
  const updated: Entity = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.save(updated);
  syncEntity(saved);
  const res: APIResponse<Entity> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const entity = await repo.findBySlug(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  await repo.delete(entity.id);
  deleteEntity(slug);
  return new NextResponse(null, { status: 204 });
}