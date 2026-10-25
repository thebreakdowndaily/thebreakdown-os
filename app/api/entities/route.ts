import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { canPubliclyViewEntity } from '@/lib/story/publication';
import type { Entity } from '@/types/canonical';

const BATCH_SIZE = 500;
const MAX_CANDIDATE_SCAN = 10000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageRaw = searchParams.get('page');
  const pageSizeRaw = searchParams.get('pageSize');
  const parsedPage = pageRaw ? parseInt(pageRaw, 10) : 1;
  const parsedPageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 20;
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = Number.isSafeInteger(parsedPageSize) && parsedPageSize > 0 ? Math.min(100, parsedPageSize) : 20;

  const orderRaw = searchParams.get('order');
  const sortOrder: 'asc' | 'desc' | undefined = orderRaw === 'asc' || orderRaw === 'desc' ? orderRaw : undefined;
  const sortBy = searchParams.get('sort') || undefined;
  const search = searchParams.get('search') || undefined;
  const typeFilter = searchParams.get('type');

  const services = bootstrapServices();

  let candidateEntities: Entity[] = [];
  let scanPage = 1;
  let scanCompleted = false;

  if (typeFilter) {
    const rawData = await services.entities.getEntitiesByType(typeFilter as any);
    candidateEntities = rawData || [];
    if (search) {
      const q = search.toLowerCase();
      candidateEntities = candidateEntities.filter(
        (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    scanCompleted = true;
  } else {
    while (candidateEntities.length < MAX_CANDIDATE_SCAN) {
      const batchResult = await services.entities.getEntities({
        page: scanPage,
        pageSize: BATCH_SIZE,
        sort: sortBy,
        search,
      });
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
  });

  if (isCapped) {
    response.headers.set('X-Catalog-Capped', 'true');
    response.headers.set('X-Catalog-Scan-Ceiling', String(MAX_CANDIDATE_SCAN));
  }

  return response;
}
