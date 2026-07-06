import type { Entity, EntityKind, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';

export interface EntityRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Entity[]>>;
  findById(id: string): Promise<Entity | undefined>;
  findBySlug(slug: string): Promise<Entity | undefined>;
  findByType(type: EntityKind): Promise<Entity[]>;
  findByAlias(alias: string): Promise<Entity | undefined>;
  save(entity: Entity): Promise<Entity>;
  update(id: string, updates: Partial<Entity>): Promise<Entity>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

function sb() { return getSupabaseClient().from('entities') as any; }

export class MemoryEntityRepository implements EntityRepository {
  private store = new Map<string, Entity>();
  constructor(entities?: Entity[]) { if (entities) entities.forEach(e => this.store.set(e.id, e)); }
  async findAll(params?: APIListParams): Promise<APIResponse<Entity[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }
  async findById(id: string) { return this.store.get(id); }
  async findBySlug(slug: string) { return Array.from(this.store.values()).find(e => e.slug === slug); }
  async findByType(type: EntityKind) { return Array.from(this.store.values()).filter(e => e.type === type); }
  async findByAlias(alias: string) { return Array.from(this.store.values()).find(e => e.aliases?.includes(alias)); }
  async save(entity: Entity) { this.store.set(entity.id, { ...entity, updatedAt: new Date().toISOString() }); return this.store.get(entity.id)!; }
  async update(id: string, updates: Partial<Entity>) { const existing = this.store.get(id); if (!existing) throw new Error(`Entity ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}

export class SupabaseEntityRepository implements EntityRepository {
  async findAll(params?: APIListParams): Promise<APIResponse<Entity[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToEntity), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }
  async findById(id: string) { const { data, error } = await sb().select('*').eq('id', id).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToEntity(data) : undefined; }
  async findBySlug(slug: string) { const { data, error } = await sb().select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return data ? rowToEntity(data) : undefined; }
  async findByType(type: EntityKind) { const { data, error } = await sb().select('*').eq('type', type); if (error) throw error; return (data || []).map(rowToEntity); }
  async findByAlias(alias: string) { const { data, error } = await sb().select('*').contains('aliases', [alias]); if (error) throw error; return data?.[0] ? rowToEntity(data[0]) : undefined; }
  async save(entity: Entity) { const { data, error } = await sb().upsert(rowFromEntity(entity)).select().single(); if (error) throw error; return rowToEntity(data); }
  async update(id: string, updates: Partial<Entity>) { const { data, error } = await sb().update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single(); if (error) throw error; return rowToEntity(data); }
  async delete(id: string) { const { error } = await sb().delete().eq('id', id); if (error) throw error; return true; }
  async count() { const { count, error } = await sb().select('*', { count: 'exact', head: true }); if (error) throw error; return count || 0; }
}

function rowToEntity(row: any): Entity {
  return { id: row.id, slug: row.slug, name: row.name, description: row.description, type: row.type, aliases: row.aliases || [], image: row.image, storyCount: row.story_count ?? 0, evidenceScore: row.evidence_score ?? 0, relatedEntityIds: row.related_entity_ids ?? [], relatedStoryIds: row.related_story_ids ?? [], relatedTopicIds: row.related_topic_ids ?? [], statistics: row.statistics ?? [], timeline: row.timeline ?? [], faq: row.faq ?? [], createdAt: row.created_at, updatedAt: row.updated_at };
}
function rowFromEntity(entity: Entity): any {
  return { slug: entity.slug, name: entity.name, description: entity.description, type: entity.type, aliases: entity.aliases || [], image: entity.image, story_count: entity.storyCount, evidence_score: entity.evidenceScore, related_entity_ids: entity.relatedEntityIds, related_story_ids: entity.relatedStoryIds, related_topic_ids: entity.relatedTopicIds, statistics: entity.statistics, timeline: entity.timeline, faq: entity.faq };
}
