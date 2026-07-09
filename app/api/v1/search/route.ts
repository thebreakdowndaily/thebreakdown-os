import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { APIListParams } from '@/types/canonical';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const services = getServices();

  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
  };

  const result = typeFilter
    ? services.search.searchByType(query, typeFilter, params)
    : services.search.search(query, params);

  return NextResponse.json(result);
}