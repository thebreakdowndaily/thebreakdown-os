import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const { searchParams } = new URL(request.url);
  const metricId = searchParams.get('metricId');

  if (!metricId) return NextResponse.json({ error: 'metricId query parameter is required' }, { status: 400 });

  const series = services.datasets.getSeries(slug, metricId);
  if (series === undefined) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: series });
}
