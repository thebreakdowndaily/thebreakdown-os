import { NextRequest, NextResponse } from 'next/server';
import { getCountries } from '@/utils/data-layer/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    sort: searchParams.get('sort') || undefined,
    order: (searchParams.get('order') as 'asc' | 'desc') || undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = getCountries(params);
  return NextResponse.json(result);
}
