import { NextRequest, NextResponse } from 'next/server';
import { getTopic } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const topic = getTopic(params.slug);

  if (!topic) {
    return NextResponse.json({ error: `Topic not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(topic);
}
