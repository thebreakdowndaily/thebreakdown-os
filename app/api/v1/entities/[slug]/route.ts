import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Entity, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const entity = services.entities.getEntityBySlug(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  const resEntity: APIResponse<Entity> = { data: entity };
  return NextResponse.json(resEntity);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const existing = services.entities.getEntityBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Entity>;
  const updated: Entity = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.entities.saveEntity(updated);
  const resSaved: APIResponse<Entity> = { data: saved };
  return NextResponse.json(resSaved);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const entity = services.entities.getEntityBySlug(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}` }, { status: 404 });
  }

  services.entities.deleteEntity(entity.id);
  return new NextResponse(null, { status: 204 });
}
