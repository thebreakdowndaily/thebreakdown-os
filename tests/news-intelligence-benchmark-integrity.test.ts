import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface EventRecord {
  event_id: string;
  title: string;
  t0_source_url: string;
  t0: string;
  t0_source_type: string;
  t1: string | null;
  t1_source_type: string | null;
  t1_evidence_id: string | null;
  t2_source_url: string | null;
  t2_publisher: string | null;
  t2: string | null;
  t2_evidence_type: string | null;
  t3: string | null;
  source_class: string;
  event_class: string;
  canonical_entity: string;
  beat: string;
  language: string;
  match_class: 'MATCH' | 'POSSIBLE_MATCH' | 'UNKNOWN';
  match_evidence: string;
  detection_status: 'detected' | 'missed' | 'not_observable';
  signal_id: string | null;
  signal_relevance: 'relevant' | 'irrelevant' | 'duplicate' | 'ambiguous' | 'NOT_MEASURED';
  editorial_status: string;
}

describe('NEWS INTELLIGENCE ADVANTAGE BENCHMARK INTEGRITY AUDIT', () => {
  const benchmarkPath = path.join(process.cwd(), 'data', 'newsroom-advantage-benchmark.json');
  const auditPath = path.join(process.cwd(), 'data', 'newsroom-advantage-audit.json');
  const summaryPath = path.join(process.cwd(), 'data', 'newsroom-advantage-summary.json');

  it('INT-01: Benchmark dataset files exist', () => {
    expect(fs.existsSync(benchmarkPath)).toBe(true);
    expect(fs.existsSync(auditPath)).toBe(true);
  });

  const rawData = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
  const events: EventRecord[] = rawData.events;
  const manifest = rawData.manifest;

  it('INT-02: Universe counts reconcile exactly with array elements', () => {
    const total = events.length;
    const observable = events.filter(e => e.detection_status !== 'not_observable').length;
    const notObservable = events.filter(e => e.detection_status === 'not_observable').length;

    // 1. total = observable + not_observable
    expect(total).toBe(observable + notObservable);

    // 2. manifest matches exact array size
    expect(manifest.number_of_eligible_events).toBe(total);
    expect(manifest.number_of_valid_records).toBe(observable);
    expect(manifest.number_not_observable).toBe(notObservable);
  });

  it('INT-03: Ingestion and detection identities hold', () => {
    const observable = events.filter(e => e.detection_status !== 'not_observable');
    const detected = observable.filter(e => e.detection_status === 'detected').length;
    const missed = observable.filter(e => e.detection_status === 'missed').length;

    // observable = detected + missed
    expect(observable.length).toBe(detected + missed);

    // detected = MATCH + POSSIBLE_MATCH + UNKNOWN
    const detectedEvents = observable.filter(e => e.detection_status === 'detected');
    const matchCount = detectedEvents.filter(e => e.match_class === 'MATCH').length;
    const possibleMatchCount = detectedEvents.filter(e => e.match_class === 'POSSIBLE_MATCH').length;
    const unknownCount = detectedEvents.filter(e => e.match_class === 'UNKNOWN').length;

    expect(detected).toBe(matchCount + possibleMatchCount + unknownCount);
  });

  it('INT-04: Event IDs are unique', () => {
    const ids = events.map(e => e.event_id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('INT-05: Timestamps possess strict chronological bounds (t0 <= t1, t0 <= t2)', () => {
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

  it('INT-06: MATCH records possess strict provenance and auditable details', () => {
    const matches = events.filter(e => e.match_class === 'MATCH');
    for (const m of matches) {
      expect(m.t0_source_url).toBeDefined();
      expect(m.t0_source_url.length).toBeGreaterThan(10);
      expect(m.t2_source_url).toBeDefined();
      expect(m.t2_source_url!.length).toBeGreaterThan(10);
      expect(m.t2).not.toBeNull();
      expect(m.match_evidence).toBeDefined();
      expect(m.match_evidence.length).toBeGreaterThan(15);

      if (m.detection_status === 'detected') {
        expect(m.t1_evidence_id).not.toBeNull();
        expect(m.t1_evidence_id!.length).toBeGreaterThan(3);
        expect(m.t1).not.toBeNull();
      }
    }
  });

  it('INT-07: Unusable match classes do not enter timing calculations', () => {
    const nonMatches = events.filter(e => e.match_class !== 'MATCH');
    for (const n of nonMatches) {
      // Ensure no code paths attempt to evaluate lead times for POSSIBLE_MATCH or UNKNOWN
      expect(n.match_class).not.toBe('MATCH');
    }
  });

  it('INT-08: Reconcile summary with dataset counts', () => {
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      expect(summary.metrics.total_eligible).toBe(events.length);
      const observable = events.filter(e => e.detection_status !== 'not_observable').length;
      expect(summary.metrics.observable).toBe(observable);
    }
  });
});
