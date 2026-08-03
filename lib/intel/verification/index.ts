// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Public surface of the Verification Operating System. This is the ONLY entry point other
// services and surfaces import from — same discipline as the Executive Intelligence Service.

export type {
  VerificationStatus,
  VerificationStatusCounts,
  AuditAction,
  AuditEntry,
  ClaimRegisterStatus,
  VerificationClaim,
  ConflictRecord,
  EvidenceReview,
  FieldVerificationPlan,
  EditorialBlocker,
  EditorialReadiness,
  CaseReviewer,
  VerificationPriorityTier,
  VerificationCase,
  VerificationOverview,
  VerificationExecutiveSummary,
  Actor,
  VerificationTransitionResult,
} from './types';

export { VERIFICATION_STATUSES } from './types';

export {
  TRANSITION_MAP,
  canTransition,
  nextTransitions,
  isTerminal,
  isReviewOutcome,
  isOpenStatus,
  verificationStatusLabel,
  emptyStatusCounts,
  countStatuses,
} from './status';

export { buildClaimRegister } from './claims';
export { detectConflicts } from './conflicts';
export { buildEvidenceReview } from './evidence-review';
export { buildFieldVerificationPlan } from './field';
export { computeReadiness } from './readiness';
export { deriveVerificationCase, priorityTierFor, VERIFICATION_CALC_VERSION } from './derive';

export {
  ensureVerificationSeed,
  getVerificationWorkflow,
  getVerificationStatus,
  getVerificationAudit,
  transitionVerificationCase,
  assignVerificationReviewer,
  addVerificationNote,
  resetVerificationStore,
} from './store';

export {
  computeVerificationOverview,
  computeVerificationCaseDetail,
  getVerificationCaseIds,
  buildVerificationExecutiveSummary,
} from './overview';
