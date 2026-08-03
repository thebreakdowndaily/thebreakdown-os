import type { EditorialReadiness, EditorialBlocker, VerificationClaim, ConflictRecord, EvidenceReview, FieldVerificationPlan } from './types';
import type { VerificationStatus } from './types';
import { verificationStatusLabel } from './status';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Editorial Readiness)
// Editorial Readiness is the handoff contract to the Story Builder. It is computed
// deterministically from the derived case content (claims, conflicts, evidence, field plan)
// and the workflow status. It is the Verification Service's single answer to the question:
// "is this investigation ready to become a story?"

export interface ReadinessInputs {
  claims: VerificationClaim[];
  conflicts: ConflictRecord[];
  evidence: EvidenceReview;
  field: FieldVerificationPlan;
  status: VerificationStatus;
}

function cap(value: number, ceiling: number): number {
  return Math.max(0, Math.min(value, ceiling));
}

/** Compute editorial readiness from derived content + workflow status. Pure and deterministic. */
export function computeReadiness(input: ReadinessInputs): EditorialReadiness {
  const { claims, conflicts, evidence, field, status } = input;

  const openConflicts = conflicts.length;
  const missingClaims = claims.filter((c) => c.kind === 'missing_evidence').length;
  const weakClaims = claims.filter((c) => c.kind === 'weak_evidence').length;
  const contestedClaims = claims.filter((c) => c.status === 'contested').length;
  const unverifiedClaims = claims.filter((c) => c.status === 'unverified').length;
  const verifiedClaims = claims.filter((c) => c.status === 'verified').length;
  const totalClaims = claims.length;

  const lowConfidenceEvidence = evidence.confidence === 'LOW' || evidence.confidence === 'VERY_LOW';

  let score = 100;
  score -= cap(openConflicts * 8, 40);
  score -= cap(missingClaims * 6, 24);
  score -= cap(weakClaims * 4, 16);
  score -= cap(contestedClaims * 5, 20);
  score -= cap(unverifiedClaims * 3, 15);
  if (lowConfidenceEvidence) score -= 10;
  score -= cap(Math.floor(field.taskCount / 10) * 2, 10);

  const blockers: EditorialBlocker[] = [];
  for (const c of conflicts) blockers.push({ label: `Open conflict`, detail: c.title });
  for (const c of claims.filter((x) => x.kind === 'missing_evidence')) blockers.push({ label: 'Missing evidence', detail: c.text });
  for (const c of claims.filter((x) => x.kind === 'weak_evidence').slice(0, 3)) blockers.push({ label: 'Weak evidence', detail: c.text });
  if (lowConfidenceEvidence) blockers.push({ label: 'Low evidence confidence', detail: `Evidence confidence is ${evidence.confidence.replace('_', ' ')}.` });
  if (unverifiedClaims > 0) blockers.push({ label: 'Unverified claims', detail: `${unverifiedClaims} of ${totalClaims} claims unverified.` });
  if (field.taskCount > 0) blockers.push({ label: 'Field tasks outstanding', detail: `${field.taskCount} field verification tasks remain.` });

  if (status === 'verified') score = Math.max(score, 85);
  if (status === 'rejected') score = 0;
  if (status === 'archived') score = 0;

  const verifiedRatio = totalClaims > 0 ? verifiedClaims / totalClaims : 1;
  const canPublish =
    status === 'verified' && openConflicts === 0 && verifiedRatio >= 0.8;

  let recommendation: string;
  if (openConflicts > 0) {
    recommendation = `Resolve ${openConflicts} open conflict(s) before sign-off.`;
  } else if (missingClaims > 0) {
    recommendation = 'Close evidence gaps before field verification completes.';
  } else if (status === 'verified') {
    recommendation = 'Ready for editorial handoff to the Story Builder.';
  } else {
    recommendation = `Complete evidence review (${verificationStatusLabel(status)}).`;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    canPublish,
    blockers,
    verifiedClaims,
    totalClaims,
    openConflicts,
    openFieldTasks: field.taskCount,
    recommendation,
  };
}
