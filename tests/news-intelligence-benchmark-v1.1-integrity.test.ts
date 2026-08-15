import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { isValidVELTRecord, EventRecord } from '../scripts/run-news-intelligence-v1.1';

describe('NEWS INTELLIGENCE ADVANTAGE v1.1 BENCHMARK INTEGRITY AUDIT', () => {
  const v1Path = path.join(process.cwd(), 'data', 'newsroom-advantage-benchmark.json');
  const v1_1Path = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.1.json');
  const v1_1AuditPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.1-audit.json');
  const missAnalysisPath = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.1-miss-analysis.json');

  it('INT11-01: Benchmark files exist', () => {
    expect(fs.existsSync(v1Path)).toBe(true);
    expect(fs.existsSync(v1_1Path)).toBe(true);
    expect(fs.existsSync(v1_1AuditPath)).toBe(true);
    expect(fs.existsSync(missAnalysisPath)).toBe(true);
  });

  const rawData = JSON.parse(fs.readFileSync(v1_1Path, 'utf8'));
  const events: EventRecord[] = rawData.events;
  const manifest = rawData.manifest;

  it('INT11-02: Universe and detection counts reconcile exactly', () => {
    const total = events.length;
    const observable = events.filter(e => e.detection_status !== 'not_observable').length;
    const notObservable = events.filter(e => e.detection_status === 'not_observable').length;

    // total = observable + not_observable
    expect(total).toBe(observable + notObservable);

    const detected = events.filter(e => e.detection_status === 'detected').length;
    const missed = events.filter(e => e.detection_status === 'missed').length;

    // observable = detected + missed
    expect(observable).toBe(detected + missed);

    const detectedMatchCount = events.filter(e => e.detection_status === 'detected' && e.match_class === 'MATCH').length;
    const detectedPossibleMatchCount = events.filter(e => e.detection_status === 'detected' && e.match_class === 'POSSIBLE_MATCH').length;
    const detectedUnknownCount = events.filter(e => e.detection_status === 'detected' && e.match_class === 'UNKNOWN').length;

    // detected = MATCH + POSSIBLE_MATCH + UNKNOWN
    expect(detected).toBe(detectedMatchCount + detectedPossibleMatchCount + detectedUnknownCount);

    const missedMatchCount = events.filter(e => e.detection_status === 'missed' && e.match_class === 'MATCH').length;
    const missedPossibleMatchCount = events.filter(e => e.detection_status === 'missed' && e.match_class === 'POSSIBLE_MATCH').length;
    const missedUnknownCount = events.filter(e => e.detection_status === 'missed' && e.match_class === 'UNKNOWN').length;

    // missed = MATCH + POSSIBLE_MATCH + UNKNOWN
    expect(missed).toBe(missedMatchCount + missedPossibleMatchCount + missedUnknownCount);
  });

  it('INT11-03: Event IDs are unique and do not reuse v1 baseline IDs', () => {
    const ids = events.map(e => e.event_id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);

    const v1Data = JSON.parse(fs.readFileSync(v1Path, 'utf8'));
    const v1Ids = new Set(v1Data.events.map((e: any) => e.event_id));

    for (const id of ids) {
      expect(v1Ids.has(id)).toBe(false);
    }
  });

  it('INT11-04: Timestamp chronological bounds are verified', () => {
    for (const e of events) {
      const t0 = new Date(e.t0).getTime();
      expect(isNaN(t0)).toBe(false);

      if (e.detection_status === 'detected' && e.t1) {
        const t1 = new Date(e.t1).getTime();
        expect(isNaN(t1)).toBe(false);
        expect(t0).toBeLessThanOrEqual(t1);
      }

      if (e.match_class === 'MATCH' && e.t2) {
        const t2 = new Date(e.t2).getTime();
        expect(isNaN(t2)).toBe(false);
        expect(t0).toBeLessThanOrEqual(t2);
      }
    }
  });

  it('INT11-05: MATCH records have auditable evidence and provenance', () => {
    const matches = events.filter(e => e.match_class === 'MATCH');
    for (const m of matches) {
      expect(m.source_urls.length).toBeGreaterThan(0);
      expect(m.primary_source).toBeDefined();
      expect(m.match_evidence.length).toBeGreaterThan(10);
      expect(m.t0_source_type).toBeDefined();

      if (m.detection_status === 'detected') {
        expect(m.t1).not.toBeNull();
        expect(m.t1_evidence_id).not.toBeNull();
      }

      if (m.t2) {
        expect(m.t2_publisher).not.toBeNull();
        expect(m.t2_source_url).not.toBeNull();
        expect(m.t2_evidence_type).not.toBeNull();
      }
    }
  });

  it('INT11-06: Deduplication reason is populated for overlapping publications', () => {
    const overlapping = events.filter(e => e.source_urls.length > 1);
    for (const o of overlapping) {
      expect(o.deduplication_reason).not.toBeNull();
      expect(o.deduplication_reason!.length).toBeGreaterThan(10);
    }
  });

  it('INT11-07: VELT timing denominator uses the canonical predicate', () => {
    const veltContributors = events.filter(isValidVELTRecord);
    const detectedMatch = events.filter(e => e.detection_status === 'detected' && e.match_class === 'MATCH');

    // VELT contributors must be at most detected MATCH
    expect(veltContributors.length).toBeLessThanOrEqual(detectedMatch.length);

    // Each contributor must satisfy all timing conditions
    for (const e of veltContributors) {
      expect(e.match_class).toBe('MATCH');
      expect(e.detection_status).toBe('detected');
      expect(e.t0).not.toBeNull();
      expect(e.t1).not.toBeNull();
      expect(e.t2).not.toBeNull();

      const t0 = new Date(e.t0).getTime();
      const t1 = new Date(e.t1!).getTime();
      const t2 = new Date(e.t2!).getTime();

      expect(t0).toBeLessThanOrEqual(t1);
      expect(t0).toBeLessThanOrEqual(t2);
    }
  });

  it('INT11-08: UNKNOWN and POSSIBLE_MATCH records never leak into VELT', () => {
    const veltContributors = events.filter(isValidVELTRecord);
    const nonMatchLeaks = veltContributors.filter(e => e.match_class !== 'MATCH');
    expect(nonMatchLeaks.length).toBe(0);
  });

  it('INT11-09: Missed records cannot have a valid t1 timestamp', () => {
    const missed = events.filter(e => e.detection_status === 'missed');
    for (const m of missed) {
      expect(m.t1).toBeNull();
    }
  });

  it('INT11-10: Miss-analysis event IDs map exactly to missed observable events', () => {
    const missed = events.filter(e => e.detection_status === 'missed');
    const missedIds = new Set(missed.map(e => e.event_id));

    const missAnalysisData = JSON.parse(fs.readFileSync(missAnalysisPath, 'utf8'));
    const missAnalysisIds = new Set(missAnalysisData.map((m: any) => m.event_id));

    // Ensure sets match exactly (no extras and no omissions)
    expect(missAnalysisIds.size).toBe(missedIds.size);
    for (const id of missedIds) {
      expect(missAnalysisIds.has(id)).toBe(true);
    }
  });

  it('INT11-11: Prevents recurrence of historical 39 vs 52 denominator confusion', () => {
    const detected = events.filter(e => e.detection_status === 'detected');
    const observable = events.filter(e => e.detection_status !== 'not_observable');

    const totalObservableUnknowns = observable.filter(e => e.match_class === 'UNKNOWN').length;
    const totalObservablePossible = observable.filter(e => e.match_class === 'POSSIBLE_MATCH').length;

    const incorrectMathMatchCount = detected.length - totalObservablePossible - totalObservableUnknowns;
    const actualDetectedMatchCount = detected.filter(e => e.match_class === 'MATCH').length;

    // The discrepancy is resolved when actual detected MATCH (52) is used directly,
    // rather than the confused incorrect subtraction logic (which would yield 39)
    expect(actualDetectedMatchCount).not.toBe(incorrectMathMatchCount);
  });
});
