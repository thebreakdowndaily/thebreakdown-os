import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const services = getServices();
  const slug = (await params).slug;
  const dataset = await services.datasets.getDatasetBySlug(slug);
  if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';

  const latestVersion = dataset.versions.toSorted(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];
  if (!latestVersion) return NextResponse.json({ error: 'No versions available' }, { status: 404 });

  if (format === 'json') {
    const jsonData = latestVersion.series.flatMap(s =>
      s.observations.map(o => ({
        period: o.period,
        value: o.value,
        annotation: o.annotation,
        metricId: s.metricId,
      }))
    );
    return NextResponse.json({ data: jsonData, meta: { dataset: dataset.title, version: latestVersion.version } });
  }

  const headers = ['Period', ...dataset.metrics.map(m => m.label), 'Notes'];
  const obsMap = new Map<string, Record<string, string | number | null>>();
  for (const series of latestVersion.series) {
    const metric = dataset.metrics.find(m => m.id === series.metricId);
    const label = metric?.label || series.metricId;
    for (const obs of series.observations) {
      if (!obsMap.has(obs.period)) obsMap.set(obs.period, {});
      obsMap.get(obs.period)![label] = obs.value;
      obsMap.get(obs.period)!['_annotation'] = obs.annotation || '';
    }
  }
  const periods = Array.from(obsMap.keys()).sort();
  const csvRows = [headers.join(',')];
  for (const period of periods) {
    const row = obsMap.get(period)!;
    const values = headers.map(h => {
      if (h === 'Period') return period;
      if (h === 'Notes') return `"${(row['_annotation'] as string) || ''}"`;
      return row[h] !== undefined ? String(row[h]) : '';
    });
    csvRows.push(values.join(','));
  }
  const csv = csvRows.join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${slug}-data.csv"`,
    },
  });
}
