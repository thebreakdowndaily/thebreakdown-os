import type { Topic, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';
import type { TypedDatabase } from '@/supabase/client';
import type { TopicService } from '../../interfaces/topic';

type TopicRow = TypedDatabase['public']['Tables']['topics']['Row'];
type TopicInsert = TypedDatabase['public']['Tables']['topics']['Insert'];

export class SupabaseTopicRepository implements TopicService {
  async getTopics(params?: APIListParams): Promise<APIResponse<Topic[]>> {
    let query = db().from('topics').select('*', { count: 'exact' });
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('name');
    if (error) throw error;
    return { data: (data || []).map(rowToTopic), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getTopic(id: string) {
    const { data, error } = await db().from('topics').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToTopic(data) : undefined;
  }

  async getTopicBySlug(slug: string) {
    const { data, error } = await db().from('topics').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToTopic(data) : undefined;
  }

  async saveTopic(topic: Topic) {
    const { data, error } = await db().from('topics').upsert(rowFromTopic(topic)).select().single();
    if (error) throw error;
    return rowToTopic(data);
  }

  async deleteTopic(id: string) {
    const { error } = await db().from('topics').delete().eq('id', id);
    if (error) throw error;
  }

  async count() {
    const { count, error } = await db().from('topics').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
}

function rowToTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    overview: undefined,
    image: '',
    storyIds: row.story_ids || [],
    relatedEntityIds: row.related_entity_ids || [],
    featuredStoryIds: row.featured_story_ids || [],
    countries: row.countries || [],
    faq: (row.faq as import('@/types/canonical').FAQItem[]) || [],
    timeline: (row.timeline as import('@/types/canonical').TimelineEvent[]) || [],
    statistics: (row.statistics as import('@/types/canonical').StatItem[]) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromTopic(t: Topic): TopicInsert {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    category: '',
    tags: [],
    related_entity_ids: t.relatedEntityIds,
    related_story_ids: [],
    story_ids: t.storyIds,
    featured_story_ids: t.featuredStoryIds,
    countries: t.countries,
    faq: t.faq,
    statistics: t.statistics,
    timeline: t.timeline,
    updated_at: new Date().toISOString(),
  };
}
