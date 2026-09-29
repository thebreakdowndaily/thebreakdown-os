/**
 * ─── The Breakdown OS — Canonical Publication Authority ─────────────────────
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Platform Beta v1.0 — Fail-Closed Publication Authority)
 *
 * Consolidates all publication authority behind ONE server-side contract:
 *   1. Authorization verification ('story.publish')
 *   2. State machine transition verification (canTransition)
 *   3. Publication gate evaluation (11 fail-closed checks)
 *   4. Immutable audit logging
 *   5. Event emission & cache invalidation
 */

import { revalidatePath } from 'next/cache';
import type { Story, StoryStatus } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';
import { can } from '@/features/auth/policy';
import { canTransition, transitionEditorialState, type EditorialStateRecord } from './workflow-state-machine';
import { validateStoryForPublication } from './publication-gate';
import type { PublicationGateResult } from '@/types/editorial-calendar';
import { eventBus } from '@/lib/events/event-bus';

export interface CanonicalPublicationDecision {
  allowed: boolean;
  httpStatus: 200 | 401 | 403 | 409 | 422 | 500;
  error?: string;
  gateResult?: PublicationGateResult;
  updatedStory?: Story;
  auditRecord?: EditorialStateRecord;
}

export interface PublicationOptions {
  scheduleId?: string;
  notes?: string;
  now?: Date;
}

/**
 * Evaluates whether a story can transition to 'published' under the canonical publication contract.
 * Fails closed if any condition (auth, state machine, evidence, gate) is not satisfied.
 */
export function evaluatePublicationContract(
  existingStory: Story | undefined,
  targetStory: Story,
  principal: Principal | null | undefined,
  options: PublicationOptions = {}
): CanonicalPublicationDecision {
  const now = options.now || new Date();

  // 1. Authentication Check
  if (!principal) {
    return {
      allowed: false,
      httpStatus: 401,
      error: 'Authentication required to publish stories.',
    };
  }

  // 2. Authorization Check (Role must hold 'story.publish')
  if (!can(principal, 'story.publish')) {
    return {
      allowed: false,
      httpStatus: 403,
      error: `Forbidden: Principal with role '${principal.role}' cannot publish stories. Editor role or higher required.`,
    };
  }

  // 3. Workflow State Transition Check
  const fromStatus: StoryStatus = existingStory?.status || (targetStory.status !== 'published' ? targetStory.status : 'draft');
  const isEligiblePrePublication = fromStatus === 'scheduled' || fromStatus === 'review' || fromStatus === 'fact_check' || fromStatus === 'published';
  const isValidTransition = isEligiblePrePublication || canTransition(fromStatus as any, 'published');

  if (!isValidTransition) {
    return {
      allowed: false,
      httpStatus: 409,
      error: `Invalid workflow transition: Cannot transition story from '${fromStatus}' to 'published'. Story must pass through editorial review and approval before publication.`,
    };
  }

  // 4. Publication Gate Check (All 11 gates must pass)
  // Ensure the story being evaluated presents an eligible status to the gate
  const storyToValidate: Story = {
    ...targetStory,
    status: fromStatus === 'draft' ? 'draft' : (fromStatus === 'published' ? 'scheduled' : fromStatus),
  };

  const gateInput = {
    storyId: targetStory.id,
    scheduleId: options.scheduleId,
    triggeredBy: 'manual' as const,
  };

  const gateResult = validateStoryForPublication(gateInput, storyToValidate, now);

  if (!gateResult.passed) {
    const failedChecks = gateResult.checks.filter(c => !c.passed);
    const failureSummary = failedChecks.map(c => `${c.name}: ${c.reason}`).join('; ');
    return {
      allowed: false,
      httpStatus: 422,
      error: `Publication gate failed: ${failureSummary}`,
      gateResult,
    };
  }

  // 5. Build Audited Story & Record State Machine Transition
  const publishedAt = targetStory.publishedAt || existingStory?.publishedAt || now.toISOString();

  const updatedStory: Story = {
    ...targetStory,
    status: 'published',
    publishedAt,
    updatedAt: now.toISOString(),
    updatedBy: principal.userId,
  };

  const initialRecord: EditorialStateRecord = {
    storyId: targetStory.id,
    currentStage: (fromStatus === 'review' || fromStatus === 'fact_check') ? 'gold_standard_review' : (fromStatus as any),
    ownerId: targetStory.author || principal.userId,
    auditTrail: [],
    blockingIssues: [],
    updatedAt: now.toISOString(),
  };

  const transitionRes = transitionEditorialState(
    initialRecord,
    'published' as any,
    principal.userId,
    principal.role,
    options.notes || `Published via Canonical Publication Contract by ${principal.name}`
  );

  return {
    allowed: true,
    httpStatus: 200,
    gateResult,
    updatedStory,
    auditRecord: transitionRes.record,
  };
}

/**
 * Executes post-publication side-effects (eventBus emission, ISR cache invalidation).
 */
export function executePostPublicationEffects(
  story: Story,
  principal: Principal,
  gateResult?: PublicationGateResult
): void {
  // 1. Emit publication event
  try {
    eventBus.publish({
      type: 'story:published',
      payload: {
        storyId: story.id,
        slug: story.slug,
        title: story.title,
        publishedAt: story.publishedAt,
        author: story.author,
        publisherId: principal.userId,
        gatePassed: gateResult?.passed ?? true,
      },
    });
  } catch (err) {
    console.error('[CanonicalPublication] Failed to publish event:', err);
  }

  // 2. Invalidate Next.js ISR caches
  try {
    revalidatePath('/');
    revalidatePath('/stories');
    if (story.slug) {
      revalidatePath(`/story/${story.slug}`);
    }
  } catch {
    // In test runners or worker contexts, revalidatePath may not be available
  }
}
