import type { VerificationWorkspace } from '@/lib/intel/toolkit/types';
import type { InvestigationCase, EditorialFactor } from '@/lib/intel/editorial/types';
import type { ConflictRecord } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Conflict Detector)
// Conflict detection is a projection over the toolkit verification workspace (which already
// flags LS2024-vs-MLA and party-turnover conflicts) plus deterministic factor-driven rules on
// the Editorial Investigation case. No conflict is invented — each maps to engine signals.

function conflictId(constituencyId: string, seed: string): string {
  return `conflict-${constituencyId}-${seed}`;
}

const STANDARD_RESOLUTION = [
  'Collect official result sheets for the contested cycles',
  'Reconcile figures against the ECI gazette',
  'Interview the Returning Officer / District Election Officer',
];

function fromToolkitConflicts(workspace: VerificationWorkspace, constituencyId: string): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  workspace.items
    .filter((i) => i.kind === 'conflicting_evidence')
    .forEach((item, i) => {
      const severity = item.title.includes('Party turnover') ? 'high' : item.title.includes('LS2024') ? 'high' : 'medium';
      conflicts.push({
        id: conflictId(constituencyId, `toolkit-${String(i)}`),
        title: item.title,
        detail: item.detail,
        between: item.source.split(' vs '),
        severity,
        resolutionSteps: STANDARD_RESOLUTION,
        source: `toolkit:${item.source}`,
      });
    });
  return conflicts;
}

function factorValue(factors: EditorialFactor[], key: string): number | undefined {
  return factors.find((f) => f.key === key)?.value;
}

function fromInvestigationConflicts(investigation: InvestigationCase): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  const vp = factorValue(investigation.factors, 'verification_pressure');
  const ed = factorValue(investigation.factors, 'evidence_debt');
  if (vp !== undefined && ed !== undefined && vp >= 55 && ed >= 55) {
    conflicts.push({
      id: conflictId(investigation.canonical_constituency_id, 'debt-pressure'),
      title: 'Evidence debt under verification pressure',
      detail: `Verification pressure is ${String(Math.round(vp))}/100 while evidence debt is ${String(Math.round(ed))}/100. Claims risk being asserted ahead of the evidence needed to support them.`,
      between: ['verification_pressure', 'evidence_debt'],
      severity: vp >= 70 || ed >= 70 ? 'high' : 'medium',
      resolutionSteps: [
        'Prioritise evidence-gap closure before field verification sign-off',
        'Re-verify high-contribution claims against primary sources',
      ],
      source: 'investigation:verification_pressure+evidence_debt',
    });
  }

  const pi = factorValue(investigation.factors, 'prediction_instability');
  const se = factorValue(investigation.factors, 'scenario_exposure');
  if (pi !== undefined && se !== undefined && pi >= 55 && se >= 55) {
    conflicts.push({
      id: conflictId(investigation.canonical_constituency_id, 'unstable-scenario'),
      title: 'Unstable prediction exposed to multiple scenarios',
      detail: `Prediction instability (${String(Math.round(pi))}/100) combines with scenario exposure (${String(Math.round(se))}/100). Baseline and scenario outcomes disagree; field reporting must establish which signals are durable.`,
      between: ['prediction_instability', 'scenario_exposure'],
      severity: pi >= 70 || se >= 70 ? 'high' : 'medium',
      resolutionSteps: [
        'List the scenario flips affecting this seat',
        'Field-verify the swing signals driving the flips',
      ],
      source: 'investigation:prediction_instability+scenario_exposure',
    });
  }

  return conflicts;
}

/** Detect all registered conflicts for a constituency from certified signals. */
export function detectConflicts(
  constituencyId: string,
  workspace: VerificationWorkspace | null,
  investigation: InvestigationCase | null
): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  if (workspace) conflicts.push(...fromToolkitConflicts(workspace, constituencyId));
  if (investigation) conflicts.push(...fromInvestigationConflicts(investigation));

  const seen = new Set<string>();
  const unique = conflicts.filter((c) => {
    const key = c.title + c.detail;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 6);
}
