import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Fix, APIResponse } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const fix = services.fixes.getFixBySlug(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  const res: APIResponse<Fix> = { data: fix };
  return NextResponse.json(res);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const existing = services.fixes.getFixBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Fix>;
  const updated: Fix = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = services.fixes.saveFix(updated);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = getServices();
  const fix = services.fixes.getFixBySlug(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  services.fixes.deleteFix(fix.id);
  return new NextResponse(null, { status: 204 });
}
