import type { Story, Topic, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';
import { getServiceClient } from '@/supabase/client';
import type { StoryService, PublishScheduledStoryAtomicParams, PublishScheduledStoryAtomicResult } from '../../interfaces/story';
import { isPubliclyPublished, storyPublicationContext } from '@/lib/story/publication';

import { validateStoryEvidenceCompleteness, PublicationBlockedError, DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import { consumePublicationToken } from '@/lib/editorial/publication-token';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidIsoTimestampWithTimezone(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const str = value.trim();
  if (!str) return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-]\d{2})(?::?(\d{2}))?)$/i.exec(str);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const min = parseInt(match[5], 10);
  const sec = parseInt(match[6], 10);

  if (month < 1 || month > 12) return false;
  if (hour < 0 || hour > 23) return false;
  if (min < 0 || min > 59) return false;
  if (sec < 0 || sec > 59) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return false;

  if (match[7] !== undefined) {
    const tzHour = Math.abs(parseInt(match[7], 10));
    if (tzHour > 23) return false;
  }
  if (match[8] !== undefined) {
    const tzMin = parseInt(match[8], 10);
    if (tzMin < 0 || tzMin > 59) return false;
  }

  const time = new Date(str).getTime();
  return !isNaN(time);
}

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
    // Story references are persisted as either UUIDs or slugs in legacy
    // topic/story data. Route each value to the correctly typed column.
    const column = isUuid(id) ? 'id' : 'slug';
    const { data, error } = await db().from('stories').select('*').eq(column, id).maybeSingle();
    if (error) throw error;
    return data ? rowToStory(data) : undefined;
  }

  async getStoryBySlug(slug: string) {
    const { data, error } = await db().from('stories').select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToStory(data) : undefined;
  }

  async saveStory(story: Story, options?: { publicationToken?: string; expectedVersion?: number }) {
    // Repository Publication Guard: Direct saves to 'published' must present a valid server-side publication token
    if (story.status === 'published' || story.publicationStatus === 'published') {
      const token = options?.publicationToken || (story as any)._publicationToken;
      if (!token || !consumePublicationToken(token, story.id)) {
        throw new DirectPublicationForbiddenError(
          `Direct saveStory with status='published' is prohibited for story ${story.id}. Publication must proceed via canonical publication contract or publishStory().`
        );
      }
    }

    if (options?.expectedVersion !== undefined) {
      return this.saveStoryOCC(story, options.expectedVersion, options);
    }

    const { data, error } = await db().from('stories').upsert(rowFromStory(story)).select().single();
    if (error) throw error;
    return rowToStory(data);
  }

  async saveStoryOCC(story: Story, expectedVersion: number, options?: { publicationToken?: string }): Promise<Story> {
    if (story.status === 'published' || story.publicationStatus === 'published') {
      const token = options?.publicationToken || (story as any)._publicationToken;
      if (!token || !consumePublicationToken(token, story.id)) {
        throw new DirectPublicationForbiddenError(
          `Direct saveStoryOCC with status='published' is prohibited for story ${story.id}. Publication must proceed via canonical publication contract or publishStory().`
        );
      }
    }

    const row = rowFromStory(story);
    row.version = (expectedVersion || 0) + 1;

    let query = db()
      .from('stories')
      .update(row)
      .eq('id', story.id)
      .eq('version', expectedVersion || 0);

    if (story.status === 'published') {
      query = query.neq('status', 'published');
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error(`OCC_FAILURE: Story ${story.id} has been modified concurrently or already published.`);
    }

    return rowToStory(data);
  }

  async publishScheduledStoryAtomic(
    params: PublishScheduledStoryAtomicParams,
  ): Promise<PublishScheduledStoryAtomicResult> {
    if (!params.publicationToken || !consumePublicationToken(params.publicationToken, params.storyId)) {
      return {
        success: false,
        code: 'TOKEN_INVALID',
        error: `Invalid or already consumed publication token for story ${params.storyId}`,
      };
    }

    const client = getServiceClient();
    const { data, error } = await (client as any).rpc('fn_publish_story_fenced', {
      p_schedule_id: params.scheduleId,
      p_story_id: params.storyId,
      p_expected_validated_at: params.expectedValidatedAt,
      p_expected_version: params.expectedVersion,
      p_published_at: params.publishedAt || new Date().toISOString(),
      p_updated_by: params.updatedBy || 'system-scheduler',
      p_gate_checks: params.gateChecks ?? [],
      p_gate_checked_at: params.gateCheckedAt || null,
      p_triggered_by: params.triggeredBy || 'cron',
    });

    if (error) {
      if (typeof error.message === 'string' && error.message.includes('AUDIT_LOG_FAILED')) {
        return {
          success: false,
          code: 'AUDIT_LOG_FAILED',
          error: error.message,
        };
      }
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: error.message,
      };
    }

    const rpcResult = data as {
      success?: boolean;
      code?: string;
      error?: string;
      story_id?: string;
      schedule_id?: string;
      status?: string;
      version?: number;
      published_at?: string;
      updated_at?: string;
      updated_by?: string | null;
      actor?: string;
      scheduled_by?: string | null;
    };

    if (!rpcResult || typeof rpcResult !== 'object') {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: 'Atomic publish RPC returned invalid or empty response',
      };
    }

    // Contradictory outcome: code 'PUBLISHED' with success != true
    if (rpcResult.code === 'PUBLISHED' && rpcResult.success !== true) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: "RPC response contract violation: contradictory 'PUBLISHED' code with non-success status",
      };
    }

    if (!rpcResult.success) {
      return {
        success: false,
        code: (rpcResult.code as any) || 'DATABASE_ERROR',
        error: rpcResult.error || 'Atomic publish RPC returned failure',
      };
    }

    // ── STRICT RPC RESPONSE SELF-CONSISTENCY VALIDATION ──
    // Because the transaction may already have committed by the time this response
    // is inspected, any violation is recorded as a RECONCILIATION_ERROR rather than
    // a standard database error. Legacy fallback writes must NEVER be attempted.

    if (rpcResult.code !== 'PUBLISHED') {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: expected code 'PUBLISHED', got '${rpcResult.code}'`,
      };
    }

    // Exact identity validation: story_id must strictly equal params.storyId
    if (
      !rpcResult.story_id ||
      typeof rpcResult.story_id !== 'string' ||
      rpcResult.story_id.trim() === '' ||
      rpcResult.story_id !== params.storyId
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: story_id mismatch or missing (expected '${params.storyId}', got '${rpcResult.story_id}')`,
      };
    }

    // Exact identity validation: schedule_id must strictly equal params.scheduleId
    if (
      !rpcResult.schedule_id ||
      typeof rpcResult.schedule_id !== 'string' ||
      rpcResult.schedule_id.trim() === '' ||
      rpcResult.schedule_id !== params.scheduleId
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: schedule_id mismatch or missing (expected '${params.scheduleId}', got '${rpcResult.schedule_id}')`,
      };
    }

    // Mandatory publication status: must strictly equal 'published'
    if (!rpcResult.status || rpcResult.status !== 'published') {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: expected status 'published', got '${rpcResult.status}'`,
      };
    }

    // Mandatory version: must strictly equal expectedVersion + 1
    if (
      typeof rpcResult.version !== 'number' ||
      !Number.isInteger(rpcResult.version) ||
      rpcResult.version !== params.expectedVersion + 1
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: story version ${rpcResult.version} is not expected increment (${params.expectedVersion + 1})`,
      };
    }

    // Mandatory published_at timestamp: must be valid ISO 8601 string with explicit timezone
    if (!isValidIsoTimestampWithTimezone(rpcResult.published_at)) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: 'RPC response contract violation: invalid or missing published_at timestamp',
      };
    }

    // Mandatory updated_at timestamp: must be valid ISO 8601 string with explicit timezone
    if (!isValidIsoTimestampWithTimezone(rpcResult.updated_at)) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: 'RPC response contract violation: invalid or missing updated_at timestamp',
      };
    }

    // Future clock skew policy: neither published_at nor updated_at may exceed the 1-minute tolerance
    const maxAllowedFuture = Date.now() + 60000; // allow at most 1m clock skew

    const publishedAtTime = new Date(rpcResult.published_at).getTime();
    if (publishedAtTime > maxAllowedFuture) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: published_at '${rpcResult.published_at}' is in the future`,
      };
    }

    const updatedAtTime = new Date(rpcResult.updated_at).getTime();
    if (updatedAtTime > maxAllowedFuture) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: updated_at '${rpcResult.updated_at}' is in the future`,
      };
    }

    // Mandatory attribution contracts:
    // updated_by: property must be present; permits null, or valid UUID string
    if (!('updated_by' in rpcResult) || rpcResult.updated_by === undefined) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: 'RPC response contract violation: missing updated_by property',
      };
    }
    if (
      rpcResult.updated_by !== null &&
      (typeof rpcResult.updated_by !== 'string' || !isUuid(rpcResult.updated_by))
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: updated_by '${rpcResult.updated_by}' violates UUID schema contract`,
      };
    }

    // actor: property must be present; non-empty string
    if (!('actor' in rpcResult) || rpcResult.actor === undefined) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: 'RPC response contract violation: missing actor property',
      };
    }
    if (
      rpcResult.actor === null ||
      typeof rpcResult.actor !== 'string' ||
      rpcResult.actor.trim() === ''
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: actor '${rpcResult.actor}' violates text schema contract`,
      };
    }

    // scheduled_by: property must be present; permits null, or string
    if (!('scheduled_by' in rpcResult) || rpcResult.scheduled_by === undefined) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: 'RPC response contract violation: missing scheduled_by property',
      };
    }
    if (
      rpcResult.scheduled_by !== null &&
      typeof rpcResult.scheduled_by !== 'string'
    ) {
      return {
        success: false,
        code: 'RECONCILIATION_ERROR',
        error: `RPC response contract violation: scheduled_by '${rpcResult.scheduled_by}' violates text schema contract`,
      };
    }

    const updatedStory: Story = {
      ...params.publishedStory,
      status: 'published',
      publicationStatus: 'published',
      version: rpcResult.version,
      publishedAt: rpcResult.published_at,
      updatedAt: rpcResult.updated_at,
      updatedBy: rpcResult.updated_by || undefined,
    };

    return {
      success: true,
      code: 'PUBLISHED',
      story: updatedStory,
      actor: rpcResult.actor,
      scheduledBy: rpcResult.scheduled_by,
    };
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


  /**
   * Fetch only public stories connected to this topic by explicit canonical
   * references. Each database request is paginated; unrelated public stories
   * are never scanned by the topic-page path.
   */
  async getPublicStoriesForTopic(
    topic: Pick<Topic, 'id' | 'slug' | 'storyIds' | 'featuredStoryIds'>,
  ): Promise<APIResponse<Story[]>> {
    const now = new Date().toISOString();
    const buildPublicQuery = () => db()
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_test_artifact', false)
      .lte('published_at', now)
      .order('published_at', { ascending: false });

    const storedRefs = [...new Set([
      ...(topic.storyIds ?? []),
      ...(topic.featuredStoryIds ?? []),
    ].filter((value): value is string => typeof value === 'string' && value.length > 0))];
    const uuidRefs = storedRefs.filter(isUuid);
    const slugRefs = storedRefs.filter((value) => !isUuid(value));

    const queryFactories: Array<() => ReturnType<typeof buildPublicQuery>> = [];
    if (uuidRefs.length > 0) {
      queryFactories.push(() => buildPublicQuery().in('id', uuidRefs));
    }
    if (slugRefs.length > 0) {
      queryFactories.push(() => buildPublicQuery().in('slug', slugRefs));
    }
    for (const reference of new Set([topic.id, topic.slug])) {
      queryFactories.push(() => buildPublicQuery().contains('related_topic_ids', [reference]));
    }

    const readAllPages = async (
      makeQuery: () => ReturnType<typeof buildPublicQuery>,
    ): Promise<Story[]> => {
      const pageSize = 250;
      const stories: Story[] = [];
      let page = 0;

      while (true) {
        const start = page * pageSize;
        const { data, count, error } = await makeQuery().range(start, start + pageSize - 1);
        if (error) throw error;

        const rows = (data ?? []).map(rowToStory);
        stories.push(...rows);
        if (
          rows.length < pageSize ||
          (count !== null && count !== undefined && stories.length >= count)
        ) {
          break;
        }
        page += 1;
      }

      return stories;
    };

    const results = await Promise.all(queryFactories.map(readAllPages));
    const uniqueStories = new Map<string, Story>();
    for (const story of results.flat()) uniqueStories.set(story.id, story);
    const data = [...uniqueStories.values()].sort(
      (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
    );

    return {
      data,
      meta: { total: data.length, page: 1, pageSize: data.length },
    };
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
