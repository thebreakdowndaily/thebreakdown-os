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
    slug: body.slug || '',
    storySlug: body.storySlug || body.slug || '',
    headline: body.headline || '',
    summary: body.summary || '',
    publishedAt: now,
    updatedAt: now,
    readingTime: body.readingTime || 5,
    author: body.author || { name: 'The Breakdown', role: 'Editorial Team' },
    evidenceScore: body.evidenceScore || 80,
    tags: body.tags || [],
    problem: body.problem || { title: 'Problem', content: '' },
    whoIsAffected: body.whoIsAffected || { title: 'Who is Affected', content: '' },
    rootCauses: body.rootCauses || { title: 'Root Causes', content: '' },
    evidence: body.evidence || { title: 'Evidence', content: '' },
    stakeholders: body.stakeholders || [],
    existingSolutions: body.existingSolutions || [],
    globalExamples: body.globalExamples || [],
    recommendedActions: body.recommendedActions || [],
    citizenActions: body.citizenActions || [],
    governmentActions: body.governmentActions || [],
    metricsToTrack: body.metricsToTrack || [],
    relatedStories: body.relatedStories || [],
    relatedEntities: body.relatedEntities || [],
    sources: body.sources || [],
  };

  const saved = await repo.save(fix);
  syncFix(saved);
  const res: APIResponse<Fix> = { data: saved };
  return NextResponse.json(res, { status: 201 });
}