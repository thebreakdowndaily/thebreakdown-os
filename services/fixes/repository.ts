import type { Fix, APIListParams, APIResponse, StoryStatus } from '@/types/canonical';
import { getSupabaseClient, type TypedDatabase } from '@/supabase/client';

export interface FixRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Fix[]>>;
  findById(id: string): Promise<Fix | undefined>;
  findBySlug(slug: string): Promise<Fix | undefined>;
  save(fix: Fix): Promise<Fix>;
  update(id: string, updates: Partial<Fix>): Promise<Fix>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

type FixRow = TypedDatabase['public']['Tables']['fixes']['Row'];
type FixInsert = TypedDatabase['public']['Tables']['fixes']['Insert'];

function sb() { return getSupabaseClient().from('fixes'); }

export class MemoryFixRepository implements FixRepository {
  private store = new Map<string, Fix>();
  constructor(fixes?: Fix[]) { if (fixes) fixes.forEach(f => this.store.set(f.id, f)); }
  async findAll(params?: APIListParams): Promise<APIResponse<Fix[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(f => f.headline.toLowerCase().includes(q) || f.problem.content.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }
  async findById(id: string) { return this.store.get(id); }
  async findBySlug(slug: string) { return Array.from(this.store.values()).find(f => f.slug === slug); }
  async save(fix: Fix) { this.store.set(fix.id, { ...fix, updatedAt: new Date().toISOString() }); return this.store.get(fix.id)!; }
  async update(id: string, updates: Partial<Fix>) { const existing = this.store.get(id); if (!existing) throw new Error(`Fix ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseFixRepository implements FixRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Fix[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,problem.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToFix), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }
  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToFix(data) : undefined; }
  async findBySlug(slug: string) { const { data, error } = await sb().select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToFix(data) : undefined; }
  async save(fix: Fix) { const { data, error } = await sb().upsert(rowFromFix(fix)).select().single(); if (error) throw error; return rowToFix(data); }
  async update(id: string, updates: Partial<Fix>) {
    const { data, error } = await sb().update({ ...rowFromFix(updates as Fix), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToFix(data);
  }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToFix(row: import('@/supabase/client').TypedDatabase['public']['Tables']['fixes']['Row']): Fix {
  return {
    id: row.id,
    slug: row.slug,
    storySlug: row.slug,
    headline: row.title,
    summary: '',
    publishedAt: row.created_at,
    updatedAt: row.updated_at,
    readingTime: 5,
    author: { name: 'The Breakdown', role: 'Editorial Team', bio: '' },
    evidenceScore: 80,
    tags: row.tags || [],
    problem: { title: 'Problem', content: row.problem || '' },
    whoIsAffected: { title: 'Who is Affected', content: '' },
    rootCauses: { title: 'Root Causes', content: (row.root_causes || []).join(', ') },
    evidence: { title: 'Evidence', content: '' },
    stakeholders: [],
    existingSolutions: (row.existing_solutions?.map(s => typeof s === 'string' ? JSON.parse(s) : s) as import('@/types/canonical').ExistingSolution[]) || [],
    globalExamples: (row.global_examples?.map(g => typeof g === 'string' ? JSON.parse(g) : g) as import('@/types/canonical').GlobalExample[]) || [],
    recommendedActions: (row.recommended_actions?.map(r => typeof r === 'string' ? JSON.parse(r) : r) as import('@/types/canonical').FixAction[]) || [],
    citizenActions: (row.citizen_actions?.map(c => typeof c === 'string' ? JSON.parse(c) : { title: c, description: '', priority: 'medium', timeframe: 'medium-term', actors: [] }) as import('@/types/canonical').FixAction[]) || [],
    governmentActions: (row.government_actions?.map(g => typeof g === 'string' ? JSON.parse(g) : { title: g, description: '', priority: 'medium', timeframe: 'medium-term', actors: [] }) as import('@/types/canonical').FixAction[]) || [],
    metricsToTrack: (row.metrics as import('@/types/canonical').FixMetric[]) || [],
    relatedStories: [],
    relatedEntities: [],
    sources: [],
  };
}
function rowFromFix(f: Fix): FixInsert {
  return {
    id: f.id,
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
    updated_at: new Date().toISOString()
  };
}
