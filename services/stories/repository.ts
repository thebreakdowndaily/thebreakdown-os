import type { Story, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient, type TypedDatabase } from '@/supabase/client';

export interface StoryRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Story[]>>;
  findById(id: string): Promise<Story | undefined>;
  findBySlug(slug: string): Promise<Story | undefined>;
  save(story: Story): Promise<Story>;
  update(id: string, updates: Partial<Story>): Promise<Story>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

type StoryRow = TypedDatabase['public']['Tables']['stories']['Row'];
type StoryInsert = TypedDatabase['public']['Tables']['stories']['Insert'];

function sb() { return getSupabaseClient().from('stories'); }

export class MemoryStoryRepository implements StoryRepository {
  private store = new Map<string, Story>();

  constructor(stories?: Story[]) { if (stories) stories.forEach(s => this.store.set(s.id, s)); }

  async findAll(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async findById(id: string) { return this.store.get(id); }
  async findBySlug(slug: string) { return Array.from(this.store.values()).find(s => s.slug === slug); }
  async save(story: Story) { this.store.set(story.id, { ...story, updatedAt: new Date().toISOString() }); return this.store.get(story.id)!; }
  async update(id: string, updates: Partial<Story>) { const existing = this.store.get(id); if (!existing) throw new Error(`Story ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseStoryRepository implements StoryRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,summary.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToStory), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToStory(data) : undefined; }
  async findBySlug(slug: string) { const { data, error } = await sb().select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToStory(data) : undefined; }
  async save(story: Story) { const { data, error } = await sb().upsert(rowFromStory(story)).select().single(); if (error) throw error; return rowToStory(data); }
  async update(id: string, updates: Partial<Story>) {
    const { data, error } = await sb().update({ ...rowFromStory(updates as Story), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToStory(data);
  }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToStory(row: StoryRow): Story {
  const content = row.content as { blocks?: import('@/types/canonical').StoryBlock[] } | null;
  return {
    id: row.id, slug: row.slug, title: row.title, headline: row.title, summary: row.summary,
    heroImage: row.hero_image || '', author: row.author_id || '', category: row.category || '',
    status: (row.status as Story['status']) || 'draft',
    evidenceScore: 0, readingTime: 0, publishedAt: row.published_at || '',
    createdAt: row.created_at, updatedAt: row.updated_at,
    tags: row.tags || [], blocks: content?.blocks || [],
    sources: [], claims: [], timeline: [], faq: [], charts: [],
    relatedStoryIds: row.related_story_ids || [], relatedEntityIds: row.related_entity_ids || [],
    relatedTopicIds: row.related_topic_ids || [],
  };
}

function rowFromStory(story: Story): StoryInsert {
  return {
    id: story.id, slug: story.slug, title: story.title, summary: story.summary,
    content: { blocks: story.blocks || [] },
    author_id: story.author, category: story.category, status: story.status,
    tags: story.tags || [], published_at: story.publishedAt || null,
    hero_image: story.heroImage || null,
    related_story_ids: story.relatedStoryIds || null,
    related_entity_ids: story.relatedEntityIds || null,
    related_topic_ids: story.relatedTopicIds || null,
  };
}
