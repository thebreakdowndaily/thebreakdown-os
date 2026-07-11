import type { Story, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalStoryService {
  async findAll(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let query = db().from('stories').select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,summary.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('published_at', { ascending: false });
    if (error) throw error;
    return { data: (data || []).map(rowToStory), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async findById(id: string) {
    const { data, error } = await db().from('stories').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToStory(data) : undefined;
  }

  async findBySlug(slug: string) {
    const { data, error } = await db().from('stories').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToStory(data) : undefined;
  }

  async save(story: Story) {
    const { data, error } = await db().from('stories').upsert(rowFromStory(story)).select().single();
    if (error) throw error;
    return rowToStory(data);
  }

  async delete(id: string) {
    const { error } = await db().from('stories').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

function rowToStory(row: import('@/supabase/client').TypedDatabase['public']['Tables']['stories']['Row']): Story {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    headline: row.title,
    summary: row.summary || '',
    heroImage: row.hero_image || '',
    author: row.author_id || '',
    category: row.category || '',
    status: (row.status as import('@/types/canonical').StoryStatus) || 'draft',
    evidenceScore: 0,
    readingTime: 0,
    publishedAt: row.published_at || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags || [],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: row.related_story_ids || [],
    relatedEntityIds: row.related_entity_ids || [],
    relatedTopicIds: row.related_topic_ids || [],
  };
}

function rowFromStory(s: Story): import('@/supabase/client').TypedDatabase['public']['Tables']['stories']['Insert'] {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    content: s.blocks,
    hero_image: s.heroImage,
    author_id: s.author,
    category: s.category,
    status: s.status,
    tags: s.tags,
    published_at: s.publishedAt,
    updated_at: new Date().toISOString(),
  };
}
