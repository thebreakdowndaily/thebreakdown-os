import { NextRequest, NextResponse } from 'next/server';
import { SupabaseEntityRepository } from '@/services/repositories/supabase/entity';
import type { Entity, EntityKind, APIResponse, APIListParams } from '@/types/canonical';
import { syncEntity } from '@/lib/data-sync';

const repo = new SupabaseEntityRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const typeParam = searchParams.get('type') as EntityKind | null;

  if (typeParam) {
    const entities: Entity[] = await repo.getEntitiesByType(typeParam);
    const search = searchParams.get('search')?.toLowerCase();
    let filtered = entities;
    if (search) {
      filtered = entities.filter((e: Entity) => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search));
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

  const result = await repo.getEntities(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
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

  const saved = await repo.save(entity);
  syncEntity(saved);
  const res: APIResponse<Entity> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
