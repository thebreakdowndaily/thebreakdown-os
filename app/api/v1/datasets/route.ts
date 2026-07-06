import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Dataset, APIResponse, APIListParams } from '@/types/canonical';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const services = getServices();

  const params: APIListParams = {
    page: searchParams.has('page') ? parseInt(searchParams.get('page') ?? '', 10) : undefined,
    pageSize: searchParams.has('pageSize') ? parseInt(searchParams.get('pageSize') ?? '', 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = services.datasets.getDatasets(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
  const body = (await request.json()) as Partial<Dataset>;

  const now = new Date().toISOString();
  const dataset: Dataset = {
    id: body.id || crypto.randomUUID(),
    slug: body.slug || '',
    title: body.title || '',
    description: body.description || '',
    category: body.category || 'economy',
    frequency: body.frequency || 'annual',
    unitLabel: body.unitLabel || '',
    source: body.source || '',
    sourceUrl: body.sourceUrl || '',
    methodology: body.methodology || '',
    tags: body.tags || [],
    versions: body.versions || [],
    metrics: body.metrics || [],
    dimensions: body.dimensions || [],
    visualizations: body.visualizations || [],
    relatedEntityIds: body.relatedEntityIds || [],
    relatedStoryIds: body.relatedStoryIds || [],
    relatedTopicIds: body.relatedTopicIds || [],
    createdAt: now,
    updatedAt: now,
  };

  const saved = services.datasets.saveDataset(dataset);
  const res: APIResponse<Dataset> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
