import type { Fix, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalFixService {
  async findAll(params?: APIListParams): Promise<APIResponse<Fix[]>> {
    let query = db().from('fixes').select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,problem.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return { data: (data || []).map(rowToFix), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) {
    const { data, error } = await db().from('fixes').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToFix(data) : undefined;
  }

  async findBySlug(slug: string) {
    const { data, error } = await db().from('fixes').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToFix(data) : undefined;
  }

  async save(fix: Fix) {
    const { data, error } = await db().from('fixes').upsert(rowFromFix(fix)).select().single();
    if (error) throw error;
    return rowToFix(data);
  }

  async delete(id: string) {
    const { error } = await db().from('fixes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

function rowToFix(row: any): Fix {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    problem: row.problem || '',
    rootCauses: row.root_causes || [],
    existingSolutions: row.existing_solutions || [],
    globalExamples: row.global_examples || [],
    recommendedActions: row.recommended_actions || [],
    citizenActions: row.citizen_actions || [],
    governmentActions: row.government_actions || [],
    metrics: row.metrics || [],
    status: row.status || 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromFix(f: Fix): any {
  return {
    id: f.id,
    slug: f.slug,
    title: f.title,
    problem: f.problem,
    root_causes: f.rootCauses,
    existing_solutions: f.existingSolutions,
    global_examples: f.globalExamples,
    recommended_actions: f.recommendedActions,
    citizen_actions: f.citizenActions,
    government_actions: f.governmentActions,
    metrics: f.metrics,
    status: f.status,
    updated_at: new Date().toISOString(),
  };
}
