import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { canPubliclyViewTopic } from '@/lib/story/publication';
import type { Topic } from '@/types/canonical';

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

  const services = bootstrapServices();
  let candidateTopics: Topic[] = [];
  let scanPage = 1;
  let scanCompleted = false;

  while (candidateTopics.length < MAX_CANDIDATE_SCAN) {
    const batchResult = await services.topics.getTopics({
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
    candidateTopics.push(...batch);
    if (batch.length < BATCH_SIZE) {
      scanCompleted = true;
      break;
    }
    scanPage++;
  }

  const isCapped = !scanCompleted && candidateTopics.length >= MAX_CANDIDATE_SCAN;

  const publicTopics = candidateTopics.filter(canPubliclyViewTopic);
  const total = publicTopics.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = publicTopics.slice((page - 1) * pageSize, page * pageSize);

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
