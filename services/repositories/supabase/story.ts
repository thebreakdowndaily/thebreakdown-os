import type { Story, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';
import type { StoryService } from '../../interfaces/story';
import { isPubliclyPublished, storyPublicationContext } from '@/lib/story/publication';

import { validateStoryEvidenceCompleteness, PublicationBlockedError, DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import { consumePublicationToken } from '@/lib/editorial/publication-token';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

export class SupabaseStoryRepository implements StoryService {
  private evidenceVault?: EvidenceVaultService;

  public setEvidenceVault(vault: EvidenceVaultService): void {
    this.evidenceVault = vault;
  }

  public getEvidenceVault(): EvidenceVaultService | undefined {
    return this.evidenceVault;
  }

  async getStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let query = db().from('stories').select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,summary.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('published_at', { ascending: false });
    if (error) throw error;
    return { data: (data || []).map(rowToStory), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getStory(id: string) {
    const { data, error } = await db().from('stories').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116' && error.code !== '22P02') throw error;
    return data ? rowToStory(data) : undefined;
  }

  async getStoryBySlug(slug: string) {
    const { data, error } = await db().from('stories').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToStory(data) : undefined;
  }

  async saveStory(story: Story, options?: { publicationToken?: string }) {
    // Repository Publication Guard: Direct saves to 'published' must present a valid server-side publication token
    if (story.status === 'published' || story.publicationStatus === 'published') {
      const token = options?.publicationToken || (story as any)._publicationToken;
      if (!token || !consumePublicationToken(token, story.id)) {
        throw new DirectPublicationForbiddenError(
          `Direct saveStory with status='published' is prohibited for story ${story.id}. Publication must proceed via canonical publication contract or publishStory().`
        );
      }
    }

    const { data, error } = await db().from('stories').upsert(rowFromStory(story)).select().single();
    if (error) throw error;
    return rowToStory(data);
  }

  async deleteStory(id: string) {
    const { error } = await db().from('stories').delete().eq('id', id);
    if (error) throw error;
  }
  
  async publishStory(id: string) {
    const story = await this.getStory(id);
    if (!story) return undefined;

    // Phase 4B-2E: Evidence Provenance Publication Guard
    const validation = await validateStoryEvidenceCompleteness(story, this.evidenceVault);
    if (!validation.valid) {
      throw new PublicationBlockedError(validation.violations);
    }

    // Mint server-side single-use publication token for the transition
    const { issuePublicationToken } = await import('@/lib/editorial/publication-token');
    const token = issuePublicationToken(story.id);

    const updated = {
      ...story,
      status: 'published' as const,
      publicationStatus: 'published' as const,
      publishedAt: story.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveStory(updated, { publicationToken: token });
  }

  async count() {
    const { count, error } = await db().from('stories').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  async refresh(id?: string) {
    // Supabase store triggers Next.js revalidation if needed
  }

  async invalidate(id?: string) {
    // Implement cache invalidation for Next.js if needed
  }

  async getPublicStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let query = db().from('stories').select('*', { count: 'exact' });
    const now = new Date().toISOString();
    query = query
      .eq('status', 'published')
      .eq('is_test_artifact', false)
      .lte('published_at', now);
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,summary.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) {
      query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }
    const { data, count, error } = await query.order('published_at', { ascending: false });
    if (error) throw error;
    return { data: (data || []).map(rowToStory), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getPublicStoryBySlug(slug: string): Promise<Story | undefined> {
    const story = await this.getStoryBySlug(slug);
    if (!story || story.isTestArtifact) return undefined;
    return isPubliclyPublished(storyPublicationContext(story)) ? story : undefined;
  }
}

function rowToStory(row: import('@/supabase/client').TypedDatabase['public']['Tables']['stories']['Row']): Story {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    headline: row.headline || row.title,
    summary: row.summary || '',
    heroImage: row.hero_image || '',
    heroImageAlt: row.hero_image_alt || undefined,
    heroImageIsDecorative: row.hero_image_is_decorative || undefined,
    author: row.author || '',
    category: row.category || '',
    status: (row.status as import('@/types/canonical').StoryStatus) || 'draft',
    publicationStatus: (['draft', 'review', 'scheduled', 'published', 'archived', 'superseded'].includes(row.status)
      ? row.status as import('@/types/canonical').PublicationStatus
      : 'draft'),
    isTestArtifact: (row as any).is_test_artifact ?? false,
    storyType: 'standard' as import('@/types/canonical').StoryType,
    evidenceScore: row.evidence_score || 0,
    readingTime: row.reading_time || 0,
    publishedAt: row.published_at || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by || undefined,
    tags: row.tags || [],
    blocks: (row.blocks as Story['blocks']) || [],
    sources: (row.sources as Story['sources']) || [],
    claims: (row.claims as Story['claims']) || [],
    timeline: (row.timeline as Story['timeline']) || [],
    faq: (row.faq as Story['faq']) || [],
    charts: (row.charts as Story['charts']) || [],
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
    headline: s.headline,
    summary: s.summary,
    hero_image: s.heroImage,
    hero_image_alt: s.heroImageAlt,
    hero_image_is_decorative: s.heroImageIsDecorative,
    author: s.author,
    category: s.category,
    status: s.status,
    evidence_score: s.evidenceScore,
    reading_time: s.readingTime,
    blocks: s.blocks,
    sources: s.sources,
    claims: s.claims,
    timeline: s.timeline,
    faq: s.faq,
    charts: s.charts,
    related_story_ids: s.relatedStoryIds,
    related_entity_ids: s.relatedEntityIds,
    related_topic_ids: s.relatedTopicIds,
    is_test_artifact: s.isTestArtifact ?? false,
    tags: s.tags,
    published_at: s.publishedAt,
    updated_at: new Date().toISOString(),
    updated_by: s.updatedBy,
  };
}
