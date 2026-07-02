import { NextRequest, NextResponse } from 'next/server';
import { getGraph } from '@/utils/data-layer/store';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params = {
    type: searchParams.get('type') || undefined,
    entity: searchParams.get('entity') || undefined,
  };

  const result = getGraph(params);
  return NextResponse.json(result);
}
