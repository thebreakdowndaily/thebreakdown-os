import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const timeline = getTimeline(id);

  if (!timeline) {
    return NextResponse.json({ error: `Timeline not found: ${id}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(timeline);
}
