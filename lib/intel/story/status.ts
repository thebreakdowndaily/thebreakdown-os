import type { StoryStatus, StoryStatusCounts } from './types';
import { STORY_STATUSES } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial Status Model)
// Canonical editorial workflow. Every status transition is explicit — there is no "any state to
// any state". Terminal states (archived) admit no outgoing transitions. Verification gates are
// enforced in the store, not here: reaching verification_complete, editorial_review, or
// ready_for_publication requires the linked verification case to be verified (Verification is
// mandatory before editorial readiness).

export const STORY_TRANSITION_MAP: Record<StoryStatus, readonly StoryStatus[]> = {
  idea: ['planned', 'archived'],
  planned: ['researching', 'verification_required', 'idea', 'archived'],
  researching: ['verification_required', 'planned', 'archived'],
  verification_required: ['verification_complete', 'researching', 'archived'],
  verification_complete: ['drafting', 'verification_required', 'archived'],
  drafting: ['editorial_review', 'verification_required', 'archived'],
  editorial_review: ['ready_for_publication', 'drafting', 'verification_required', 'archived'],
  ready_for_publication: ['published', 'editorial_review', 'archived'],
  published: ['editorial_review', 'archived'],
  archived: [],
};

/** States that cannot be reached until the linked verification case is verified. */
export const VERIFICATION_GATED_STATES: readonly StoryStatus[] = [
  'verification_complete',
  'editorial_review',
  'ready_for_publication',
];

export function canTransitionStory(from: StoryStatus, to: StoryStatus): boolean {
  if (from === to) return false;
  return STORY_TRANSITION_MAP[from].includes(to);
}

export function nextStoryTransitions(from: StoryStatus): StoryStatus[] {
  return [...STORY_TRANSITION_MAP[from]];
}

export function isTerminalStory(status: StoryStatus): boolean {
  return STORY_TRANSITION_MAP[status].length === 0;
}

export function isStoryOpen(status: StoryStatus): boolean {
  return !isTerminalStory(status) && status !== 'published';
}

export function isVerificationGated(to: StoryStatus): boolean {
  return VERIFICATION_GATED_STATES.includes(to);
}

const STORY_STATUS_LABEL: Record<StoryStatus, string> = {
  idea: 'Idea',
  planned: 'Planned',
  researching: 'Researching',
  verification_required: 'Verification Required',
  verification_complete: 'Verification Complete',
  drafting: 'Drafting',
  editorial_review: 'Editorial Review',
  ready_for_publication: 'Ready for Publication',
  published: 'Published',
  archived: 'Archived',
};

export function storyStatusLabel(status: StoryStatus): string {
  return STORY_STATUS_LABEL[status];
}

export function emptyStoryStatusCounts(): StoryStatusCounts {
  const counts = {} as StoryStatusCounts;
  for (const s of STORY_STATUSES) counts[s] = 0;
  return counts;
}

export function countStoryStatuses(statuses: StoryStatus[]): StoryStatusCounts {
  const counts = emptyStoryStatusCounts();
  for (const s of statuses) counts[s] += 1;
  return counts;
}
