import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Dataset, APIResponse } from '@/types/canonical';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const dataset = services.datasets.getDatasetBySlug(slug);
  if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const res: APIResponse<Dataset> = { data: dataset };
  return NextResponse.json(res);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const existing = services.datasets.getDatasetBySlug(slug);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as Partial<Dataset>;
  const updated = services.datasets.updateDataset(existing.id, body);
  const res: APIResponse<Dataset> = { data: updated };
  return NextResponse.json(res);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const existing = services.datasets.getDatasetBySlug(slug);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  services.datasets.deleteDataset(existing.id);
  return NextResponse.json({ success: true });
}
