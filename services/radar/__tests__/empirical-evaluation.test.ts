import { describe, it, expect } from 'vitest';
import { EmpiricalBenchmarkEngine } from '../benchmarking/empirical-evaluation';
import { REAL_WORLD_EVENT_CORPUS } from '@/data/radar/real-world-events';

describe('EmpiricalBenchmarkEngine', () => {
  const engine = new EmpiricalBenchmarkEngine();

  it('measures real-world recall, Wilson 95% CI, detection latency, and true publication lead times', () => {
    const result = engine.evaluateCorpus(REAL_WORLD_EVENT_CORPUS, 1);

    expect(result.totalEvents).toBe(11);
    expect(result.detectedCount).toBe(9);
    expect(result.missedCount).toBe(2);
    expect(result.verifiedCount).toBe(9);
    expect(result.publishedCount).toBe(9);

    // Recall = 9 / 11 ~ 0.82
    expect(result.recallRate).toBe(0.82);
    expect(result.falseNegativeRate).toBe(0.18);
    // False positive rate = 1 / (9 + 1) = 0.10
    expect(result.falsePositiveRate).toBe(0.1);

    // Statistical uncertainty & sample interpretation
    expect(result.sampleInterpretation).toBe('DESCRIPTIVE_PILOT_ONLY');
    expect(result.recall95CI.lower).toBeGreaterThan(0.4);
    expect(result.recall95CI.upper).toBeLessThanOrEqual(1.0);
    expect(result.recall95CI.confidenceLevel).toBe(0.95);

    // Latency percentiles should be defined
    expect(result.p50DetectionMinutes).toBeDefined();
    expect(result.p90DetectionMinutes).toBeDefined();
    expect(result.p50DetectionMinutes).toBeGreaterThanOrEqual(10);
    expect(result.p50DetectionMinutes).toBeLessThanOrEqual(30);

    // Latencies
    expect(result.latencies.detectionLatencyMinutes).toBeDefined();
    expect(result.latencies.verificationLatencyMinutes).toBeDefined();
    expect(result.latencies.publicationLatencyMinutes).toBeDefined();
    // True publication lead over external control
    expect(result.latencies.truePublicationLeadMinutes).toBeDefined();
    expect(result.latencies.truePublicationLeadMinutes).toBeGreaterThan(0);

    // Country attribution breakdown
    expect(result.countryRecall.IN.detected).toBe(3);
    expect(result.countryRecall.US.detected).toBe(2);
    expect(result.countryRecall.GB.detected).toBe(2);
    expect(result.countryRecall.DE.detected).toBe(2);

    // Missed taxonomy breakdown
    expect(result.missedTaxonomyBreakdown.NO_SOURCE).toBe(1);
    expect(result.missedTaxonomyBreakdown.GEO_RESOLUTION_FAILURE).toBe(1);
  });

  it('runs deterministic integrity audit and confirms zero metric divergence', () => {
    const result = engine.evaluateCorpus(REAL_WORLD_EVENT_CORPUS, 1);
    const audit = engine.auditIntegrity(result, REAL_WORLD_EVENT_CORPUS, 1);

    expect(audit).toHaveLength(10);
    expect(audit.every((c) => c.match)).toBe(true);
  });
});
