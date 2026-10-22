import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import type { APIListParams } from '@/types/canonical';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
  };
  const requestedPage = Number.isInteger(params.page) && (params.page ?? 0) > 0 ? params.page! : 1;
  const requestedPageSize = Number.isInteger(params.pageSize) && (params.pageSize ?? 0) > 0
    ? Math.min(params.pageSize!, 100)
    : 20;

  if (!query.trim()) {
    return NextResponse.json({
      data: [],
      meta: { total: 0, page: requestedPage, pageSize: requestedPageSize, totalPages: 0 },
    });
  }

  const services = bootstrapServices({ publicOnly: true });

  // The process-wide search index may have been built before the public
  // bootstrap. Authorize story hits against the public repository every time.
  const { data: publicStories } = await services.stories.getPublicStories();
  const publicStoryIdentifiers = new Set(
    publicStories
      .filter((story) => story.isTestArtifact !== true)
      .flatMap((story) => [story.id, story.slug])
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  const result = typeFilter
    ? services.search.searchByType(query, typeFilter)
    : services.search.search(query);
  const visibleList = result.data.filter((entry) => {
    if (entry.type !== 'story') return true;
    return publicStoryIdentifiers.has(entry.id) || publicStoryIdentifiers.has(entry.slug);
  });

  const start = (requestedPage - 1) * requestedPageSize;
  return NextResponse.json({
    ...result,
    data: visibleList.slice(start, start + requestedPageSize),
    meta: {
      total: visibleList.length,
      page: requestedPage,
      pageSize: requestedPageSize,
      totalPages: Math.ceil(visibleList.length / requestedPageSize),
    },
  });
}