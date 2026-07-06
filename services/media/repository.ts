import type { MediaItem, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';

export interface MediaRepository {
  findAll(params?: APIListParams): Promise<APIResponse<MediaItem[]>>;
  findById(id: string): Promise<MediaItem | undefined>;
  findByTags(tags: string[]): Promise<MediaItem[]>;
  save(item: MediaItem): Promise<MediaItem>;
  update(id: string, updates: Partial<MediaItem>): Promise<MediaItem>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

function sb() { return getSupabaseClient().from('media_items') as any; }

export class MemoryMediaRepository implements MediaRepository {
  private store = new Map<string, MediaItem>();
  constructor(items?: MediaItem[]) { if (items) items.forEach(i => this.store.set(i.id, i)); }
  async findAll(params?: APIListParams): Promise<APIResponse<MediaItem[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(i => i.caption.toLowerCase().includes(q) || i.alt.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }
  async findById(id: string) { return this.store.get(id); }
  async findByTags(tags: string[]) { return Array.from(this.store.values()).filter(i => tags.some(t => i.tags?.includes(t))); }
  async save(item: MediaItem) { this.store.set(item.id, { ...item, updatedAt: new Date().toISOString() }); return this.store.get(item.id)!; }
  async update(id: string, updates: Partial<MediaItem>) { const existing = this.store.get(id); if (!existing) throw new Error(`MediaItem ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseMediaRepository implements MediaRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<MediaItem[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.ilike('title', `%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToMediaItem), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }
  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToMediaItem(data) : undefined; }
  async findByTags(tags: string[]) { const { data, error } = await sb().select('*').contains('tags', tags); if (error) throw error; return (data || []).map(rowToMediaItem); }
  async save(item: MediaItem) { const { data, error } = await sb().upsert(rowFromMediaItem(item)).select().single(); if (error) throw error; return rowToMediaItem(data); }
  async update(id: string, updates: Partial<MediaItem>) { const { data, error } = await sb().update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single(); if (error) throw error; return rowToMediaItem(data); }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToMediaItem(row: any): MediaItem {
  return { id: row.id, type: row.type, src: row.src, alt: row.alt || '', caption: row.caption || '', tags: row.tags || [], credit: row.credit || '', width: row.width, height: row.height, fileSize: row.file_size, version: row.version ?? 1, createdAt: row.created_at, updatedAt: row.updated_at };
}
function rowFromMediaItem(item: MediaItem): any {
  return { type: item.type, src: item.src, alt: item.alt || '', caption: item.caption || '', tags: item.tags || [], credit: item.credit || '', width: item.width, height: item.height, file_size: item.fileSize, version: item.version ?? 1 };
}
