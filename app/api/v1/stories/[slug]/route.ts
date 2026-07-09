import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStoryRepository } from '@/services/stories/repository';
import type { Story, APIResponse } from '@/types/canonical';
import { syncStory, deleteStory } from '@/lib/data-sync';

const repo = new SupabaseStoryRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const story = await repo.findBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Story> = { data: story };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const existing = await repo.findBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Story>;
  const updated: Story = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.save(updated);
  syncStory(saved);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const story = await repo.findBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  await repo.delete(story.id);
  deleteStory(slug);
  return new NextResponse(null, { status: 204 });
}