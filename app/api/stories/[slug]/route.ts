import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const story = await services.stories.getPublicStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(story);
}
