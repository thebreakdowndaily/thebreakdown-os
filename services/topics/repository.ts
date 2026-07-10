import type { Topic, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient, type TypedDatabase } from '@/supabase/client';

export interface TopicRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Topic[]>>;
  findById(id: string): Promise<Topic | undefined>;
  findBySlug(slug: string): Promise<Topic | undefined>;
  save(topic: Topic): Promise<Topic>;
  update(id: string, updates: Partial<Topic>): Promise<Topic>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

type TopicRow = TypedDatabase['public']['Tables']['topics']['Row'];
type TopicInsert = TypedDatabase['public']['Tables']['topics']['Insert'];

function sb() { return getSupabaseClient().from('topics'); }

export class MemoryTopicRepository implements TopicRepository {
  private store = new Map<string, Topic>();
  constructor(topics?: Topic[]) { if (topics) topics.forEach(t => this.store.set(t.id, t)); }
  async findAll(params?: APIListParams): Promise<APIResponse<Topic[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }
  async findById(id: string) { return this.store.get(id); }
  async findBySlug(slug: string) { return Array.from(this.store.values()).find(t => t.slug === slug); }
  async save(topic: Topic) { this.store.set(topic.id, { ...topic, updatedAt: new Date().toISOString() }); return this.store.get(topic.id)!; }
  async update(id: string, updates: Partial<Topic>) { const existing = this.store.get(id); if (!existing) throw new Error(`Topic ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseTopicRepository implements TopicRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Topic[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToTopic), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }
  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToTopic(data) : undefined; }
  async findBySlug(slug: string) { const { data, error } = await sb().select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToTopic(data) : undefined; }
  async save(topic: Topic) { const { data, error } = await sb().upsert(rowFromTopic(topic)).select().single(); if (error) throw error; return rowToTopic(data); }
  async update(id: string, updates: Partial<Topic>) {
    const { data, error } = await sb().update({ ...rowFromTopic(updates as Topic), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToTopic(data);
  }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    storyIds: row.story_ids || [],
    relatedEntityIds: row.related_entity_ids || [],
    featuredStoryIds: row.featured_story_ids || [],
    countries: row.countries || [],
    faq: (row.faq as any[]) || [],
    timeline: (row.timeline as any[]) || [],
    statistics: (row.statistics as any[]) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function rowFromTopic(topic: Topic): TopicInsert {
  return {
    id: topic.id,
    slug: topic.slug,
    name: topic.name,
    description: topic.description,
    story_ids: topic.storyIds || [],
    related_entity_ids: topic.relatedEntityIds || [],
    featured_story_ids: topic.featuredStoryIds || [],
    countries: topic.countries || [],
    faq: topic.faq,
    timeline: topic.timeline,
    statistics: topic.statistics
  };
}
