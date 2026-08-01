// ── Evidence Evolution Service (Phase 26B WP2) ─────────────────────────────────

import { ConfidenceTrajectoryNode, HistoricalSnapshotPoint, ClaimRevisionEvent } from '../../types/evidence-evolution';

export class EvidenceEvolutionService {
  /**
   * Composes canonical Knowledge Objects into pure, non-mutating ConfidenceTrajectoryNode structures.
   */
  public static getCanonicalTrajectories(): readonly ConfidenceTrajectoryNode[] {
    const snapshots1: HistoricalSnapshotPoint[] = [
      {
        snapshotId: 'snap-1949',
        snapshotDate: '1949-01-01',
        snapshotLabel: '1949 Karachi Baseline Snapshot',
        activeClaimCount: 12,
        activeEvidenceCount: 18,
        confidenceGrade: 'Moderate',
        summaryStateNote: 'Initial military cease-fire records and UN Security Council Resolution 47 text.',
      },
      {
        snapshotId: 'snap-1972',
        snapshotDate: '1972-07-02',
        snapshotLabel: '1972 Simla Treaty Snapshot',
        activeClaimCount: 24,
        activeEvidenceCount: 42,
        confidenceGrade: 'High',
        summaryStateNote: 'Bilateral treaty documentation converting CFL to LoC under bilateral autonomy principles.',
      },
      {
        snapshotId: 'snap-2003',
        snapshotDate: '2003-11-25',
        snapshotLabel: '2003 Ceasefire Renewal Snapshot',
        activeClaimCount: 38,
        activeEvidenceCount: 76,
        confidenceGrade: 'High',
        summaryStateNote: 'Formal military cease-fire understanding renewal and confidence-building measures.',
      },
      {
        snapshotId: 'snap-2026',
        snapshotDate: '2026-07-01',
        snapshotLabel: '2026 Platform Snapshot',
        activeClaimCount: 52,
        activeEvidenceCount: 128,
        confidenceGrade: 'High',
        summaryStateNote: 'Comprehensive historiography, legal treaties, and archival primary source dossier.',
      },
    ];

    const revisions1: ClaimRevisionEvent[] = [
      {
        eventId: 'rev-evt-1972',
        timestamp: '1972-07-02',
        classification: 'NEW_EVIDENCE_ADDED',
        summary: 'Incorporated Official Simla Agreement Treaty Document',
        rationale: 'Bilateral agreement text published in Official Gazette provided primary legal reference.',
        evidenceSourceTitle: 'Government of India Treaty Series No. 12 (1972)',
        priorConfidence: 'Moderate',
        newConfidence: 'High',
      },
      {
        eventId: 'rev-evt-2003',
        timestamp: '2003-11-25',
        classification: 'CONFIDENCE_REVISED',
        summary: 'Re-evaluated Ceasefire De-escalation Evidence Base',
        rationale: 'Addition of border incident logs and official military joint statements strengthened confidence.',
        evidenceSourceTitle: 'UNMOGIP Ceasefire Logs & Joint Press Release',
        priorConfidence: 'Moderate',
        newConfidence: 'High',
      },
    ];

    const trajectoryNode: ConfidenceTrajectoryNode = {
      nodeId: 'traj-kashmir-autonomy',
      claimId: 'CLM-DOM-001',
      claimTitle: 'Bilateral Strategic Autonomy & Ceasefire Boundary Integrity',
      currentConfidence: 'High',
      historicalSnapshots: Object.freeze(snapshots1.map((s) => Object.freeze({ ...s }))),
      revisionHistory: Object.freeze(revisions1.map((r) => Object.freeze({ ...r }))),
      knowledgeDriftSummary:
        'Knowledge base expanded from 18 primary evidence items (1949) to 128 verified sources (2026), shifting confidence from Moderate to High without overriding historical context.',
      relatedProblemSlugs: Object.freeze(['kashmir-1947-un-reference']),
      relatedFixIds: Object.freeze(['FIX-DOM-001']),
    };

    return Object.freeze([Object.freeze(trajectoryNode)]);
  }

  public static getTrajectoryByClaimId(claimId: string): ConfidenceTrajectoryNode | undefined {
    return this.getCanonicalTrajectories().find((t) => t.claimId === claimId);
  }
}
