/**
 * ─── The Breakdown OS — EOS Newsroom Workflow (RELEASE-4) ───────────────────
 * Guarded stage machine for the newsroom pipeline:
 *   assigned → research → writing → fact_check → editorial_review →
 *   scheduled → published → archived
 *
 * Mirrors the canonical EditorialStage machine (lib/editorial/workflow-state-machine.ts)
 * — the EOS vocabulary maps 1:1 onto canonical stages for publication. Publication
 * is BLOCKED while any claim is unresolved and not editor-approved.
 */

import type { NewsroomStage, NewsroomStory, EosTransitionResult } from '../../../types/editorial-newsroom';
import { canTransition as canonicalCanTransition } from '../workflow-state-machine';

export const NEWSROOM_STAGES: NewsroomStage[] = [
  'assigned',
  'research',
  'writing',
  'fact_check',
  'editorial_review',
  'scheduled',
  'published',
  'archived',
];

/** EOS stage → canonical EditorialStage (for traceability to the frozen backbone). */
export function toCanonicalStage(stage: NewsroomStage): 'draft' | 'research_complete' | 'evidence_verified' | 'gold_standard_review' | 'approved' | 'scheduled' | 'published' | 'archived' {
  switch (stage) {
    case 'assigned':
      return 'draft';
    case 'research':
      return 'research_complete';
    case 'writing':
      return 'evidence_verified';
    case 'fact_check':
      return 'evidence_verified';
    case 'editorial_review':
      return 'gold_standard_review';
    case 'scheduled':
      return 'scheduled';
    case 'published':
      return 'published';
    case 'archived':
      return 'archived';
  }
}

const ALLOWED_NEWSROOM_TRANSITIONS: Record<NewsroomStage, NewsroomStage[]> = {
  assigned: ['research', 'archived'],
  research: ['writing', 'assigned'],
  writing: ['fact_check', 'research'],
  fact_check: ['editorial_review', 'writing'],
  editorial_review: ['scheduled', 'published', 'fact_check'],
  scheduled: ['published', 'editorial_review'],
  published: ['archived'],
  archived: ['assigned'],
};

export function canNewsroomTransition(from: NewsroomStage, to: NewsroomStage): boolean {
  return ALLOWED_NEWSROOM_TRANSITIONS[from].includes(to);
}

export function newsroomTransitionIsCanonical(from: NewsroomStage, to: NewsroomStage): boolean {
  return canonicalCanTransition(toCanonicalStage(from), toCanonicalStage(to));
}

/**
 * Publication gate (Module 10). Returns the list of blocking issues.
 * Any claim that is not Verified and not explicitly editor-approved blocks publication.
 */
export function publicationBlockers(story: NewsroomStory): string[] {
  const blockers: string[] = [];
  const unresolved = story.claims.filter(
    c =>
      c.status === 'Needs Verification' ||
      c.status === 'Unsupported' ||
      (c.status === 'Partially Verified' && !c.checkedBy)
  );
  if (unresolved.length > 0) {
    blockers.push(
      `${String(unresolved.length)} unresolved claim(s) (${unresolved.map(c => c.id).join(', ')}) must be verified or editor-approved before publication.`
    );
  }
  if (story.blockingIssues.length > 0) {
    blockers.push(...story.blockingIssues);
  }
  return blockers;
}

export function transitionNewsroomStory(
  story: NewsroomStory,
  to: NewsroomStage,
  actorId: string,
  notes?: string
): EosTransitionResult {
  if (!canNewsroomTransition(story.stage, to)) {
    return {
      success: false,
      story,
      error: `Invalid transition from ${story.stage} to ${to}.`,
    };
  }

  if (to === 'editorial_review' || to === 'scheduled' || to === 'published') {
    const blockers = publicationBlockers(story);
    if (blockers.length > 0) {
      return {
        success: false,
        story,
        error: `Cannot advance to ${to}: ${blockers.join(' ')}`,
      };
    }
  }

  const now = new Date().toISOString();
  const updated: NewsroomStory = {
    ...story,
    stage: to,
    updatedAt: now,
    publishedAt: to === 'published' ? now : story.publishedAt,
  };

  const activity = {
    id: `act-${story.id}-${String(Date.now())}`,
    storyId: story.id,
    actorId,
    type: 'transition' as const,
    body: `Advanced ${story.title} from ${story.stage} to ${to}.${notes ? ` ${notes}` : ''}`,
    createdAt: now,
  };

  return { success: true, story: updated, activity };
}
