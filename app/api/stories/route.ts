import { NextRequest, NextResponse } from 'next/server';
import { getStories } from '@/utils/data-layer/store';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageRaw = searchParams.get('page');
  const pageSizeRaw = searchParams.get('pageSize');
  const orderRaw = searchParams.get('order');
  const order: 'asc' | 'desc' | undefined = orderRaw === 'asc' || orderRaw === 'desc' ? orderRaw : undefined;

  const params = {
    page: pageRaw ? parseInt(pageRaw, 10) : undefined,
    pageSize: pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    sort: searchParams.get('sort') || undefined,
    order,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    author: searchParams.get('author') || undefined,
  };

  const result = getStories(params);
  return NextResponse.json(result);
}
