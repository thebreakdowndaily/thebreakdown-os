import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const timeline = getTimeline(params.id);

  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${params.id}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(timeline);
}
