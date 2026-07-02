import { NextRequest, NextResponse } from 'next/server';
import { getStory } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const story = getStory(params.slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(story);
}
