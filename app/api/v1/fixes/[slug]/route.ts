import { NextRequest, NextResponse } from 'next/server';
import { SupabaseFixRepository } from '@/services/repositories/supabase/fix';
import type { Fix, APIResponse } from '@/types/canonical';
import { syncFix, deleteFix } from '@/lib/data-sync';

const repo = new SupabaseFixRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const fix = await repo.getFixBySlug(slug);

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
  const existing = await repo.getFixBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<Fix>;
  const updated: Fix = { ...existing, ...body, slug: existing.slug, id: existing.id, updatedAt: new Date().toISOString() };
  const saved = await repo.saveFix(updated);
  syncFix(saved);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const fix = await repo.getFixBySlug(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}` }, { status: 404 });
  }

  await repo.deleteFix(fix.id);
  deleteFix(slug);
  return new NextResponse(null, { status: 204 });
}
