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
  const services = bootstrapServices({ publicOnly: true });

  const page = pageStr ? Math.max(1, parseInt(pageStr, 10)) : 1;
  const pageSize = limitStr ? Math.min(50, Math.max(1, parseInt(limitStr, 10))) : 20;

  const params = {
    page,
    pageSize,
  };

  const result = typeFilter
    ? services.search.searchByType(query, typeFilter, params)
    : services.search.search(query, params);

  const rawList: any[] = (result as any).matches ?? (result as any).data ?? [];
  const items = rawList.map((m: any) => {
    let url = m.url;
    if (!url) {
      if (m.type === 'story') url = `/story/${m.slug || m.id}`;
      else if (m.type === 'entity') url = `/entity/${m.slug || m.id}`;
      else if (m.type === 'topic') url = `/topic/${m.slug || m.id}`;
      else if (m.type === 'chapter') url = `/series`;
      else if (m.type === 'fix') url = `/fix/${m.slug || m.id}`;
      else if (m.type === 'investigation') url = `/investigation/${m.slug || m.id}`;
      else url = `/${m.slug || m.id}`;
    }
    return {
      ...m,
      url,
      href: url,
    };
  });

  const total = (result as any).meta?.total ?? items.length;
  const totalPages = Math.ceil(total / pageSize);

  const payload = {
    ...(result as object),
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
