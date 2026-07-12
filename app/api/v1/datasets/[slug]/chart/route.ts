import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const { searchParams } = new URL(request.url);
  const vizId = searchParams.get('vizId') || '';
  if (!vizId) return NextResponse.json({ error: 'vizId query parameter is required' }, { status: 400 });
  const chartData = await services.datasets.getChartData(slug, vizId);
  return NextResponse.json({ data: chartData });
}
