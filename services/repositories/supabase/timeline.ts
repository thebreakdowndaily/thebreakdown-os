import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';
import type { TypedDatabase } from '@/supabase/client';
import type { TimelineService } from '../../interfaces/timeline';

type TimelineRow = TypedDatabase['public']['Tables']['timelines']['Row'];
type TimelineInsert = TypedDatabase['public']['Tables']['timelines']['Insert'];

function e() { return db().from('timelines'); }

export class SupabaseTimelineRepository implements TimelineService {
  async getTimelines(params?: APIListParams): Promise<APIResponse<Timeline[]>> {
    let query = e().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    const { data, count, error } = await query.order('title');
    if (error) throw error;
    return { data: (data || []).map(rowToTimeline), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getTimeline(id: string) {
    const { data, error } = await e().select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToTimeline(data) : undefined;
  }

  async saveTimeline(timeline: Timeline) {
    const { data, error } = await e().upsert(rowFromTimeline(timeline)).select().single();
    if (error) throw error;
    return rowToTimeline(data);
  }

  async deleteTimeline(id: string) {
    const { error } = await e().delete().eq('id', id);
    if (error) throw error;
  }

  async count() {
    const { count, error } = await e().select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
}

function rowToTimeline(row: TimelineRow): Timeline {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || '',
    storyIds: row.story_ids || [],
    entityIds: row.entity_ids || [],
    topicIds: row.topic_ids || [],
    events: (row.events as import('@/types/canonical').TimelineEvent[]) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromTimeline(t: Timeline): TimelineInsert {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    story_ids: t.storyIds,
    entity_ids: t.entityIds,
    topic_ids: t.topicIds,
    events: t.events,
    updated_at: new Date().toISOString(),
  };
}
