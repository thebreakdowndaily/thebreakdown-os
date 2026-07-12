import type { Fix, ExistingSolution, GlobalExample, FixAction, FixMetric, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';
import type { TypedDatabase } from '@/supabase/client';
import type { FixService } from '../../interfaces/fix';

type FixRow = TypedDatabase['public']['Tables']['fixes']['Row'];
type FixInsert = TypedDatabase['public']['Tables']['fixes']['Insert'];

function sb() { return getSupabaseClient().from('fixes'); }

export class SupabaseFixRepository implements FixService {
  async getFixes(params?: APIListParams): Promise<APIResponse<Fix[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,problem.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToFix), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getFix(id: string) {
    const { data, error } = await sb().select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToFix(data) : undefined;
  }

  async getFixBySlug(slug: string) {
    const { data, error } = await sb().select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToFix(data) : undefined;
  }

  async saveFix(fix: Fix) {
    const id = fix.id || crypto.randomUUID();
    await sb().upsert(rowFromFix(fix, id)).select().single();
    return fix;
  }

  async deleteFix(id: string) {
    const { error } = await sb().delete().eq('id', id);
    if (error) throw error;
  }

  async count() {
    const { count, error } = await sb().select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
}

function rowToFix(row: FixRow): Fix {
  return {
    id: row.id,
    slug: row.slug || '',
    storySlug: row.slug || '',
    headline: row.title || '',
    summary: '',
    heroImage: undefined,
    publishedAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    readingTime: 5,
    author: { name: 'The Breakdown', role: 'Editorial Team' },
    evidenceScore: 80,
    tags: row.tags || [],
    problem: { title: 'Problem', content: row.problem || '' },
    whoIsAffected: { title: 'Who is Affected', content: '' },
    rootCauses: { title: 'Root Causes', content: (row.root_causes || []).join(', ') },
    evidence: { title: 'Evidence', content: '' },
    stakeholders: [],
    existingSolutions: (row.existing_solutions?.map(s => typeof s === 'string' ? JSON.parse(s) : s) as ExistingSolution[]) || [],
    globalExamples: (row.global_examples?.map(g => typeof g === 'string' ? JSON.parse(g) : g) as GlobalExample[]) || [],
    recommendedActions: (row.recommended_actions?.map(r => typeof r === 'string' ? JSON.parse(r) : r) as FixAction[]) || [],
    citizenActions: (row.citizen_actions?.map(c => typeof c === 'string' ? JSON.parse(c) : { title: c, description: '', priority: 'medium', timeframe: 'medium-term', actors: [] }) as FixAction[]) || [],
    governmentActions: (row.government_actions?.map(g => typeof g === 'string' ? JSON.parse(g) : { title: g, description: '', priority: 'medium', timeframe: 'medium-term', actors: [] }) as FixAction[]) || [],
    metricsToTrack: (row.metrics as FixMetric[]) || [],
    relatedStories: [],
    relatedEntities: [],
    sources: [],
  };
}

function rowFromFix(f: Fix, id: string): FixInsert {
  return {
    id,
    slug: f.slug,
    title: f.headline,
    problem: f.problem.content,
    root_causes: [f.rootCauses.content],
    existing_solutions: f.existingSolutions.map(s => JSON.stringify(s)),
    global_examples: f.globalExamples.map(g => JSON.stringify(g)),
    recommended_actions: f.recommendedActions.map(r => JSON.stringify(r)),
    citizen_actions: f.citizenActions.map(c => JSON.stringify(c)),
    government_actions: f.governmentActions.map(g => JSON.stringify(g)),
    metrics: f.metricsToTrack,
    status: 'draft',
    updated_at: new Date().toISOString(),
  };
}
