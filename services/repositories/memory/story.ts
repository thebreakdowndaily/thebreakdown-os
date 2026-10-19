import type { Story, Topic, APIListParams, APIResponse } from '@/types/canonical';
import type { StoryService, PublishScheduledStoryAtomicParams, PublishScheduledStoryAtomicResult } from '../../interfaces/story';
import { isPubliclyPublished, storyPublicationContext } from '@/lib/story/publication';
import { LEGACY_PUBLIC_SLUGS } from '@/utils/data-layer/store';

import { validateStoryEvidenceCompleteness, PublicationBlockedError, DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import { consumePublicationToken } from '@/lib/editorial/publication-token';
import { sanitizeDiagnosticError } from '@/lib/security/diagnostic-sanitizer';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

export class MemoryStoryService implements StoryService {
  private stories: Map<string, Story>;
  private evidenceVault?: EvidenceVaultService;
  private schedules = new Map<string, any>();
  private simulateAuditFailure = false;

  constructor(stories: Story[] = [], evidenceVault?: EvidenceVaultService) {
    this.stories = new Map(stories.map(s => [s.id, s]));
    this.evidenceVault = evidenceVault;
  }

  public setEvidenceVault(vault: EvidenceVaultService): void {
    this.evidenceVault = vault;
  }

  public getEvidenceVault(): EvidenceVaultService | undefined {
    return this.evidenceVault;
  }

  public setSchedule(entry: { id: string; status: string; validated_at?: string; story_id: string; [key: string]: any }): void {
    this.schedules.set(entry.id, { ...entry });
  }

  public setSimulateAuditFailure(simulate: boolean): void {
    this.simulateAuditFailure = simulate;
  }

  async getStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let list = Array.from(this.stories.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getStory(id: string) {
    return this.stories.get(id);
  }

  async getStoryBySlug(slug: string) {
    return Array.from(this.stories.values()).find(s => s.slug === slug);
  }

  async saveStory(story: Story, options?: { publicationToken?: string; expectedVersion?: number }) {
    if (options?.expectedVersion !== undefined) {
      return this.saveStoryOCC(story, options.expectedVersion, options);
    }

    // Repository Publication Guard: Direct saves to 'published' must present a valid server-side publication token
    if (story.status === 'published' || story.publicationStatus === 'published') {
      const token = options?.publicationToken || (story as any)._publicationToken;
      if (!token || !consumePublicationToken(token, story.id)) {
        throw new DirectPublicationForbiddenError(
          `Direct saveStory with status='published' is prohibited for story ${story.id}. Publication must proceed via canonical publication contract or publishStory().`
        );
      }
    }

    this.stories.set(story.id, { ...story, updatedAt: new Date().toISOString() });
    return this.stories.get(story.id)!;
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

    const existing = this.stories.get(story.id);
    const currentVersion = existing?.version ?? 1;
    if (!existing || currentVersion !== expectedVersion || existing.status === 'published') {
      throw new Error(`OCC_FAILURE: Story ${story.id} has been modified concurrently (expected version ${expectedVersion}) or already published.`);
    }

    const updated = {
      ...story,
      version: currentVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    this.stories.set(story.id, updated);
    return updated;
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

    // 1. Resolve and verify schedule lease entity
    let scheduleEntry = this.schedules.get(params.scheduleId);
    let dbClient: any = null;
    let isDatabaseBacked = false;

    if (!scheduleEntry) {
      try {
        const { getServiceClient } = await import('@/supabase/client');
        dbClient = getServiceClient();
      } catch {
        dbClient = null;
      }

      const isPlaceholder = !dbClient || (
        typeof dbClient.supabaseUrl === 'string' &&
        dbClient.supabaseUrl.includes('placeholder.supabase.co')
      );

      if (!isPlaceholder && typeof dbClient.from === 'function') {
        try {
          const { data, error: fetchErr } = await dbClient
            .from('editorial_schedule')
            .select('*')
            .eq('id', params.scheduleId)
            .maybeSingle();

          if (fetchErr) {
            return {
              success: false,
              code: 'DATABASE_ERROR',
              error: sanitizeDiagnosticError(`Database schedule lookup failed: ${fetchErr.message || fetchErr}`),
            };
          }
          if (data) {
            scheduleEntry = data;
            isDatabaseBacked = true;
          }
        } catch (fetchEx: any) {
          return {
            success: false,
            code: 'DATABASE_ERROR',
            error: sanitizeDiagnosticError(fetchEx?.message || 'Database schedule lookup threw error'),
          };
        }
      } else if (isPlaceholder) {
        dbClient = null;
      }
    }

    if (scheduleEntry) {
      if (scheduleEntry.status !== 'validated') {
        return {
          success: false,
          code: 'SCHEDULE_NOT_VALIDATED',
          error: `Schedule entry status is ${scheduleEntry.status}, expected validated`,
        };
      }
      if (!params.expectedValidatedAt || !scheduleEntry.validated_at) {
        return {
          success: false,
          code: 'SCHEDULE_LEASE_LOST',
          error: 'Schedule lease validation timestamp is missing or null',
        };
      }
      if (scheduleEntry.validated_at !== params.expectedValidatedAt) {
        return {
          success: false,
          code: 'SCHEDULE_LEASE_LOST',
          error: 'Schedule lease was claimed or modified by another worker',
        };
      }
      if (scheduleEntry.validated_at && Date.now() - new Date(scheduleEntry.validated_at).getTime() >= 5 * 60 * 1000) {
        return {
          success: false,
          code: 'SCHEDULE_LEASE_EXPIRED',
          error: 'Schedule lease has expired (> 5 minutes)',
        };
      }
      if (scheduleEntry.story_id && scheduleEntry.story_id !== params.storyId) {
        return {
          success: false,
          code: 'SCHEDULE_STORY_MISMATCH',
          error: 'Schedule entry references a different story_id',
        };
      }
    }

    // 2. Resolve and verify story entity
    const existing = this.stories.get(params.storyId);
    if (!existing) {
      return {
        success: false,
        code: 'STORY_NOT_FOUND',
        error: `Story ${params.storyId} not found in repository`,
      };
    }

    if (existing.status === 'published' || existing.publicationStatus === 'published') {
      return {
        success: false,
        code: 'ALREADY_PUBLISHED',
        error: 'Story is already published',
      };
    }

    const currentVersion = existing.version ?? 1;
    if (currentVersion !== params.expectedVersion) {
      return {
        success: false,
        code: 'STORY_VERSION_CONFLICT',
        error: `Story version conflict: expected ${params.expectedVersion}, found ${currentVersion}`,
      };
    }

    // 3. Atomically record mandatory publication gate audit log before mutating state
    if (this.simulateAuditFailure || (params as any)?.simulateAuditFailure) {
      return {
        success: false,
        code: 'AUDIT_LOG_FAILED',
        error: 'AUDIT_LOG_FAILED: simulated gate log write failure',
      };
    }

    const nowIso = new Date().toISOString();
    // published_at contract: preserve historical past date; clamp future date or null to now
    const existingPublishedAt = existing.publishedAt;
    const publishedAt = (existingPublishedAt && existingPublishedAt <= nowIso)
      ? existingPublishedAt
      : (params.publishedAt && params.publishedAt <= nowIso ? params.publishedAt : nowIso);

    const updatedByUuid = params.updatedBy === 'system-scheduler'
      ? '00000000-0000-0000-0000-000000000001'
      : (params.updatedBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.updatedBy)
          ? params.updatedBy
          : '00000000-0000-0000-0000-000000000001');

    let rpcResult: any = null;

    if (isDatabaseBacked && dbClient) {
      // When a publication involves database-backed schedule state, use the canonical
      // atomic publication RPC (fn_publish_story_fenced) to guarantee single-transaction
      // atomicity across schedule, audit log, and outbox, OR safely handle database operations.
      if (typeof dbClient.rpc === 'function') {
        try {
          const { data, error: rpcError } = await dbClient.rpc('fn_publish_story_fenced', {
            p_schedule_id: params.scheduleId,
            p_story_id: params.storyId,
            p_expected_validated_at: params.expectedValidatedAt,
            p_expected_version: params.expectedVersion,
            p_published_at: publishedAt,
            p_updated_by: params.updatedBy || 'system-scheduler',
            p_gate_checks: params.gateChecks ?? [],
            p_gate_checked_at: params.gateCheckedAt || null,
            p_triggered_by: params.triggeredBy || 'cron',
          });

          if (rpcError) {
            const isAuditSpecific = typeof rpcError.message === 'string' && (
              rpcError.message.includes('AUDIT_LOG_FAILED') ||
              rpcError.message.includes('INJECTED_AUDIT_LOG_FAILURE')
            );
            return {
              success: false,
              code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : 'DATABASE_ERROR',
              error: sanitizeDiagnosticError(rpcError.message || 'Atomic publish RPC failed'),
            };
          }

          if (!data || typeof data !== 'object') {
            return {
              success: false,
              code: 'DATABASE_ERROR',
              error: 'Atomic publish RPC returned invalid response',
            };
          }

          if (!data.success) {
            const isAuditSpecific = typeof data.error === 'string' && (
              data.error.includes('AUDIT_LOG_FAILED') ||
              data.error.includes('INJECTED_AUDIT_LOG_FAILURE')
            );
            return {
              success: false,
              code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : ((data.code as any) || 'DATABASE_ERROR'),
              error: sanitizeDiagnosticError(data.error || 'Atomic publish RPC reported failure'),
            };
          }

          rpcResult = data;
        } catch (err: any) {
          const isAuditSpecific = typeof err?.message === 'string' && (
            err.message.includes('AUDIT_LOG_FAILED') ||
            err.message.includes('INJECTED_AUDIT_LOG_FAILURE')
          );
          return {
            success: false,
            code: isAuditSpecific ? 'AUDIT_LOG_FAILED' : 'DATABASE_ERROR',
            error: sanitizeDiagnosticError(err?.message || 'Database RPC invocation threw error'),
          };
        }
      } else if (typeof dbClient.from === 'function') {
        // Direct table client fallback (e.g. test doubles without RPC).
        // Enforce strict fail-closed handling on both operations without swallow or fragile string-only matching.
        try {
          const { error: gateError } = await dbClient
            .from('publication_gate_log')
            .insert({
              story_id: params.storyId,
              schedule_id: params.scheduleId,
              gate_result: 'pass',
              checks: params.gateChecks ?? [],
              checked_at: params.gateCheckedAt || nowIso,
              published_at: publishedAt,
              triggered_by: params.triggeredBy || 'cron',
            });

          if (gateError) {
            return {
              success: false,
              code: 'AUDIT_LOG_FAILED',
              error: sanitizeDiagnosticError(`AUDIT_LOG_FAILED: ${gateError.message || 'Audit log insert failed'}`),
            };
          }

          const { error: scheduleError } = await dbClient
            .from('editorial_schedule')
            .update({
              status: 'published',
              published_at: publishedAt,
              updated_at: nowIso,
            })
            .eq('id', params.scheduleId)
            .eq('status', 'validated')
            .eq('validated_at', params.expectedValidatedAt);

          if (scheduleError) {
            return {
              success: false,
              code: 'DATABASE_ERROR',
              error: sanitizeDiagnosticError(`Database schedule update failed: ${scheduleError.message || scheduleError}`),
            };
          }
        } catch (err: any) {
          return {
            success: false,
            code: 'AUDIT_LOG_FAILED',
            error: sanitizeDiagnosticError(err?.message || 'Database audit operation threw error'),
          };
        }
      } else {
        return {
          success: false,
          code: 'DATABASE_ERROR',
          error: 'MemoryStoryService cannot safely persist database-backed schedule without database client methods',
        };
      }
    }

    // 4. Commit atomic transition: both schedule and story state transition simultaneously
    const storyData = params.publishedStory || (params as any).updatedStory || existing;
    const newVersion = rpcResult?.version ?? (currentVersion + 1);
    const storyPublishedAt = rpcResult?.published_at ?? publishedAt;
    const storyUpdatedAt = rpcResult?.updated_at ?? nowIso;
    const storyUpdatedBy = rpcResult?.updated_by ?? updatedByUuid;

    const updatedStory: Story = {
      ...storyData,
      status: 'published',
      publicationStatus: 'published',
      version: newVersion,
      publishedAt: storyPublishedAt,
      updatedAt: storyUpdatedAt,
      updatedBy: storyUpdatedBy,
    };
    this.stories.set(params.storyId, updatedStory);

    if (this.schedules.has(params.scheduleId)) {
      const s = this.schedules.get(params.scheduleId)!;
      s.status = 'published';
      s.published_at = storyPublishedAt;
      s.updated_at = storyUpdatedAt;
    }

    return {
      success: true,
      code: 'PUBLISHED',
      story: updatedStory,
      actor: rpcResult?.actor || params.updatedBy || 'system-scheduler',
      scheduledBy: rpcResult?.scheduled_by ?? (existing as any).scheduled_by ?? (existing as any).scheduledBy ?? params.updatedBy ?? 'system-scheduler',
    };
  }


  async deleteStory(id: string) {
    this.stories.delete(id);
  }

  async publishStory(id: string) {
    const s = this.stories.get(id);
    if (!s) return undefined;

    // Phase 4B-2E: Evidence Provenance Publication Guard
    const validation = await validateStoryEvidenceCompleteness(s, this.evidenceVault);
    if (!validation.valid) {
      throw new PublicationBlockedError(validation.violations);
    }

    const { issuePublicationToken } = await import('@/lib/editorial/publication-token');
    const token = issuePublicationToken(s.id);

    const updated = {
      ...s,
      status: 'published' as const,
      publicationStatus: 'published' as const,
      publishedAt: s.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveStory(updated, { publicationToken: token });
  }

  async count() {
    return this.stories.size;
  }

  async refresh(id?: string) {
    // Memory store doesn't need external refresh
  }

  async invalidate(id?: string) {
    // Memory store doesn't need cache invalidation
  }

  private isPublic(story: Story, now: Date): boolean {
    if (isPubliclyPublished(storyPublicationContext(story), now)) return true;
    const pubAt = story.publishedAt;
    if (LEGACY_PUBLIC_SLUGS.has(story.slug) && pubAt && new Date(pubAt).getTime() <= now.getTime()) return true;
    return false;
  }

  async getPublicStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    const now = new Date();
    let list = Array.from(this.stories.values()).filter(s => this.isPublic(s, now));
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getPublicStoryBySlug(slug: string): Promise<Story | undefined> {
    const story = Array.from(this.stories.values()).find(s => s.slug === slug);
    if (!story) return undefined;
    return this.isPublic(story, new Date()) ? story : undefined;
  }

  async getPublicStoriesForTopic(
    topic: Pick<Topic, 'id' | 'slug' | 'storyIds' | 'featuredStoryIds'>,
  ): Promise<APIResponse<Story[]>> {
    const now = new Date();
    const storedStoryRefs = new Set([
      ...(topic.storyIds ?? []),
      ...(topic.featuredStoryIds ?? []),
    ]);
    const topicRefs = new Set([topic.id, topic.slug]);

    const matchingStories = Array.from(this.stories.values()).filter((story) => {
      if (!this.isPublic(story, now)) return false;

      const matchesStoredReference =
        storedStoryRefs.has(story.id) || storedStoryRefs.has(story.slug);
      const matchesReverseReference = (story.relatedTopicIds ?? []).some((id) => topicRefs.has(id));

      return matchesStoredReference || matchesReverseReference;
    });

    const uniqueStories = [...new Map(matchingStories.map((story) => [story.id, story])).values()];
    uniqueStories.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return {
      data: uniqueStories,
      meta: { total: uniqueStories.length, page: 1, pageSize: uniqueStories.length },
    };
  }
}

