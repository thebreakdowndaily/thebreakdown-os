import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * News Intelligence Baseline 1.2 — Integrity Audit.
 *
 * Verifies that the frozen v1.2 baseline record reconciles exactly against its
 * immutable artifacts (holdout, evaluation, miss diagnostics) and that no
 * artifact has drifted. The baseline is frozen; this test fails if any number
 * changes without a deliberate new baseline version.
 */
describe('NEWS INTELLIGENCE BASELINE 1.2 INTEGRITY AUDIT', () => {
  const baselinePath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-baseline.json');
  const holdoutPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-holdout.json');
  const evaluationPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-evaluation.json');
  const missDiagnosticsPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-miss-diagnostics.json');
  const pipelineDiagnosticsPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-pipeline-diagnostics.json');

  it('INT12-01: Baseline file exists and is frozen', () => {
    expect(fs.existsSync(baselinePath)).toBe(true);
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    expect(baseline.baseline_tag).toBe('news-intelligence-baseline-1.2');
    expect(baseline.status).toBe('FROZEN');
    expect(baseline.verdict).toBe('RECALL RECOVERED');
    expect(new Date(baseline.frozen_at).getTime()).not.toBeNaN();
  });

  it('INT12-02: Baseline artifact files all exist', () => {
    for (const artifact of Object.values(JSON.parse(fs.readFileSync(baselinePath, 'utf8')).artifacts)) {
      if (typeof artifact === 'string' && artifact.endsWith('.json')) {
        expect(fs.existsSync(path.join(process.cwd(), artifact)), `${artifact} must exist`).toBe(true);
      }
    }
  });

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  it('INT12-03: Baseline recall fraction reconciles exactly', () => {
    const { detected, eligible } = baseline.metrics.coverage_recall_fraction;
    expect(eligible).toBe(baseline.holdout_spec.ground_truth_releases);
    const exact = detected / eligible;
    // Rounded to 3 decimals = 42/54 = 0.777…
    expect(Math.abs(exact - baseline.metrics.coverage_recall)).toBeLessThan(0.001);
    expect(detected).toBe(42);
    expect(eligible).toBe(54);
  });

  it('INT12-04: Holdout ground truth reconciles (54 releases, 8 windows, 6 rotation-lost)', () => {
    const holdout = JSON.parse(fs.readFileSync(holdoutPath, 'utf8'));
    expect(holdout.ground_truth_releases.length).toBe(54);
    expect(holdout.windows.length).toBe(8);
    const rotationLost = holdout.ground_truth_releases.filter((r: { in_window: string | null }) => r.in_window === null);
    expect(rotationLost.length).toBe(6);
    expect(baseline.holdout_spec.rotation_lost_releases).toBe(6);
    // All released inside the observation period declared by the evaluation.
    const start = new Date(holdout.observation_period.start).getTime();
    const end = new Date(holdout.observation_period.end).getTime();
    for (const r of holdout.ground_truth_releases) {
      const t = new Date(r.published_at).getTime();
      expect(t >= start && t <= end, `${r.prid} inside observation period`).toBe(true);
    }
  });

  it('INT12-05: Holdout window behaviors match the baseline spec', () => {
    const holdout = JSON.parse(fs.readFileSync(holdoutPath, 'utf8'));
    const behaviors = holdout.windows.map((w: { feed_behavior: string }) => w.feed_behavior);
    expect(behaviors.filter((b: string) => b === 'ok')).toHaveLength(5);
    expect(behaviors.filter((b: string) => b === 'transient_failure')).toHaveLength(1);
    expect(behaviors.filter((b: string) => b === 'persistent_failure')).toHaveLength(1);
    expect(behaviors.filter((b: string) => b === 'rotation')).toHaveLength(1);
    const expectedRotationWindows = holdout.windows.filter((w: { expected_rotation_gap?: boolean }) => w.expected_rotation_gap);
    expect(expectedRotationWindows).toHaveLength(2);
    expect(expectedRotationWindows.map((w: { id: string }) => w.id).sort()).toEqual(['w5', 'w6']);
  });

  it('INT12-06: Evaluation reconciles with baseline metrics and verdict', () => {
    const evaluation = JSON.parse(fs.readFileSync(evaluationPath, 'utf8'));
    const m = evaluation.metrics;
    expect(evaluation.verdict).toBe(baseline.verdict);
    expect(m.ground_truth_releases).toBe(54);
    expect(m.ingested_baseline).toBe(36);
    expect(m.ingested_intervention).toBe(42);
    expect(m.coverage_recall_baseline).toBeCloseTo(36 / 54 * 100, 1);
    expect(m.coverage_recall_intervention).toBeCloseTo(42 / 54 * 100, 1);
    expect(m.coverage_recall_delta_pts).toBeCloseTo(77.8 - 66.7, 1);
    expect(m.silent_losses_baseline).toHaveLength(6);
    expect(m.silent_losses_intervention).toHaveLength(0);
    expect(m.recovered_by_retry).toHaveLength(6);
    expect(m.regressed_events).toHaveLength(0);
    expect(m.false_positive_gaps_baseline).toBe(0);
    expect(m.false_positive_gaps_intervention).toBe(0);
    expect(m.intelligence_recall_baseline).toBe(100);
    expect(m.intelligence_recall_intervention).toBe(100);
  });

  it('INT12-07: Rotation gaps cover exactly the rotation-lost releases', () => {
    const evaluation = JSON.parse(fs.readFileSync(evaluationPath, 'utf8'));
    const coveredByGap = evaluation.intervention.covered_by_gap;
    const rotationGapCovered = Object.entries(coveredByGap as Record<string, number[]>)
      .filter(([id]) => id.startsWith('gap-source-pib-rotation-'))
      .flatMap(([, prids]) => prids)
      .sort((a, b) => a - b);
    // 2100031-33 (same-day rotation) + 2100060-62 (overnight rotation).
    expect(rotationGapCovered).toEqual([2100031, 2100032, 2100033, 2100060, 2100061, 2100062]);
    // Intervention gaps = 2 rotation + 1 fetch-failed; baseline = 2 fetch-failed.
    expect(evaluation.intervention.gaps).toHaveLength(3);
    expect(evaluation.baseline.gaps).toHaveLength(2);
  });

  it('INT12-08: Miss diagnostics reconcile (26 records, 24 SOURCE_NOT_INGESTED + 2 OBSERVABILITY_GAP)', () => {
    const diagnostics = JSON.parse(fs.readFileSync(missDiagnosticsPath, 'utf8'));
    expect(diagnostics.length).toBe(26);
    const categories = new Map<string, number>();
    for (const r of diagnostics) {
      categories.set(r.primary_failure_category, (categories.get(r.primary_failure_category) ?? 0) + 1);
    }
    expect(categories.get('SOURCE_NOT_INGESTED')).toBe(24);
    expect(categories.get('OBSERVABILITY_GAP')).toBe(2);
    // Every record must carry pipeline evidence of entity match + routing.
    for (const r of diagnostics) {
      expect(r.entity_match_status).toBeTruthy();
      expect(r.beat).toBeTruthy();
    }
  });

  it('INT12-09: Pipeline diagnostics prove 26/26 entity match and routing', () => {
    const pipeline = JSON.parse(fs.readFileSync(pipelineDiagnosticsPath, 'utf8'));
    const records = Array.isArray(pipeline) ? pipeline : pipeline.records ?? pipeline.results;
    expect(Array.isArray(records)).toBe(true);
    expect(records).toHaveLength(26);
    const entityMatched = records.filter((r: { entity_recognized?: boolean }) => r.entity_recognized === true).length;
    const routesCorrectly = records.filter((r: { would_route_to_expected_beat?: boolean }) => r.would_route_to_expected_beat === true).length;
    expect(entityMatched).toBe(26);
    expect(routesCorrectly).toBe(26);
  });

  it('INT12-10: Quality-gate numbers match the frozen record', () => {
    // The frozen baseline records the post-intervention gate state; the current
    // gate state must be at least as good (tests may grow, never shrink).
    expect(baseline.quality_gates.tests_passing).toBeGreaterThanOrEqual(682);
    expect(baseline.quality_gates.typescript).toBe('PASS');
    expect(baseline.quality_gates.smoke_newsroom).toBe('PASS');
    expect(baseline.quality_gates.v1_1_integrity.passed).toBe(11);
  });
});
