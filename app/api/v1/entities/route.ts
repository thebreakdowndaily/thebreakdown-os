import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Entity, EntityKind, APIResponse, APIListParams } from '@/types/canonical';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const services = getServices();

  const typeParam = searchParams.get('type') as EntityKind | null;

  if (typeParam) {
    const entities = services.entities.getEntitiesByType(typeParam);
    const search = searchParams.get('search')?.toLowerCase();
    let filtered = entities;
    if (search) {
      filtered = entities.filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search));
    }
    const res: APIResponse<Entity[]> = { data: filtered, meta: { total: filtered.length, page: 1, pageSize: filtered.length } };
    return NextResponse.json(res);
  }

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = services.entities.getEntities(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
  const body = (await request.json()) as Partial<Entity>;

  const now = new Date().toISOString();
  const entity: Entity = {
    id: body.id || crypto.randomUUID(),
    type: body.type || 'organization',
    name: body.name || '',
    slug: body.slug || '',
    description: body.description || '',
    aliases: body.aliases || [],
    image: body.image,
    storyCount: body.storyCount || 0,
    evidenceScore: body.evidenceScore || 0,
    relatedEntityIds: body.relatedEntityIds || [],
    relatedStoryIds: body.relatedStoryIds || [],
    relatedTopicIds: body.relatedTopicIds || [],
    statistics: body.statistics || [],
    timeline: body.timeline || [],
    faq: body.faq || [],
    createdAt: now,
    updatedAt: now,
  };

  const saved = services.entities.saveEntity(entity);
  const res: APIResponse<Entity> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
