/**
 * ─── Benchmark 100-Event Empirical Evaluation Tests ───────────────────────────
 *
 * Phase 8: Evidence-Grade Scale-Up & Independent Benchmarking
 * Tests the pre-registered N=100 global real-world event corpus.
 */

import { describe, it, expect } from 'vitest';
import { BENCHMARK_100_CORPUS } from '@/data/radar/benchmark-100';
import { EmpiricalBenchmarkEngine } from '../benchmarking/empirical-evaluation';

describe('Benchmark 100: Global Real-World Empirical Corpus', () => {
  const engine = new EmpiricalBenchmarkEngine();

  it('validates exactly 100 pre-registered independent real-world events', () => {
    expect(BENCHMARK_100_CORPUS.length).toBe(100);
    const ids = new Set(BENCHMARK_100_CORPUS.map((e) => e.id));
    expect(ids.size).toBe(100); // 100% unique IDs, no duplicates
  });

  it('evaluates N=100 corpus and satisfies STATISTICALLY_INTERPRETABLE classification', () => {
    const result = engine.evaluateCorpus(BENCHMARK_100_CORPUS, 0);

    expect(result.totalEvents).toBe(100);
    expect(result.detectedCount).toBe(88);
    expect(result.missedCount).toBe(12);
    expect(result.recallRate).toBe(0.88);
    expect(result.sampleInterpretation).toBe('STATISTICALLY_INTERPRETABLE');

    // Wilson 95% Confidence Interval validation
    expect(result.recall95CI.lower).toBeGreaterThanOrEqual(0.80);
    expect(result.recall95CI.upper).toBeLessThanOrEqual(0.95);

    // Multi-country representation
    expect(result.countryRecall.IN.total).toBe(40);
    expect(result.countryRecall.US.total).toBe(25);
    expect(result.countryRecall.GB.total).toBe(20);
    expect(result.countryRecall.DE.total).toBe(15);

    // Latency & lead times
    expect(result.p50DetectionMinutes).toBe(18);
    expect(result.latencies.detectionLatencyMinutes).toBe(18);
    expect(result.latencies.truePublicationLeadMinutes).toBeGreaterThanOrEqual(40);
  });
});
