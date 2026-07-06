import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Story, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const story = services.stories.getStoryBySlug(slug);

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
  const services = getServices();
  const existing = services.stories.getStoryBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Story>;
  const updated: Story = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.stories.saveStory(updated);
  const res: APIResponse<Story> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const story = services.stories.getStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: `Story not found: ${slug}` }, { status: 404 });
  }

  services.stories.deleteStory(story.id);
  return new NextResponse(null, { status: 204 });
}
