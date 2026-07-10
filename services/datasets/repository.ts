import type { Dataset, APIResponse, APIListParams, DatasetCategory, DatasetFrequency } from '@/types/canonical';
import { getSupabaseClient, type TypedDatabase } from '@/supabase/client';

// ─── Sync Repository (used by existing MemoryDatasetService) ──────────────

export interface DatasetRepository {
  findAll(params?: APIListParams): APIResponse<Dataset[]>;
  findById(id: string): Dataset | undefined;
  findBySlug(slug: string): Dataset | undefined;
  save(dataset: Dataset): Dataset;
  update(id: string, updates: Partial<Dataset>): Dataset;
  delete(id: string): boolean;
  count(): number;
}

export class MemoryDatasetRepository implements DatasetRepository {
  private store = new Map<string, Dataset>();

  constructor(datasets?: Dataset[]) {
    if (datasets) datasets.forEach(d => this.store.set(d.id, d));
  }

  findAll(params?: APIListParams): APIResponse<Dataset[]> {
    let list = Array.from(this.store.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.tags?.some(t => t.toLowerCase().includes(q)));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const pg = params.page;
      const ps = params.pageSize;
      const start = (pg - 1) * ps;
      list = list.slice(start, start + ps);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  findById(id: string) { return this.store.get(id); }
  findBySlug(slug: string) { return Array.from(this.store.values()).find(d => d.slug === slug); }
  save(dataset: Dataset) { const now = new Date().toISOString(); const d = { ...dataset, updatedAt: now, createdAt: dataset.createdAt || now }; this.store.set(d.id, d); return d; }
  update(id: string, updates: Partial<Dataset>) { const existing = this.store.get(id); if (!existing) throw new Error(`Dataset ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  delete(id: string) { return this.store.delete(id); }
  count() { return this.store.size; }
}

// ─── Async Repository (used by SupabaseDatasetService) ────────────────────

type DatasetRow = TypedDatabase['public']['Tables']['datasets']['Row'];
type DatasetInsert = TypedDatabase['public']['Tables']['datasets']['Insert'];
type DatasetUpdate = TypedDatabase['public']['Tables']['datasets']['Update'];

function sb() { return getSupabaseClient().from('datasets'); }

export interface AsyncDatasetRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Dataset[]>>;
  findById(id: string): Promise<Dataset | undefined>;
  findBySlug(slug: string): Promise<Dataset | undefined>;
  save(dataset: Dataset): Promise<Dataset>;
  update(id: string, updates: Partial<Dataset>): Promise<Dataset>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export class SupabaseDatasetRepository implements AsyncDatasetRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Dataset[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToDataset), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToDataset(data) : undefined; }
  async findBySlug(slug: string) { const { data, error } = await sb().select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToDataset(data) : undefined; }
  async save(dataset: Dataset) { const { data, error } = await sb().upsert(rowFromDataset(dataset)).select().single(); if (error) throw error; return rowToDataset(data); }
  async update(id: string, updates: Partial<Dataset>) {
    const { data, error } = await sb().update({ ...rowFromDataset(updates as Dataset), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToDataset(data);
  }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToDataset(row: DatasetRow): Dataset {
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description,
    category: (row.category as DatasetCategory) || 'economics',
    frequency: (row.frequency as DatasetFrequency) || 'annual',
    unitLabel: row.unit_label || '', source: row.source || '', sourceUrl: row.source_url || '',
    methodology: row.methodology || '', tags: row.tags || [],
    versions: [], metrics: [], dimensions: [], visualizations: [],
    relatedEntityIds: row.related_entity_ids || [],
    relatedStoryIds: row.related_story_ids || [],
    relatedTopicIds: row.related_topic_ids || [],
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function rowFromDataset(dataset: Dataset): DatasetInsert {
  return {
    id: dataset.id,
    slug: dataset.slug,
    title: dataset.title,
    description: dataset.description,
    category: dataset.category,
    frequency: dataset.frequency,
    unit_label: dataset.unitLabel,
    source: dataset.source,
    source_url: dataset.sourceUrl,
    methodology: dataset.methodology,
    tags: dataset.tags,
    related_entity_ids: dataset.relatedEntityIds || [],
    related_story_ids: dataset.relatedStoryIds || [],
    related_topic_ids: dataset.relatedTopicIds || [],
  };
}
