import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { rateLimiter } from '@/features/rate-limiting/limiter';

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `search:${clientIp}`,
    tier: 'search',
    endpoint: '/api/search',
    ip: clientIp,
  });

  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';
  
  // Bound query length to protect backend search indexing
  const query = rawQuery.slice(0, 200).trim();
  const typeFilter = searchParams.get('type') || '';
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');
  const parsedPage = pageStr ? parseInt(pageStr, 10) : 1;
  const parsedPageSize = limitStr ? parseInt(limitStr, 10) : 20;
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = Number.isSafeInteger(parsedPageSize) && parsedPageSize > 0
    ? Math.min(50, parsedPageSize)
    : 20;

  if (!query) {
    const emptyPayload = {
      matches: [],
      results: [],
      data: [],
      total: 0,
      totalPages: 0,
      meta: { total: 0, page, pageSize, totalPages: 0 },
    };
    const response = NextResponse.json(emptyPayload);
    rateLimiter.applyHeaders(response.headers, rate);
    return response;
  }

  const services = bootstrapServices({ publicOnly: true });

  // Build an allowlist from the canonical public-story repository, rather
  // than assuming the process-wide search index was initialized public-only.
  const { data: publicStories } = await services.stories.getPublicStories();
  const publicStoryIdentifiers = new Set(
    publicStories
      .filter((story) => story.isTestArtifact !== true)
      .flatMap((story) => [story.id, story.slug])
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  // Read all search candidates, then authorize story results before pagination
  // and counts. This prevents a pre-initialized internal index leaking drafts.
  const result = typeFilter
    ? services.search.searchByType(query, typeFilter)
    : services.search.search(query);

  const rawList: any[] = (result as any).matches ?? (result as any).data ?? [];
  const visibleList = rawList.filter((match: any) => {
    if (match.type !== 'story') return true;
    return publicStoryIdentifiers.has(match.id) || publicStoryIdentifiers.has(match.slug);
  });
  const paginatedList = visibleList.slice((page - 1) * pageSize, page * pageSize);
  const items = paginatedList.map((m: any) => {
    let url = m.url;
    if (!url) {
      if (m.type === 'story') url = `/story/${m.slug || m.id}`;
      else if (m.type === 'entity' || m.type === 'country' || m.type === 'organization') url = `/entity/${m.slug || m.id}`;
      else if (m.type === 'topic') url = `/topic/${m.slug || m.id}`;
      else if (m.type === 'chapter') url = `/series`;
      else if (m.type === 'fix') url = `/fix/${m.slug || m.id}`;
      else if (m.type === 'problem') url = `/problems/${m.slug || m.id}`;
      else if (m.type === 'investigation') url = `/investigation/${m.slug || m.id}`;
      else if (m.type === 'timeline') url = `/timeline`;
      else if (m.type === 'dataset') url = `/datasets/${m.slug || m.id}`;
      else url = `/story/${m.slug || m.id}`;
    }
    return {
      ...m,
      url,
      href: url,
    };
  });

  const total = visibleList.length;
  const totalPages = Math.ceil(total / pageSize);

  const payload = {
    ...(result as object),
    meta: {
      ...((result as any).meta || {}),
      total,
      page,
      pageSize,
      totalPages,
    },
    matches: items,
    results: items,
    data: items,
    total,
    totalPages,
  };

  const response = NextResponse.json(payload);
  rateLimiter.applyHeaders(response.headers, rate);
  return response;
}
