import { NextResponse } from 'next/server';
import { getStatistics } from '@/utils/data-layer/store';

export function GET() {
  const result = getStatistics();
  return NextResponse.json(result);
}
