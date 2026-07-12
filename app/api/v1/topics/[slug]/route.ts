import { NextRequest, NextResponse } from 'next/server';
import { SupabaseTopicRepository } from '@/services/repositories/supabase/topic';
import type { Topic, APIResponse } from '@/types/canonical';
import { syncTopic, deleteTopic } from '@/lib/data-sync';

const repo = new SupabaseTopicRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const topic = await repo.getTopicBySlug(slug);

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
  const existing = await repo.getTopicBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Topic not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Topic>;
  const updated: Topic = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.saveTopic(updated);
  syncTopic(saved);
  const res: APIResponse<Topic> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const topic = await repo.getTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: `Topic not found: ${slug}` }, { status: 404 });
  }

  await repo.deleteTopic(topic.id);
  deleteTopic(slug);
  return new NextResponse(null, { status: 204 });
}