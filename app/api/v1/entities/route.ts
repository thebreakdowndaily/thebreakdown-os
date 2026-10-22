import { NextRequest, NextResponse } from 'next/server';
import { SupabaseEntityRepository } from '@/services/repositories/supabase/entity';
import type { Entity, EntityKind, APIResponse, APIListParams } from '@/types/canonical';
import { syncEntity } from '@/lib/data-sync';
import { canPubliclyViewEntity } from '@/lib/story/publication';

const repo = new SupabaseEntityRepository();

const BATCH_SIZE = 500;
const MAX_CANDIDATE_SCAN = 10000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const parsedPage = pageStr ? parseInt(pageStr, 10) : 1;
  const parsedPageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : 20;
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = Number.isSafeInteger(parsedPageSize) && parsedPageSize > 0 ? Math.min(100, parsedPageSize) : 20;
  const search = searchParams.get('search') || undefined;
  const typeParam = searchParams.get('type') as EntityKind | null;

  // Retrieve candidate entities using bounded individual database fetches.
  // Iterates in batches of BATCH_SIZE (500) up to MAX_CANDIDATE_SCAN (10,000)
  // to ensure candidate sets with > 1,000 records are fully scanned without
  // single-query memory spikes or silent truncation.
  let candidateEntities: Entity[] = [];
  let scanPage = 1;
  let scanCompleted = false;

  if (typeParam) {
    const allByType = await repo.getEntitiesByType(typeParam);
    candidateEntities = allByType || [];
    if (search) {
      const q = search.toLowerCase();
      candidateEntities = candidateEntities.filter(
        (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    scanCompleted = true;
  } else {
    while (candidateEntities.length < MAX_CANDIDATE_SCAN) {
      const batchResult = await repo.getEntities({ search, page: scanPage, pageSize: BATCH_SIZE });
      const batch = batchResult.data || [];
      if (batch.length === 0) {
        scanCompleted = true;
        break;
      }
      candidateEntities.push(...batch);
      if (batch.length < BATCH_SIZE) {
        scanCompleted = true;
        break;
      }
      scanPage++;
    }
  }

  const isCapped = !scanCompleted && candidateEntities.length >= MAX_CANDIDATE_SCAN;

  // Strict fail-closed publication filter applied BEFORE page slicing.
  const publicEntities = candidateEntities.filter(canPubliclyViewEntity);
  const total = publicEntities.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = publicEntities.slice((page - 1) * pageSize, page * pageSize);

  const response = NextResponse.json({
    data: paginated,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      ...(isCapped ? { isCapped: true, scanCeiling: MAX_CANDIDATE_SCAN } : {}),
    },
  } as APIResponse<Entity[]>);

  if (isCapped) {
    response.headers.set('X-Catalog-Capped', 'true');
    response.headers.set('X-Catalog-Scan-Ceiling', String(MAX_CANDIDATE_SCAN));
  }

  return response;
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
  try {
    syncEntity(saved as any);
  } catch (err) {
    // Non-blocking sync failure
  }
  return NextResponse.json({ data: saved } as APIResponse<Entity>, { status: 201 });
}
