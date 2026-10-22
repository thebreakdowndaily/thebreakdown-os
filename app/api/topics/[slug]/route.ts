import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { canPubliclyViewTopic } from '@/lib/story/publication';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const topic = (await services.topics.getTopicBySlug(slug)) || (await services.topics.getTopic(slug));

  if (!topic || !canPubliclyViewTopic(topic)) {
    return NextResponse.json({ error: `Topic not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json({ data: topic });
}
