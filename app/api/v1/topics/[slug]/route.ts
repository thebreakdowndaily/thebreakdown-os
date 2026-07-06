import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Topic, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const topic = services.topics.getTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: `Topic not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Topic> = { data: topic };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const existing = services.topics.getTopicBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Topic not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Topic>;
  const updated: Topic = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.topics.saveTopic(updated);
  const res: APIResponse<Topic> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const topic = services.topics.getTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: `Topic not found: ${slug}` }, { status: 404 });
  }

  services.topics.deleteTopic(topic.id);
  return new NextResponse(null, { status: 204 });
}
