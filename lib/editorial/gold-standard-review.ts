/**
 * ─── The Breakdown OS — Gold Standard Review Audit Engine (Phase 6) ──────────
 * Structured data representation of the 7-Phase Gold Standard Review defined in
 * Level 1 Editorial Constitution Article XI.
 */

export interface PhaseAuditRecord {
  phaseId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  phaseName: string;
  passed: boolean;
  auditorId?: string;
  auditDate?: string;
  notes?: string;
  blockingIssuesCount: number;
}

export interface GoldStandardAuditRecord {
  storyId: string;
  overallPassed: boolean;
  completedPhasesCount: number;
  phases: {
    phase1ExpertReview: PhaseAuditRecord;
    phase2ReaderReview: PhaseAuditRecord;
    phase3EvidenceAudit: PhaseAuditRecord;
    phase4BiasAudit: PhaseAuditRecord;
    phase5VisualAudit: PhaseAuditRecord;
    phase6KnowledgeDensityAudit: PhaseAuditRecord;
    phase7DefensibilityAudit: PhaseAuditRecord;
  };
  lastAuditTimestamp: string;
}

export function createDefaultGoldStandardAudit(storyId: string): GoldStandardAuditRecord {
  return {
    storyId,
    overallPassed: false,
    completedPhasesCount: 0,
    phases: {
      phase1ExpertReview: { phaseId: 1, phaseName: 'Expert Review (Min 2 Scholars)', passed: false, blockingIssuesCount: 0 },
      phase2ReaderReview: { phaseId: 2, phaseName: 'Reader Review (Confusion Points Audit)', passed: false, blockingIssuesCount: 0 },
      phase3EvidenceAudit: { phaseId: 3, phaseName: 'Evidence Audit (Independent Verification)', passed: false, blockingIssuesCount: 0 },
      phase4BiasAudit: { phaseId: 4, phaseName: 'Bias Audit (Nationalist / Presentism Audit)', passed: false, blockingIssuesCount: 0 },
      phase5VisualAudit: { phaseId: 5, phaseName: 'Visual Audit (Pedagogical Provenance)', passed: false, blockingIssuesCount: 0 },
      phase6KnowledgeDensityAudit: { phaseId: 6, phaseName: 'Knowledge Density Audit (Target Metrics)', passed: false, blockingIssuesCount: 0 },
      phase7DefensibilityAudit: { phaseId: 7, phaseName: 'Defensibility Audit ("Could We Defend This?")', passed: false, blockingIssuesCount: 0 },
    },
    lastAuditTimestamp: new Date().toISOString(),
  };
}

export function evaluateGoldStandardPass(record: GoldStandardAuditRecord): boolean {
  // Runtime data may come from persisted JSON and cannot be trusted merely
  // because its TypeScript interface is complete at compile time.
  if (!record || typeof record !== 'object') return false;
  if (record.overallPassed !== true || record.completedPhasesCount !== 7) return false;
  if (
    typeof record.lastAuditTimestamp !== 'string' ||
    !Number.isFinite(Date.parse(record.lastAuditTimestamp))
  ) {
    return false;
  }
  if (!record.phases || typeof record.phases !== 'object') return false;

  const phases = [
    record.phases.phase1ExpertReview,
    record.phases.phase2ReaderReview,
    record.phases.phase3EvidenceAudit,
    record.phases.phase4BiasAudit,
    record.phases.phase5VisualAudit,
    record.phases.phase6KnowledgeDensityAudit,
    record.phases.phase7DefensibilityAudit,
  ];

  // All seven distinct phases must be present, passed, and free of blockers.
  // A denormalized overall flag cannot override incomplete phase evidence.
  return phases.every((phase, index) => (
    !!phase &&
    phase.phaseId === index + 1 &&
    phase.passed === true &&
    Number.isInteger(phase.blockingIssuesCount) &&
    phase.blockingIssuesCount === 0
  ));
}
