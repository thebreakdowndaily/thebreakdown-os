import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalTimelineService {
  async findAll(params?: APIListParams): Promise<APIResponse<Timeline[]>> {
    let query = db().from('timelines').select('*', { count: 'exact' });
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('title');
    if (error) throw error;
    return { data: (data || []).map(rowToTimeline), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) {
    const { data, error } = await db().from('timelines').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToTimeline(data) : undefined;
  }

  async findBySlug(slug: string) {
    const { data, error } = await db().from('timelines').select('*').eq('id', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToTimeline(data) : undefined;
  }

  async save(timeline: Timeline) {
    const { data, error } = await db().from('timelines').upsert(rowFromTimeline(timeline)).select().single();
    if (error) throw error;
    return rowToTimeline(data);
  }

  async delete(id: string) {
    const { error } = await db().from('timelines').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

function rowToTimeline(row: any): Timeline {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || '',
    storyIds: [],
    entityIds: [],
    topicIds: [],
    events: row.events || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromTimeline(t: Timeline): any {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    events: t.events,
    updated_at: new Date().toISOString(),
  };
}
