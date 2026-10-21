'use server';

/**
 * Editorial Calendar — Server Actions
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * Every action goes through auth checks and the publication gate.
 * No action bypasses validation.
 */

import { revalidatePath } from 'next/cache';
import {
  createScheduleEntry,
  updateScheduleEntry,
  getWeeklyPlan,
  validateAndPublishDueStories,
  rowToStory,
} from '@/services/editorial/schedule';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { getServiceClient } from '@/supabase/client';
import { requireRole } from '@/features/auth/require-role';
import type {
  EditorialScheduleEntry,
  PublicationGateResult,
  ScheduleStatus,
} from '@/types/editorial-calendar';

// ─── Schedule Management ─────────────────────────────────────────────────────

export async function scheduleStoryAction(params: {
  storyId: string;
  slotDate: string;
  slotPosition: number;
  priority?: number;
  category?: string;
  rationale?: string;
  notes?: string;
}): Promise<{ success: boolean; entry?: EditorialScheduleEntry; error?: string }> {
  try {
    await requireRole('editor');
    const entry = await createScheduleEntry({
      storyId: params.storyId,
      slotDate: params.slotDate,
      slotPosition: params.slotPosition,
      priority: params.priority || 5,
      category: params.category || 'explainer',
      rationale: params.rationale,
      notes: params.notes,
      status: 'planned',
    });

    // Also update the story's scheduled_at. Supabase errors are returned in
    // the result object, so explicitly check both the error and matched row.
    const db = getServiceClient();
    const { data: scheduledStory, error: scheduleError } = await db
      .from('stories')
      .update({
        scheduled_at: `${params.slotDate}T09:00:00Z`,
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.storyId)
      .select('id')
      .maybeSingle();

    if (scheduleError || !scheduledStory) {
      const reason = scheduleError?.message || 'story record was not found';
      let recoveryNote = '';
      try {
        await updateScheduleEntry(entry.id, {
          status: 'blocked',
          blockReason: `Story scheduling failed: ${reason}`,
        });
      } catch (recoveryError) {
        recoveryNote = ` The schedule entry could not be marked blocked: ${recoveryError instanceof Error ? recoveryError.message : 'unknown error'}.`;
      }
      return {
        success: false,
        error: `Schedule entry ${entry.id} was created, but the story was not scheduled: ${reason}.${recoveryNote}`,
      };
    }

    revalidatePath('/intel/editorial/calendar');
    revalidatePath('/intel/editorial');
    return { success: true, entry };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateScheduleEntryAction(
  id: string,
  updates: Partial<Pick<EditorialScheduleEntry, 'status' | 'priority' | 'rationale' | 'notes'>>,
): Promise<{ success: boolean; entry?: EditorialScheduleEntry; error?: string }> {
  try {
    await requireRole('editor');
    const entry = await updateScheduleEntry(id, updates);
    revalidatePath('/intel/editorial/calendar');
    return { success: true, entry };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function cancelScheduleAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole('editor');
    await updateScheduleEntry(id, { status: 'skipped' });
    revalidatePath('/intel/editorial/calendar');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Validation ──────────────────────────────────────────────────────────────

export async function validateStoryAction(
  storyId: string,
  scheduleId?: string,
): Promise<{ success: boolean; result?: PublicationGateResult; error?: string }> {
  try {
    await requireRole('editor');
    const db = getServiceClient();
    const { data: storyRow, error: storyError } = await db
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRow) {
      return { success: false, error: 'Story not found' };
    }

    // Minimal story shape for validation
    const story = {
      id: storyRow.id,
      title: storyRow.title,
      slug: storyRow.slug,
      headline: storyRow.headline || storyRow.title,
      summary: storyRow.summary || '',
      heroImage: storyRow.hero_image || '',
      author: storyRow.author || '',
      category: storyRow.category || '',
      status: storyRow.status,
      storyType: 'standard',
      evidenceScore: storyRow.evidence_score || 0,
      readingTime: storyRow.reading_time || 0,
      publishedAt: storyRow.published_at || '',
      createdAt: storyRow.created_at,
      updatedAt: storyRow.updated_at,
      tags: storyRow.tags || [],
      blocks: storyRow.blocks || [],
      sources: storyRow.sources || [],
      claims: storyRow.claims || [],
      timeline: storyRow.timeline || [],
      faq: storyRow.faq || [],
      charts: storyRow.charts || [],
      relatedStoryIds: storyRow.related_story_ids || [],
      relatedEntityIds: storyRow.related_entity_ids || [],
      relatedTopicIds: storyRow.related_topic_ids || [],
    };

    const result = validateStoryForPublication(
      { storyId, scheduleId, triggeredBy: 'manual' },
      story as never,
    );

    if (result.passed && scheduleId) {
      await updateScheduleEntry(scheduleId, { status: 'validated' });
    } else if (!result.passed && scheduleId) {
      const failedChecks = result.checks.filter(c => !c.passed);
      await updateScheduleEntry(scheduleId, {
        status: 'blocked',
        blockReason: failedChecks.map(c => c.reason).join('; '),
      });
    }

    revalidatePath('/intel/editorial/calendar');
    return { success: true, result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Publishing ──────────────────────────────────────────────────────────────

export async function publishNowAction(
  storyId: string,
  scheduleId?: string,
): Promise<{ success: boolean; result?: PublicationGateResult; error?: string; warning?: string }> {
  try {
    const principal = await requireRole('editor');
    const db = getServiceClient();
    const { data: storyRow, error: storyError } = await db
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError || !storyRow) {
      return { success: false, error: 'Story not found' };
    }

    // Manual publication must use the same canonical async contract as the
    // scheduled worker. The synchronous gate omits Evidence Gate 13 and the
    // single-use publication token enforced by the story repository.
    const story = rowToStory(storyRow as unknown as Record<string, unknown>);
    const { evaluatePublicationContractAsync, executePostPublicationEffects } =
      await import('@/lib/editorial/canonical-publication');
    const { RepositoryFactory } = await import('@/services/factory/repository');

    const decision = await evaluatePublicationContractAsync(
      story,
      story,
      principal,
      {
        scheduleId,
        triggeredBy: 'manual',
        notes: `Manual publication requested by ${principal.name}`,
      },
    );
    const checkedAt = new Date().toISOString();
    const result: PublicationGateResult = decision.gateResult
      ? { ...decision.gateResult, checks: [...decision.gateResult.checks] }
      : {
          storyId,
          scheduleId,
          passed: false,
          checks: [{
            name: 'canonical_publication_contract',
            passed: false,
            reason: decision.error || 'Canonical publication returned no gate evidence',
          }],
          checkedAt,
          triggeredBy: 'manual',
        };

    // Fail closed if the canonical contract denies publication or omits any
    // artifact needed to complete a token-authorized write.
    if (!decision.allowed || !decision.updatedStory || !decision.publicationToken || !result.passed) {
      const reason = decision.error
        || result.checks.filter(check => !check.passed).map(check => `${check.name}: ${check.reason}`).join('; ')
        || 'Canonical publication contract did not authorize publication';
      result.passed = false;

      if (!result.checks.some(check => !check.passed)) {
        result.checks.push({
          name: 'canonical_publication_contract',
          passed: false,
          reason,
        });
      }

      let recoveryNote = '';
      if (scheduleId) {
        try {
          await updateScheduleEntry(scheduleId, { status: 'blocked', blockReason: reason });
        } catch (scheduleError) {
          recoveryNote = ` Schedule entry ${scheduleId} could not be marked blocked: ${scheduleError instanceof Error ? scheduleError.message : 'unknown error'}.`;
        }
      }

      revalidatePath('/intel/editorial/calendar');
      revalidatePath('/intel/editorial');
      return { success: false, result, error: `${reason}.${recoveryNote}` };
    }

    // Repository guard consumes the canonical single-use token and refuses
    // any direct published write that did not pass the canonical contract.
    const storyRepository = RepositoryFactory.getStoryRepository();
    try {
      await storyRepository.saveStory(decision.updatedStory, {
        publicationToken: decision.publicationToken,
      });
    } catch (publishError) {
      const reason = publishError instanceof Error ? publishError.message : 'unknown repository error';
      result.passed = false;
      result.checks.push({
        name: 'repository_publish_failed',
        passed: false,
        reason,
      });

      let recoveryNote = '';
      if (scheduleId) {
        try {
          await updateScheduleEntry(scheduleId, {
            status: 'blocked',
            blockReason: `Repository publication failed: ${reason}`,
          });
        } catch (scheduleError) {
          recoveryNote = ` Schedule entry ${scheduleId} could not be marked blocked: ${scheduleError instanceof Error ? scheduleError.message : 'unknown error'}.`;
        }
      }

      revalidatePath('/intel/editorial/calendar');
      revalidatePath('/intel/editorial');
      return {
        success: false,
        result,
        error: `Canonical publication passed its gates, but the story repository write failed: ${reason}.${recoveryNote}`,
      };
    }

    result.passed = true;
    result.publishedAt = decision.updatedStory.publishedAt;
    executePostPublicationEffects(decision.updatedStory, principal, result);

    if (scheduleId) {
      try {
        await updateScheduleEntry(scheduleId, { status: 'published' });
      } catch (scheduleError) {
        // Story publication is confirmed; report the schedule mismatch rather
        // than treating an already-published story as an overall failure.
        revalidatePath('/intel/editorial/calendar');
        revalidatePath('/intel/editorial');
        return {
          success: true,
          result,
          warning: `Story was published, but schedule entry ${scheduleId} could not be reconciled: ${scheduleError instanceof Error ? scheduleError.message : 'unknown error'}.`,
        };
      }
    }

    revalidatePath('/intel/editorial/calendar');
    revalidatePath('/intel/editorial');
    return { success: true, result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Query ───────────────────────────────────────────────────────────────────

export async function getWeeklyPlanAction(
  weekStart: string,
): Promise<{ success: boolean; plan?: Awaited<ReturnType<typeof getWeeklyPlan>>; error?: string }> {
  try {
    await requireRole('reporter');
    const plan = await getWeeklyPlan(weekStart);
    return { success: true, plan };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getAllScheduledEntriesAction(): Promise<{
  success: boolean;
  entries?: EditorialScheduleEntry[];
  error?: string;
}> {
  try {
    await requireRole('reporter');
    const db = getServiceClient();
    const { data, error } = await db
      .from('editorial_schedule')
      .select('*')
      .order('slot_date', { ascending: false })
      .order('slot_position', { ascending: true })
      .limit(50);

    if (error) throw error;
    const entries = (data || []).map((row) => ({
      id: row.id,
      storyId: row.story_id,
      slotDate: row.slot_date,
      slotPosition: row.slot_position,
      priority: row.priority,
      category: row.category,
      rationale: row.rationale || undefined,
      notes: row.notes || undefined,
      status: row.status as ScheduleStatus,
      validatedAt: row.validated_at || undefined,
      publishedAt: row.published_at || undefined,
      blockedAt: row.blocked_at || undefined,
      blockReason: row.block_reason || undefined,
      fallbackScheduleId: row.fallback_schedule_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    return { success: true, entries };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function runPublishDueAction(): Promise<{
  success: boolean;
  results?: PublicationGateResult[];
  error?: string;
}> {
  try {
    await requireRole('editor');
    const results = await validateAndPublishDueStories();
    revalidatePath('/intel/editorial/calendar');
    revalidatePath('/intel/editorial');
    return { success: true, results };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
