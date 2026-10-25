import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { canPubliclyViewTimeline } from '@/lib/story/publication';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const services = bootstrapServices();
  const timeline = await services.timelines.getTimeline(id);

  if (!timeline || !canPubliclyViewTimeline(timeline)) {
    return NextResponse.json({ error: `Timeline not found: ${id}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json({ data: timeline });
}
