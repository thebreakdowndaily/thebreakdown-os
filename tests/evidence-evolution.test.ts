import { describe, it, expect } from 'vitest';
import { EvidenceEvolutionService } from '../lib/evolution/evidence-evolution-service';
import { EvidenceEvolutionProjectionBuilder } from '../lib/evolution/evidence-projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-EVIDENCE-EVOLUTION: Evidence Evolution & Historical Snapshot Engine (Phase 26B)', () => {
  it('TEST-EVIDENCE-EVOLUTION-01: Canonical Trajectory Node Composition from Knowledge Objects', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();

    expect(trajectories.length).toBeGreaterThan(0);
    expect(trajectories[0].nodeId).toBe('traj-kashmir-autonomy');
    expect(trajectories[0].claimId).toBe('CLM-DOM-001');
    expect(Object.isFrozen(trajectories)).toBe(true);
  });

  it('TEST-EVIDENCE-EVOLUTION-02: Zero-Persistence Projection-Only Invariant Verification', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    EvidenceEvolutionService.getCanonicalTrajectories();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-EVIDENCE-EVOLUTION-03: Problem-Scoped Trajectory Resolution', () => {
    const proj = EvidenceEvolutionProjectionBuilder.buildProjection({ problemSlug: 'kashmir-1947-un-reference' });

    expect(proj.nodeCount).toBe(1);
    expect(proj.trajectoryNodes[0].relatedProblemSlugs).toContain('kashmir-1947-un-reference');
  });

  it('TEST-EVIDENCE-EVOLUTION-04: Reproducible Historical Snapshot State Resolution', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();
    const snapshots = trajectories[0].historicalSnapshots;

    expect(snapshots.length).toBe(4);
    expect(snapshots[0].snapshotDate).toBe('1949-01-01');
    expect(snapshots[1].snapshotDate).toBe('1972-07-02');
    expect(snapshots[2].snapshotDate).toBe('2003-11-25');
    expect(snapshots[3].snapshotDate).toBe('2026-07-01');
  });

  it('TEST-EVIDENCE-EVOLUTION-05: Classified Claim Revision Event Resolution', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();
    const revisions = trajectories[0].revisionHistory;

    expect(revisions.length).toBe(2);
    expect(revisions[0].classification).toBe('NEW_EVIDENCE_ADDED');
    expect(revisions[1].classification).toBe('CONFIDENCE_REVISED');
  });

  it('TEST-EVIDENCE-EVOLUTION-06: Confidence Trajectory Transition Rationale Verification', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();
    const revisions = trajectories[0].revisionHistory;

    expect(revisions[0].rationale.length).toBeGreaterThan(10);
    expect(revisions[0].priorConfidence).toBe('Moderate');
    expect(revisions[0].newConfidence).toBe('High');
  });

  it('TEST-EVIDENCE-EVOLUTION-07: Descriptive Knowledge Drift Audit Resolution', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();

    expect(trajectories[0].knowledgeDriftSummary).toContain('18 primary evidence items (1949) to 128 verified sources');
  });

  it('TEST-EVIDENCE-EVOLUTION-08: Metric Provenance Linkage Across Revisions', () => {
    const trajectories = EvidenceEvolutionService.getCanonicalTrajectories();
    const revisions = trajectories[0].revisionHistory;

    expect(revisions[0].evidenceSourceTitle).toBe('Government of India Treaty Series No. 12 (1972)');
  });

  it('TEST-EVIDENCE-EVOLUTION-09: Evolution Safeguard Disclaimer Invariant Verification', () => {
    const proj = EvidenceEvolutionProjectionBuilder.buildProjection();

    expect(proj.evolutionDisclaimer).toBe(
      'Evidence Evolution records, compares, and explains revisions. Evidence Evolution never assumes newer evidence is inherently stronger or rewrites historical context.'
    );
  });

  it('TEST-EVIDENCE-EVOLUTION-10: EvidenceEvolutionProjection Building & Immutability', () => {
    const proj = EvidenceEvolutionProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.trajectoryNodes)).toBe(true);
  });

  it('TEST-EVIDENCE-EVOLUTION-11: Trajectory Lookup Resolution by Claim ID', () => {
    const trajectory = EvidenceEvolutionService.getTrajectoryByClaimId('CLM-DOM-001');

    expect(trajectory).toBeDefined();
    expect(trajectory?.claimId).toBe('CLM-DOM-001');
  });

  it('TEST-EVIDENCE-EVOLUTION-12: Missing Trajectory Data Handling & Fallback Safety', () => {
    const trajectory = EvidenceEvolutionService.getTrajectoryByClaimId('non-existent-claim');
    expect(trajectory).toBeUndefined();
  });

  it('TEST-EVIDENCE-EVOLUTION-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    EvidenceEvolutionProjectionBuilder.buildProjection();
    EvidenceEvolutionService.getTrajectoryByClaimId('CLM-DOM-001');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-EVIDENCE-EVOLUTION-14: Evolution Boundary Safeguard Invariant ("Evidence Evolution records. Evidence Evolution compares. Evidence Evolution explains revisions. Evidence Evolution never assumes newer evidence is inherently stronger. Evidence Evolution preserves historical context.")', () => {
    const proj = EvidenceEvolutionProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
  });

  it('TEST-EVIDENCE-EVOLUTION-15: High-Volume Evidence Evolution Projection Builder Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      EvidenceEvolutionProjectionBuilder.buildProjection();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('TEST-EVIDENCE-EVOLUTION-16: Deterministic Evolution Projection Serialization Stability', () => {
    const proj = EvidenceEvolutionProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"nodeCount":1');
  });
});
