/**
 * ─── The Breakdown OS — Editorial Workflow State Machine (Phase 6) ───────────
 * Validates editorial lifecycle state transitions in the domain layer.
 * Governed by Level 1 Editorial Constitution & Gold Standard Review rules.
 */

export type EditorialStage =
  | 'draft'
  | 'research_complete'
  | 'evidence_verified'
  | 'gold_standard_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'corrected'
  | 'archived';

export interface WorkflowTransitionAuditLog {
  fromStage: EditorialStage;
  toStage: EditorialStage;
  actorId: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
}

export interface EditorialStateRecord {
  storyId: string;
  currentStage: EditorialStage;
  ownerId: string;
  assignedEditorId?: string;
  auditTrail: WorkflowTransitionAuditLog[];
  blockingIssues: string[];
  updatedAt: string;
}

const ALLOWED_TRANSITIONS: Record<EditorialStage, EditorialStage[]> = {
  draft: ['research_complete'],
  research_complete: ['evidence_verified', 'draft'],
  evidence_verified: ['gold_standard_review', 'draft'],
  gold_standard_review: ['approved', 'draft', 'evidence_verified'],
  approved: ['scheduled', 'published'],
  scheduled: ['published', 'approved'],
  published: ['corrected', 'archived'],
  corrected: ['published', 'archived'],
  archived: ['draft'],
};

export function canTransition(from: EditorialStage, to: EditorialStage): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function transitionEditorialState(
  record: EditorialStateRecord,
  nextStage: EditorialStage,
  actorId: string,
  actorRole: string,
  notes?: string
): { success: boolean; record: EditorialStateRecord; error?: string } {
  if (!canTransition(record.currentStage, nextStage)) {
    return {
      success: false,
      record,
      error: `Invalid transition from ${record.currentStage} to ${nextStage}.`,
    };
  }

  if (nextStage === 'approved' && record.blockingIssues.length > 0) {
    return {
      success: false,
      record,
      error: `Cannot approve story with ${record.blockingIssues.length} unresolved blocking issues.`,
    };
  }

  const newAuditEntry: WorkflowTransitionAuditLog = {
    fromStage: record.currentStage,
    toStage: nextStage,
    actorId,
    actorRole,
    timestamp: new Date().toISOString(),
    notes,
  };

  const updatedRecord: EditorialStateRecord = {
    ...record,
    currentStage: nextStage,
    auditTrail: [...record.auditTrail, newAuditEntry],
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    record: updatedRecord,
  };
}
