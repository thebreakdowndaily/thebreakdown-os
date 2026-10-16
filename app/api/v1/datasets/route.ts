import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDatasetRepository } from '@/services/repositories/supabase/dataset';
import { requireApiPermission } from '@/features/auth/require-role';
import type { Dataset, APIResponse, APIListParams } from '@/types/canonical';

const repo = new SupabaseDatasetRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.has('page') ? parseInt(searchParams.get('page') ?? '', 10) : undefined,
    pageSize: searchParams.has('pageSize') ? parseInt(searchParams.get('pageSize') ?? '', 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.getDatasets(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission('dataset.create', request);
  if ('response' in auth) return auth.response;

  const body = (await request.json()) as Partial<Dataset>;
  if (!body.slug?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const dataset: Dataset = {
    id: body.id || crypto.randomUUID(),
    slug: body.slug.trim(),
    title: body.title.trim(),
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

  const saved = await repo.saveDataset(dataset);
  const res: APIResponse<Dataset> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
