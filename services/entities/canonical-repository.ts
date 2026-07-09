import type { Entity, EntityKind, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalEntityService {
  async findAll(params?: APIListParams): Promise<APIResponse<Entity[]>> {
    let query = db().from('entities').select('*', { count: 'exact' });
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('name');
    if (error) throw error;
    return { data: (data || []).map(rowToEntity), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) {
    const { data, error } = await db().from('entities').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToEntity(data) : undefined;
  }

  async findBySlug(slug: string) {
    const { data, error } = await db().from('entities').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToEntity(data) : undefined;
  }

  async findByAlias(alias: string) {
    const { data, error } = await db().from('entities').select('*').contains('aliases', [alias]);
    if (error) throw error;
    return data?.length ? rowToEntity(data[0]) : undefined;
  }

  async findByType(type: EntityKind) {
    const { data, error } = await db().from('entities').select('*').eq('type', type);
    if (error) throw error;
    return (data || []).map(rowToEntity);
  }

  async save(entity: Entity) {
    const { data, error } = await db().from('entities').upsert(rowFromEntity(entity)).select().single();
    if (error) throw error;
    return rowToEntity(data);
  }

  async delete(id: string) {
    const { error } = await db().from('entities').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

function rowToEntity(row: any): Entity {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description || '',
    aliases: row.aliases || [],
    image: row.image || '',
    storyCount: row.story_count || 0,
    evidenceScore: row.evidence_score || 0,
    relatedEntityIds: [],
    relatedStoryIds: [],
    relatedTopicIds: [],
    statistics: row.statistics || [],
    timeline: row.timeline || [],
    faq: row.faq || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromEntity(e: Entity): any {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    type: e.type,
    description: e.description,
    aliases: e.aliases,
    image: e.image,
    story_count: e.storyCount,
    evidence_score: e.evidenceScore,
    statistics: e.statistics,
    timeline: e.timeline,
    faq: e.faq,
    updated_at: new Date().toISOString(),
  };
}
