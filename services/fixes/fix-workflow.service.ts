// ── Editorial Workflow Engine (AR-13A.0 Specification) ──────────────────────

import { Fix, PublicationStatus, StoryStatus } from '../../types/canonical';
import { FixValidationEngine, FixValidationReport } from './fix-validation.service';

export type EditorialWorkflowState =
  | 'draft'
  | 'research'
  | 'editorial_review'
  | 'fact_check'
  | 'expert_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'updated'
  | 'archived'
  | 'superseded';

export interface WorkflowActor {
  actorId: string;
  actorName: string;
  role: 'editor' | 'researcher' | 'fact_checker' | 'expert_reviewer' | 'editor_in_chief' | 'system';
}

export interface FixStateTransitionEvent {
  eventId: string;
  fixId: string;
  previousState: EditorialWorkflowState;
  newState: EditorialWorkflowState;
  actor: WorkflowActor;
  timestamp: string; // ISO-8601
  rationale?: string;
  validationReport: FixValidationReport;
  signature?: string;
}

export class FixWorkflowTransitionError extends Error {
  constructor(
    public fromState: EditorialWorkflowState,
    public toState: EditorialWorkflowState,
    public reason: string
  ) {
    super(`Illegal Workflow Transition [${fromState} -> ${toState}]: ${reason}`);
    this.name = 'FixWorkflowTransitionError';
  }
}

// ── Allowed Transitions Matrix ──────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<EditorialWorkflowState, EditorialWorkflowState[]> = {
  draft: ['research', 'archived'],
  research: ['editorial_review', 'draft', 'archived'],
  editorial_review: ['fact_check', 'research', 'archived'],
  fact_check: ['expert_review', 'editorial_review', 'archived'],
  expert_review: ['approved', 'fact_check', 'archived'],
  approved: ['published', 'scheduled', 'expert_review', 'archived'],
  scheduled: ['published', 'approved', 'archived'],
  published: ['updated', 'archived', 'superseded'],
  updated: ['published', 'editorial_review', 'archived'],
  archived: ['draft', 'superseded'],
  superseded: [],
};

export class FixWorkflowEngine {
  /**
   * Validates whether a state transition is legal according to the transition matrix.
   */
  public static isTransitionAllowed(fromState: EditorialWorkflowState, toState: EditorialWorkflowState): boolean {
    const allowedTargets = ALLOWED_TRANSITIONS[fromState] || [];
    return allowedTargets.includes(toState);
  }

  /**
   * Derives current EditorialWorkflowState from a Fix object.
   */
  public static getWorkflowState(fix: Fix): EditorialWorkflowState {
    if (fix.publicationStatus === 'superseded') return 'superseded';
    if (fix.publicationStatus === 'archived') return 'archived';
    if (fix.publicationStatus === 'published') return 'published';
    if (fix.publicationStatus === 'scheduled') return 'scheduled';
    if (fix.publicationStatus === 'review') return 'approved';
    if (fix.editorialStatus === 'fact_check') return 'fact_check';
    if (fix.editorialStatus === 'review') return 'editorial_review';
    return (fix.editorialStatus as EditorialWorkflowState) || 'draft';
  }

  /**
   * Executes a workflow state transition with transition guards and audit logging.
   */
  public static executeTransition(
    fix: Fix,
    targetState: EditorialWorkflowState,
    actor: WorkflowActor,
    options?: {
      rationale?: string;
      goldStandardAudited?: boolean;
      existingSlugs?: string[];
      signature?: string;
    }
  ): { updatedFix: Fix; auditEvent: FixStateTransitionEvent } {
    const currentState = this.getWorkflowState(fix);

    // 1. Check State Transition Matrix
    if (!this.isTransitionAllowed(currentState, targetState)) {
      throw new FixWorkflowTransitionError(
        currentState,
        targetState,
        `Transition from "${currentState}" to "${targetState}" is prohibited by the AR-13A.0 transition matrix.`
      );
    }

    // 2. Transition Guard: Gold Standard Audit requirement for Approved & Published
    const isGoldStandardPassed = options?.goldStandardAudited ?? false;
    if ((targetState === 'approved' || targetState === 'published') && !isGoldStandardPassed) {
      throw new FixWorkflowTransitionError(
        currentState,
        targetState,
        `Transition to "${targetState}" requires a completed Gold Standard Audit clearance.`
      );
    }

    // 3. Transition Guard: Validate Fix Readiness via FixValidationEngine
    const validationReport = FixValidationEngine.validate(fix, {
      goldStandardAudited: isGoldStandardPassed,
      existingSlugs: options?.existingSlugs,
    });

    if ((targetState === 'approved' || targetState === 'published') && !validationReport.canPublish) {
      throw new FixWorkflowTransitionError(
        currentState,
        targetState,
        `Validation Failure: ${validationReport.errorsCount} ERROR issues block transition to "${targetState}".`
      );
    }

    // 4. Update Fix Object State
    const nowIso = new Date().toISOString();
    let newPublicationStatus: PublicationStatus = fix.publicationStatus || 'draft';
    let newEditorialStatus: StoryStatus = fix.editorialStatus || 'draft';

    if (targetState === 'published') {
      newPublicationStatus = 'published';
      newEditorialStatus = 'published';
    } else if (targetState === 'scheduled') {
      newPublicationStatus = 'scheduled';
      newEditorialStatus = 'scheduled';
    } else if (targetState === 'archived') {
      newPublicationStatus = 'archived';
    } else if (targetState === 'superseded') {
      newPublicationStatus = 'superseded';
    } else if (targetState === 'approved') {
      newPublicationStatus = 'review';
      newEditorialStatus = 'review';
    } else {
      newPublicationStatus = 'draft';
      newEditorialStatus = (targetState as StoryStatus) || 'draft';
    }

    const updatedFix: Fix = {
      ...fix,
      editorialStatus: newEditorialStatus,
      publicationStatus: newPublicationStatus,
      updatedAt: nowIso,
    };

    // 5. Emit Immutable Audit Event
    const eventId = `evt-wfl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const auditEvent: FixStateTransitionEvent = {
      eventId,
      fixId: fix.id,
      previousState: currentState,
      newState: targetState,
      actor,
      timestamp: nowIso,
      rationale: options?.rationale || `State transitioned from ${currentState} to ${targetState}.`,
      validationReport,
      signature: options?.signature,
    };

    return { updatedFix, auditEvent };
  }
}
