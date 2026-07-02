import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch } from '@/utils/search/engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const depth = parseInt(searchParams.get('depth') || '2', 10);

  const result = semanticSearch(query, {
    page,
    pageSize: Math.min(limit, 50),
    type: typeFilter || undefined,
    depth: Math.min(depth, 4),
  });

  return NextResponse.json(result);
}
