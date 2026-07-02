import { NextRequest, NextResponse } from 'next/server';
import { getTopic } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const topic = getTopic(slug);

  if (!topic) {
    return NextResponse.json({ error: `Topic not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(topic);
}
