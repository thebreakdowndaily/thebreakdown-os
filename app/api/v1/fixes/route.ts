import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import type { Fix, APIResponse, APIListParams } from '@/types/canonical';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const services = getServices();

  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize');
  const params: APIListParams = {
    page: pageStr ? parseInt(pageStr, 10) : undefined,
    pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = services.fixes.getFixes(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const services = getServices();
  const body = (await request.json()) as Partial<Fix>;

  const now = new Date().toISOString();
  const fix: Fix = {
    id: body.id || crypto.randomUUID(),
    title: body.title || '',
    slug: body.slug || '',
    problem: body.problem || '',
    rootCauses: body.rootCauses || [],
    existingSolutions: body.existingSolutions || [],
    globalExamples: body.globalExamples || [],
    recommendedActions: body.recommendedActions || [],
    citizenActions: body.citizenActions || [],
    governmentActions: body.governmentActions || [],
    metrics: body.metrics || [],
    status: body.status || 'draft',
    createdAt: now,
    updatedAt: now,
  };

  const saved = services.fixes.saveFix(fix);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}
