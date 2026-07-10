import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';

export interface TimelineRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Timeline[]>>;
  findById(id: string): Promise<Timeline | undefined>;
  save(timeline: Timeline): Promise<Timeline>;
  update(id: string, updates: Partial<Timeline>): Promise<Timeline>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

import { type TypedDatabase } from '@/supabase/client';

type TimelineRow = TypedDatabase['public']['Tables']['timelines']['Row'];
type TimelineInsert = TypedDatabase['public']['Tables']['timelines']['Insert'];

function sb() { return getSupabaseClient().from('timelines'); }

export class MemoryTimelineRepository implements TimelineRepository {
  private store = new Map<string, Timeline>();
  constructor(timelines?: Timeline[]) { if (timelines) timelines.forEach(t => this.store.set(t.id, t)); }
  async findAll(params?: APIListParams): Promise<APIResponse<Timeline[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }
  async findById(id: string) { return this.store.get(id); }
  async save(timeline: Timeline) { this.store.set(timeline.id, { ...timeline, updatedAt: new Date().toISOString() }); return this.store.get(timeline.id)!; }
  async update(id: string, updates: Partial<Timeline>) { const existing = this.store.get(id); if (!existing) throw new Error(`Timeline ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseTimelineRepository implements TimelineRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Timeline[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToTimeline), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }
  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToTimeline(data) : undefined; }
  async save(timeline: Timeline) { const { data, error } = await sb().upsert(rowFromTimeline(timeline)).select().single(); if (error) throw error; return rowToTimeline(data); }
  async update(id: string, updates: Partial<Timeline>) {
    const { data, error } = await sb().update({ ...rowFromTimeline(updates as Timeline), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToTimeline(data);
  }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToTimeline(row: TimelineRow): Timeline {
  return { 
    id: row.id, 
    title: row.title, 
    description: row.description, 
    category: row.category, 
    storyIds: [], 
    entityIds: [], 
    topicIds: [], 
    events: (row.events as any) || [], 
    createdAt: row.created_at, 
    updatedAt: row.updated_at 
  };
}
function rowFromTimeline(timeline: Timeline): TimelineInsert {
  return { 
    id: timeline.id, 
    title: timeline.title, 
    description: timeline.description, 
    category: timeline.category, 
    events: timeline.events || []
  };
}
