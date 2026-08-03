import { computeEditorialOverview } from '@/lib/intel/editorial/overview';
import { computeEvidenceOverview } from '@/lib/intel/evidence/overview';
import { getConstituencyToolkit } from '@/lib/intel/toolkit/overview';
import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type {
  ConfidenceTier,
} from '@/lib/intel/scoring/types';
import type {
  VerificationCase,
  VerificationExecutiveSummary,
  VerificationOverview,
  VerificationStatus,
} from './types';
import { deriveVerificationCase, VERIFICATION_CALC_VERSION } from './derive';
import { countStatuses, isOpenStatus } from './status';
import { ensureVerificationSeed, getVerificationWorkflow } from './store';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Aggregation entry for the Verification Operating System. Owns no engine logic — it loads
// the certified editorial overview and builds one Verification Case per top-priority
// constituency as a projection over the Editorial Investigation, the Toolkit workspace, and
// the workflow overlay.

export { VERIFICATION_CALC_VERSION };

const DEFAULT_TOP_N = 15;

const GLOBAL_LIMITATIONS = [
  'Workflow state is in-memory for the server process (matching the EOS store precedent). It is not durable across deployments or serverless cold starts.',
  'Verification Cases cover the top Investigation Priority seats only; lower-priority constituencies are surfaced via the Journalist Toolkit rather than a dedicated case.',
  'The audit trail records review actions within the process lifetime; it cannot reconstruct actions taken before the current process started.',
];

const BACKLOG_STATUSES: VerificationStatus[] = [
  'unreviewed',
  'in_review',
  'evidence_incomplete',
  'needs_field_verification',
  'needs_official_confirmation',
];

function confidenceFromCases(cases: VerificationCase[]): ConfidenceTier {
  if (cases.length === 0) return 'VERY_LOW';
  const avgScore = cases.reduce((n, c) => n + c.readiness.score, 0) / cases.length;
  if (avgScore >= 75) return 'HIGH';
  if (avgScore >= 50) return 'MEDIUM';
  return 'LOW';
}

function buildVerificationOverview(
  cases: VerificationCase[],
  editorial: EditorialOverview,
  evidence: EvidenceOverview
): VerificationOverview {
  const statusCounts = countStatuses(cases.map((c) => c.status));
  const openCases = cases.filter((c) => isOpenStatus(c.status)).length;
  const verifiedCases = cases.filter((c) => c.status === 'verified').length;
  const rejectedCases = cases.filter((c) => c.status === 'rejected').length;
  const backlogCount = cases.filter((c) => BACKLOG_STATUSES.includes(c.status)).length;
  const highPriorityOpen = cases.filter(
    (c) => isOpenStatus(c.status) && (c.priorityTier === 'critical' || c.priorityTier === 'high')
  ).length;
  const openConflicts = cases.reduce((n, c) => n + c.conflicts.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: editorial.dataSource,
    researchCutoff: editorial.researchCutoff,
    totalCases: cases.length,
    statusCounts,
    openCases,
    verifiedCases,
    rejectedCases,
    backlogCount,
    highPriorityOpen,
    openConflicts,
    evidenceDebt: Math.round(evidence.aggregate.totalDebt),
    overallConfidence: confidenceFromCases(cases),
    cases,
    limitations: GLOBAL_LIMITATIONS,
    storeNote: 'Verification workflow state is in-memory for the server process. Transitions are append-only within that lifetime.',
  };
}

/** Full dashboard overview: top-priority cases with toolkit detail, workflow overlay applied. */
export async function computeVerificationOverview(topN = DEFAULT_TOP_N): Promise<VerificationOverview> {
  const editorial = await computeEditorialOverview(403);
  const evidence = await computeEvidenceOverview(403);
  const top = editorial.ranked.slice(0, topN);
  ensureVerificationSeed(top.map((i) => i.canonical_constituency_id));

  const cases: VerificationCase[] = [];
  for (const inv of top) {
    const toolkit = await getConstituencyToolkit(inv.canonical_constituency_id);
    const workflow = getVerificationWorkflow(inv.canonical_constituency_id) ?? null;
    cases.push(deriveVerificationCase(inv, toolkit, workflow));
  }

  return buildVerificationOverview(cases, editorial, evidence);
}

/** Single-case detail view: full toolkit detail for one constituency. */
export async function computeVerificationCaseDetail(caseId: string): Promise<VerificationCase | null> {
  const editorial = await computeEditorialOverview(403);
  const inv = editorial.ranked.find((i) => i.canonical_constituency_id === caseId);
  if (!inv) return null;
  ensureVerificationSeed([caseId]);
  const toolkit = await getConstituencyToolkit(caseId);
  const workflow = getVerificationWorkflow(caseId) ?? null;
  return deriveVerificationCase(inv, toolkit, workflow);
}

/** Case ids for the top-priority seats — used by server actions to seed the workflow overlay. */
export async function getVerificationCaseIds(topN = DEFAULT_TOP_N): Promise<string[]> {
  const editorial = await computeEditorialOverview(403);
  return editorial.ranked.slice(0, topN).map((i) => i.canonical_constituency_id);
}

interface ExecutiveInputs {
  editorial: EditorialOverview;
  evidence: EvidenceOverview;
}

/**
 * Mission Control projection. Pure and synchronous — derives lightweight cases (factor-only,
 * no toolkit detail) from the already-loaded editorial/evidence overviews and the workflow
 * overlay. The Executive Intelligence Service consumes this and nothing else from the
 * Verification Service.
 */
export function buildVerificationExecutiveSummary(inputs: ExecutiveInputs): VerificationExecutiveSummary {
  const { editorial, evidence } = inputs;
  const top = editorial.ranked.slice(0, 10);

  const cases: VerificationCase[] = top.map((inv: InvestigationCase) => {
    const workflow = getVerificationWorkflow(inv.canonical_constituency_id) ?? null;
    const toolkit = null as ConstituencyToolkit | null;
    return deriveVerificationCase(inv, toolkit, workflow);
  });

  const statusCounts = countStatuses(cases.map((c) => c.status));
  const openCases = cases.filter((c) => isOpenStatus(c.status)).length;
  const verifiedCases = cases.filter((c) => c.status === 'verified').length;
  const highPriorityOpen = cases.filter(
    (c) => isOpenStatus(c.status) && (c.priorityTier === 'critical' || c.priorityTier === 'high')
  ).length;
  const backlogCount = cases.filter((c) => BACKLOG_STATUSES.includes(c.status)).length;
  const openConflicts = cases.reduce((n, c) => n + c.conflicts.length, 0);

  const verifiedRecently = cases
    .filter((c) => c.status === 'verified' && c.lastTransition)
    .map((c) => ({ caseId: c.id, constituencyName: c.constituencyName, verifiedAt: c.lastTransition?.at ?? '' }));

  const blockedInvestigations = cases
    .filter((c) => c.readiness.blockers.length > 0)
    .slice(0, 5)
    .map((c) => ({ caseId: c.id, constituencyName: c.constituencyName, reason: c.readiness.recommendation }));

  return {
    generatedAt: new Date().toISOString(),
    totalCases: cases.length,
    openCases,
    highPriorityOpen,
    verifiedCases,
    backlogCount,
    openConflicts,
    verifiedRecently,
    blockedInvestigations,
    statusCounts,
    persistence: 'none',
    note: 'Mission Control projection — lightweight factor-derived cases, workflow overlay applied. Full detail lives in the Verification workspace.',
  };
}
