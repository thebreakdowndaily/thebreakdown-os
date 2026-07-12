import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Series } from '@/types/canonical';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const dataset = await services.datasets.getDatasetBySlug(slug);
  if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const history = await services.datasets.getHistory(slug);
  return NextResponse.json({ data: history, total: history.length });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const body = await _request.json().catch(() => ({}));
  const { notes, version: versionStr, series } = body as { notes?: string; version?: string; series?: Series[] };
  const version = await services.datasets.createVersion(slug, {
    id: '',
    version: versionStr || '',
    notes: notes || '',
    publishedAt: new Date().toISOString(),
    series: series || [],
    metadata: {},
  });
  if (!version) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: version }, { status: 201 });
}
