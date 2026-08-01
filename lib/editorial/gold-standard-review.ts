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
  const p = record.phases;
  const allPassed =
    p.phase1ExpertReview.passed &&
    p.phase2ReaderReview.passed &&
    p.phase3EvidenceAudit.passed &&
    p.phase4BiasAudit.passed &&
    p.phase5VisualAudit.passed &&
    p.phase6KnowledgeDensityAudit.passed &&
    p.phase7DefensibilityAudit.passed;

  const totalBlocking =
    p.phase1ExpertReview.blockingIssuesCount +
    p.phase2ReaderReview.blockingIssuesCount +
    p.phase3EvidenceAudit.blockingIssuesCount +
    p.phase4BiasAudit.blockingIssuesCount +
    p.phase5VisualAudit.blockingIssuesCount +
    p.phase6KnowledgeDensityAudit.blockingIssuesCount +
    p.phase7DefensibilityAudit.blockingIssuesCount;

  return allPassed && totalBlocking === 0;
}
