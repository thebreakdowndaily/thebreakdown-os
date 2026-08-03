import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { VerificationStatus } from '@/lib/intel/verification';
import type {
  StoryEditorialBlocker,
  StoryEditorialReadiness,
  StoryStatus,
} from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial Readiness)
// Consumes the Verification Operating System's EditorialReadiness. Readiness is a pure function
// of (story status, linked verification status, verification readiness signals). Verification is
// mandatory before editorial readiness — a story whose linked verification case is not verified
// is never 'ready', regardless of its story status.

export interface StoryReadinessInputs {
  status: StoryStatus;
  verificationStatus: VerificationStatus | null;
  verificationScore: number | null;
  verificationCanPublish: boolean | null;
  openConflicts: number | null;
  openFieldTasks: number | null;
  openBlockers: StoryEditorialBlocker[];
}

function tierFrom(score: number | null, fallback: ConfidenceTier): ConfidenceTier {
  if (score === null) return fallback;
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
}

function needsVerification(verificationStatus: VerificationStatus | null): boolean {
  return verificationStatus !== 'verified';
}

/**
 * Derive editorial readiness. Rules, in priority order:
 * 1. Archived / Published are terminal editorial states (not 'ready' in the workflow sense).
 * 2. A story whose linked verification case is not verified → needs_verification.
 * 3. Open conflicts → blocked. Open verification blockers → blocked.
 * 4. Verification field tasks pending → needs_field_reporting.
 * 5. Early editorial phases → needs_research / needs_verification.
 * 6. Post-verification phases → needs_editorial_review until ready_for_publication → ready.
 */
export function computeStoryReadiness(inputs: StoryReadinessInputs): StoryEditorialReadiness {
  const { status, verificationStatus, verificationScore, verificationCanPublish, openConflicts, openFieldTasks, openBlockers } = inputs;

  if (status === 'archived') {
    return {
      state: 'archived',
      canPublish: false,
      blockers: [{ label: 'Archived', detail: 'This story is archived and cannot proceed.' }],
      requiredActions: [],
      confidence: 'LOW',
      verificationStatus,
      verificationScore,
    };
  }

  if (status === 'published') {
    return {
      state: 'published',
      canPublish: true,
      blockers: [],
      requiredActions: [],
      confidence: 'HIGH',
      verificationStatus,
      verificationScore,
    };
  }

  const blockers: StoryEditorialBlocker[] = [];
  const requiredActions: string[] = [];

  if (needsVerification(verificationStatus)) {
    const label = verificationStatus ? verificationStatus.replace(/_/g, ' ') : 'not started';
    blockers.push({ label: 'Verification incomplete', detail: `The linked verification case is ${label}. Verification must be complete before editorial readiness.` });
    requiredActions.push('Complete verification of the linked constituency case.');
    return {
      state: 'needs_verification',
      canPublish: false,
      blockers,
      requiredActions,
      confidence: 'LOW',
      verificationStatus,
      verificationScore,
    };
  }

  if ((openConflicts ?? 0) > 0) {
    blockers.push({ label: 'Conflicting evidence', detail: `${String(openConflicts)} registered conflict(s) remain unresolved between certified signals.` });
    requiredActions.push('Resolve all registered evidence conflicts in the Verification workspace.');
  }

  if (verificationCanPublish === false && openBlockers.length > 0) {
    for (const b of openBlockers) {
      blockers.push({ label: b.label, detail: b.detail });
    }
    requiredActions.push('Clear the verification readiness blockers for the linked constituency.');
  }

  if ((openFieldTasks ?? 0) > 0 && blockers.length === 0) {
    return {
      state: 'needs_field_reporting',
      canPublish: false,
      blockers: [{ label: 'Field verification pending', detail: `${String(openFieldTasks)} field verification task(s) remain open.` }],
      requiredActions: ['Complete the open field verification tasks.'],
      confidence: 'MEDIUM',
      verificationStatus,
      verificationScore,
    };
  }

  if (blockers.length > 0) {
    return {
      state: 'blocked',
      canPublish: false,
      blockers,
      requiredActions,
      confidence: tierFrom(verificationScore, 'MEDIUM'),
      verificationStatus,
      verificationScore,
    };
  }

  if (status === 'idea' || status === 'planned' || status === 'researching') {
    return {
      state: 'needs_research',
      canPublish: false,
      blockers: [{ label: 'Research phase', detail: `The story is in the ${status.replace(/_/g, ' ')} phase. Research must precede verification.` }],
      requiredActions: ['Complete research and register claims before requesting verification.'],
      confidence: 'MEDIUM',
      verificationStatus,
      verificationScore,
    };
  }

  if (status === 'verification_required') {
    return {
      state: 'needs_verification',
      canPublish: false,
      blockers: [{ label: 'Verification pending', detail: 'Verification has been requested but is not yet complete.' }],
      requiredActions: ['Track the verification case to completion in the Verification workspace.'],
      confidence: 'MEDIUM',
      verificationStatus,
      verificationScore,
    };
  }

  if (status === 'verification_complete' || status === 'drafting' || status === 'editorial_review') {
    return {
      state: 'needs_editorial_review',
      canPublish: false,
      blockers: [],
      requiredActions: status === 'verification_complete'
        ? ['Begin drafting the story.']
        : status === 'drafting'
          ? ['Complete the draft and move it into editorial review.']
          : ['Complete editorial review and move the story to ready for publication.'],
      confidence: 'HIGH',
      verificationStatus,
      verificationScore,
    };
  }

  // Control flow reaches here only for ready_for_publication: every other StoryStatus has
  // already returned. At this point verification is verified and no blockers remain.
  return {
    state: 'ready',
    canPublish: true,
    blockers: [],
    requiredActions: ['Publish the story.'],
    confidence: 'HIGH',
    verificationStatus,
    verificationScore,
  };
}
