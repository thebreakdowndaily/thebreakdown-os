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

import type { Story, StoryStatus } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';
import { can } from '@/features/auth/policy';
import { canTransition, transitionEditorialState, type EditorialStateRecord } from './workflow-state-machine';
import { validateStoryForPublication, validateStoryForPublicationAsync } from './publication-gate';
import type { PublicationGateResult } from '@/types/editorial-calendar';
import { eventBus } from '@/lib/events/event-bus';
import { getEvidenceVaultService, type EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import { issuePublicationToken, consumePublicationToken } from './publication-token';

export { issuePublicationToken, consumePublicationToken };

export interface CanonicalPublicationDecision {
  allowed: boolean;
  httpStatus: 200 | 401 | 403 | 409 | 422 | 500;
  error?: string;
  gateResult?: PublicationGateResult;
  updatedStory?: Story;
  auditRecord?: EditorialStateRecord;
  publicationToken?: string;
}

export interface PublicationOptions {
  scheduleId?: string;
  notes?: string;
  now?: Date;
  triggeredBy?: 'manual' | 'cron' | 'fallback';
  vault?: EvidenceVaultService;
}

/**
 * Evaluates whether a story can transition to 'published' under the canonical publication contract.
 * Asynchronously checks all 12 publication gates AND Gate 13 (Evidence Vault Reconstructibility).
 */
export async function evaluatePublicationContractAsync(
  existingStory: Story | undefined,
  targetStory: Story,
  principal: Principal | null | undefined,
  options: PublicationOptions = {}
): Promise<CanonicalPublicationDecision> {
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

  // 4. Publication Gate Check (All 12 editorial gates + Gate 13 Evidence Vault)
  const storyToValidate: Story = {
    ...targetStory,
    status: fromStatus === 'draft' ? 'draft' : (fromStatus === 'published' ? 'scheduled' : fromStatus),
  };

  const gateInput = {
    storyId: targetStory.id,
    scheduleId: options.scheduleId,
    triggeredBy: options.triggeredBy || ('manual' as const),
  };

  let vault = options.vault;
  if (!vault) {
    try {
      vault = getEvidenceVaultService();
    } catch {
      // Fallback if vault not accessible
    }
  }

  const gateResult = await validateStoryForPublicationAsync(gateInput, storyToValidate, vault, now);

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
    publicationStatus: 'published',
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

  const publicationToken = issuePublicationToken(targetStory.id);

  return {
    allowed: true,
    httpStatus: 200,
    gateResult,
    updatedStory,
    auditRecord: transitionRes.record,
    publicationToken,
  };
}

/**
 * Synchronous backward-compatible evaluator (runs synchronous gates 1-12).
 * Note: evaluatePublicationContractAsync should be preferred to enforce Evidence Gate 13.
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

  // 4. Publication Gate Check (Gates 1-12)
  const storyToValidate: Story = {
    ...targetStory,
    status: fromStatus === 'draft' ? 'draft' : (fromStatus === 'published' ? 'scheduled' : fromStatus),
  };

  const gateInput = {
    storyId: targetStory.id,
    scheduleId: options.scheduleId,
    triggeredBy: options.triggeredBy || ('manual' as const),
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

  const publishedAt = targetStory.publishedAt || existingStory?.publishedAt || now.toISOString();

  const updatedStory: Story = {
    ...targetStory,
    status: 'published',
    publicationStatus: 'published',
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

  const publicationToken = issuePublicationToken(targetStory.id);

  return {
    allowed: true,
    httpStatus: 200,
    gateResult,
    updatedStory,
    auditRecord: transitionRes.record,
    publicationToken,
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

  // 2. Invalidate Next.js ISR caches dynamically (server-safe boundary)
  void (async () => {
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/stories');
      if (story.slug) {
        revalidatePath(`/story/${story.slug}`);
      }
    } catch {
      // In test runners or worker contexts, revalidatePath may not be available
    }
  })();
}
