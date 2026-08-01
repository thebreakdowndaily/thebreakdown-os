/**
 * ─── The Breakdown OS — EOS Assignment Board (RELEASE-4, Module 7) ────────────
 * Assignment records derive from newsroom stories and track the EOS stage.
 * The board is a projection over the store — assignments never diverge from
 * story state because they are re-derived on every read.
 */

import type { NewsroomStory, EditorialAssignment } from '../../../types/editorial-newsroom';

const PRIORITY_FROM_PRIORITY = (p: number): EditorialAssignment['priority'] => {
  if (p <= 25) return 'high';
  if (p <= 45) return 'medium';
  return 'low';
};

export function deriveAssignments(stories: NewsroomStory[]): EditorialAssignment[] {
  return stories.map(s => ({
    id: `assign-${s.id}`,
    storyId: s.id,
    title: s.title,
    stage: s.stage,
    reporters: s.reporters,
    editor: s.editor,
    deadline: s.deadline,
    priority: PRIORITY_FROM_PRIORITY(10 + s.claims.length * 5),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

export function boardByStage(assignments: EditorialAssignment[]): Record<string, EditorialAssignment[]> {
  const board: Record<string, EditorialAssignment[]> = {
    assigned: [],
    research: [],
    writing: [],
    fact_check: [],
    editorial_review: [],
    scheduled: [],
    published: [],
    archived: [],
  };
  for (const a of assignments) {
    (board[a.stage] ??= []).push(a);
  }
  return board;
}
