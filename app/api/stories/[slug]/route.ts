import { NextRequest, NextResponse } from 'next/server';
import { getStory } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const story = getStory(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(story);
}
