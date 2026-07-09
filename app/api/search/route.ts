import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');
  const services = bootstrapServices();

  const params = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: limitStr ? Math.min(parseInt(limitStr, 10), 50) : undefined,
  };

  const result = typeFilter
    ? services.search.searchByType(query, typeFilter, params)
    : services.search.search(query, params);

  return NextResponse.json(result);
}
