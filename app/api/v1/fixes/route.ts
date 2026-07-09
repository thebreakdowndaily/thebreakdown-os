import { NextRequest, NextResponse } from 'next/server';
import { SupabaseFixRepository } from '@/services/fixes/repository';
import type { Fix, APIResponse, APIListParams } from '@/types/canonical';
import { syncFix } from '@/lib/data-sync';

const repo = new SupabaseFixRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: APIListParams = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const result = await repo.findAll(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
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

  const saved = await repo.save(fix);
  syncFix(saved);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}