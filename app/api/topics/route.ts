import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageRaw = searchParams.get('page');
  const pageSizeRaw = searchParams.get('pageSize');
  const orderRaw = searchParams.get('order');
  const sortOrder: 'asc' | 'desc' | undefined = orderRaw === 'asc' || orderRaw === 'desc' ? orderRaw : undefined;

  const params = {
    page: pageRaw ? parseInt(pageRaw, 10) : undefined,
    pageSize: pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    sortBy: searchParams.get('sort') || undefined,
    sortOrder,
    search: searchParams.get('search') || undefined,
  };

  const services = bootstrapServices();
  const result = await services.topics.getTopics(params);
  return NextResponse.json(result);
}
