import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type {
  AuditEntry,
  CaseReviewer,
  VerificationCase,
  VerificationPriorityTier,
  VerificationStatus,
} from './types';
import { buildClaimRegister } from './claims';
import { detectConflicts } from './conflicts';
import { buildEvidenceReview } from './evidence-review';
import { buildFieldVerificationPlan } from './field';
import { computeReadiness } from './readiness';
import { getVerificationStatus } from './store';

export const VERIFICATION_CALC_VERSION = '1.0.0';

export interface VerificationWorkflowView {
  status: VerificationStatus;
  reviewer?: CaseReviewer;
  assignedAt?: string;
  reviewNotes: string[];
  lastTransition?: { at: string; by?: string; from?: VerificationStatus; to: VerificationStatus };
  audit: AuditEntry[];
}

export function priorityTierFor(ipi: number): VerificationPriorityTier {
  if (ipi >= 70) return 'critical';
  if (ipi >= 55) return 'high';
  if (ipi >= 40) return 'medium';
  return 'low';
}

/**
 * Assemble a Verification Case for one constituency. The case is a projection over the
 * editorial InvestigationCase, the certified Toolkit workspace/field-pack/evidence, and the
 * workflow overlay. It owns metadata only — every derived section references engine outputs.
 */
export function deriveVerificationCase(
  investigation: InvestigationCase,
  toolkit: ConstituencyToolkit | null,
  workflow: VerificationWorkflowView | null
): VerificationCase {
  const id = investigation.canonical_constituency_id;
  const status = workflow?.status ?? getVerificationStatus(id);

  const claims = buildClaimRegister(id, toolkit?.verification ?? null, investigation);
  const conflicts = detectConflicts(id, toolkit?.verification ?? null, investigation);
  const evidenceReview = buildEvidenceReview(toolkit?.evidence ?? null, investigation);
  const fieldPlan = buildFieldVerificationPlan(toolkit?.verification ?? null, toolkit?.fieldPack ?? null, investigation);
  const readiness = computeReadiness({ claims, conflicts, evidence: evidenceReview, field: fieldPlan, status });

  const missingCount = claims.filter((c) => c.kind === 'missing_evidence').length;
  const summary = `${investigation.constituency_name} — ${investigation.predicted_winner} favoured (${String(Math.round(investigation.winner_probability))}%). ${String(conflicts.length)} conflict(s), ${String(missingCount)} missing evidence row(s). ${investigation.topReasons[0]?.why ?? ''}`;

  return {
    id,
    constituencyId: id,
    constituencyName: investigation.constituency_name,
    acNumber: investigation.ac_number,
    district: investigation.district,
    region: investigation.region,
    reservationType: investigation.reservation_type,
    currentMlaParty: investigation.current_mla_party,
    predictedWinner: investigation.predicted_winner,
    winnerProbability: investigation.winner_probability,
    ipi: investigation.ipi,
    priorityTier: priorityTierFor(investigation.ipi),
    confidence: investigation.confidence,
    summary,
    status,
    reviewer: workflow?.reviewer,
    assignedAt: workflow?.assignedAt,
    reviewNotes: [...(workflow?.reviewNotes ?? [])],
    claimRegister: claims,
    conflicts,
    evidenceReview,
    fieldPlan,
    readiness,
    lastTransition: workflow?.lastTransition,
    audit: [...(workflow?.audit ?? [])],
    updatedAt: new Date().toISOString(),
    source: `verification-service@${VERIFICATION_CALC_VERSION}`,
  };
}
