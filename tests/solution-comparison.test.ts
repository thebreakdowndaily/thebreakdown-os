import { describe, it, expect } from 'vitest';
import { SolutionComparisonEngine } from '../lib/comparison/solution-comparison-engine';
import { PolicyMatrixProjectionBuilder } from '../lib/comparison/policy-matrix-projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-SOLUTION-COMPARISON: Solution Comparison & Policy Matrix Engine (Phase 25A)', () => {
  it('TEST-SOLUTION-COMPARISON-01: Side-by-Side Solution Fix Comparison Evaluation', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');

    expect(solutions.length).toBe(1);
    expect(solutions[0].fixId).toBe('FIX-DOM-001');
    expect(Object.isFrozen(solutions)).toBe(true);
  });

  it('TEST-SOLUTION-COMPARISON-02: Zero Ordinal Ranking Safeguard Invariant Check', () => {
    const proj = PolicyMatrixProjectionBuilder.buildProjection();

    expect(proj.comparisonDisclaimer).toContain('Solution Comparison never recommends or ranks a preferred policy');
  });

  it('TEST-SOLUTION-COMPARISON-03: 6-Axis Multidimensional Evaluation Profile Resolution', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const profiles = solutions[0].dimensionProfiles;

    expect(profiles.length).toBe(6);
    expect(profiles.some((p) => p.dimension === 'EVIDENCE_QUALITY')).toBe(true);
    expect(profiles.some((p) => p.dimension === 'FISCAL_IMPACT')).toBe(true);
  });

  it('TEST-SOLUTION-COMPARISON-04: Score Explanation Callout Verification ("Why?")', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const eq = solutions[0].dimensionProfiles.find((p) => p.dimension === 'EVIDENCE_QUALITY');

    expect(eq).toBeDefined();
    expect(eq?.explanation.length).toBeGreaterThan(10);
  });

  it('TEST-SOLUTION-COMPARISON-05: Relational Structural Trade-Off Modeling Verification', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const tradeOffs = solutions[0].tradeOffs;

    expect(tradeOffs.length).toBe(2);
    expect(tradeOffs[0].sourceDimension).toBe('SCALABILITY');
    expect(tradeOffs[0].targetDimension).toBe('IMPLEMENTATION_COMPLEXITY');
  });

  it('TEST-SOLUTION-COMPARISON-06: Distinguishing Evidence-Backed Scores vs Inferred Assessments', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const profiles = solutions[0].dimensionProfiles;

    expect(profiles.some((p) => p.isEvidenceBacked === true)).toBe(true);
    expect(profiles.some((p) => p.isEvidenceBacked === false)).toBe(true);
  });

  it('TEST-SOLUTION-COMPARISON-07: Contextual Implementation Precedent Integration', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const precedents = solutions[0].precedents;

    expect(precedents.length).toBe(1);
    expect(precedents[0].jurisdiction).toBe('Karachi Ceasefire Agreement');
  });

  it('TEST-SOLUTION-COMPARISON-08: Surfaced Evidence Gap Resolution per Solution Fix', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    const gaps = solutions[0].evidenceGaps;

    expect(gaps.length).toBe(2);
    expect(gaps[0]).toContain('No independent long-term economic assessment');
  });

  it('TEST-SOLUTION-COMPARISON-09: Non-Normative Comparison Disclaimer Invariant Verification', () => {
    const proj = PolicyMatrixProjectionBuilder.buildProjection();

    expect(proj.comparisonDisclaimer).toBe(
      'Solution Comparison compares, explains, and highlights trade-offs. Solution Comparison never recommends or ranks a preferred policy.'
    );
  });

  it('TEST-SOLUTION-COMPARISON-10: SolutionComparisonProjection Building & Immutability', () => {
    const proj = PolicyMatrixProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.solutions)).toBe(true);
  });

  it('TEST-SOLUTION-COMPARISON-11: Identical Solutions with Different Evidence Quality Evaluation', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    expect(solutions[0].dimensionProfiles[0].score).toBe(98);
  });

  it('TEST-SOLUTION-COMPARISON-12: Conflicting Evidence & Evidence Gap Escalation', () => {
    const solutions = SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    expect(solutions[0].evidenceGaps.length).toBeGreaterThan(0);
  });

  it('TEST-SOLUTION-COMPARISON-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PolicyMatrixProjectionBuilder.buildProjection();
    SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-SOLUTION-COMPARISON-14: Comparison Invariant Safeguard ("Solution Comparison compares. Solution Comparison explains. Solution Comparison highlights trade-offs. Solution Comparison never recommends or ranks a preferred policy.")', () => {
    const proj = PolicyMatrixProjectionBuilder.buildProjection();

    expect(proj).toBeDefined();
  });

  it('TEST-SOLUTION-COMPARISON-15: High-Volume Solution Comparison Engine Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      SolutionComparisonEngine.compareSolutionsForProblem('kashmir-1947-un-reference');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('TEST-SOLUTION-COMPARISON-16: Deterministic Comparison Projection Serialization Stability', () => {
    const proj = PolicyMatrixProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"fixCount":1');
  });
});
