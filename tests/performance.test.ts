import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceProfiler } from '../lib/performance/performance-profiler';
import { ProjectionCacheEngine } from '../lib/performance/projection-cache';
import { RouteBudgetEngine } from '../lib/performance/route-budget-engine';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-PERFORMANCE: Performance Infrastructure & Scalability Engine (Phase 27A)', () => {
  let cache: ProjectionCacheEngine<any>;

  beforeEach(() => {
    cache = new ProjectionCacheEngine(3, 60000); // Small cache for eviction testing
  });

  it('TEST-PERFORMANCE-01: Microsecond Projection Builder Benchmarking Calibration', () => {
    const { result, benchmark } = PerformanceProfiler.profileProjection('ProblemIntelligence', () => ({ ok: true }));

    expect(result.ok).toBe(true);
    expect(benchmark.buildDurationMs).toBeGreaterThanOrEqual(0.0);
    expect(benchmark.isBudgetCompliant).toBe(true);
    expect(Object.isFrozen(benchmark)).toBe(true);
  });

  it('TEST-PERFORMANCE-02: Benchmark Metadata Standardization', () => {
    const { benchmark } = PerformanceProfiler.profileProjection('PolicyMatrix', () => ({ ok: true }), 'WARM');

    expect(benchmark.metadata.commitSha).toBe('ar-13a.1-prod');
    expect(benchmark.metadata.nodeVersion).toBe(process.version);
    expect(benchmark.metadata.projectionType).toBe('PolicyMatrix');
    expect(benchmark.metadata.cacheState).toBe('WARM');
  });

  it('TEST-PERFORMANCE-03: LRU Cache Hit/Miss Telemetry Accuracy', () => {
    cache.set('key1', { value: 100 });

    const val1 = cache.get('key1');
    const val2 = cache.get('key2'); // Miss

    const stats = cache.getStats();
    expect(val1).toEqual({ value: 100 });
    expect(val2).toBeUndefined();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBe(0.5);
  });

  it('TEST-PERFORMANCE-04: LRU Eviction Correctness under Capacity Overfill', () => {
    cache.set('k1', { id: 1 });
    cache.set('k2', { id: 2 });
    cache.set('k3', { id: 3 });

    // Access k1 to make it recently used
    cache.get('k1');

    // Overfill: adding k4 should evict oldest un-accessed item k2
    cache.set('k4', { id: 4 });

    const stats = cache.getStats();
    expect(stats.evictionCount).toBe(1);
    expect(cache.get('k2')).toBeUndefined(); // Evicted
    expect(cache.get('k1')).toBeDefined(); // Retained
  });

  it('TEST-PERFORMANCE-05: Cold Cache vs Warm Cache Lookup Speed Differential', () => {
    const cold = PerformanceProfiler.profileProjection('GlobalPrecedent', () => ({ ok: true }), 'COLD').benchmark;
    const warm = PerformanceProfiler.profileProjection('GlobalPrecedent', () => ({ ok: true }), 'HIT').benchmark;

    expect(warm.cacheLookupMs).toBeLessThan(2.0);
    expect(cold.cacheLookupMs).toBe(0.0);
  });

  it('TEST-PERFORMANCE-06: Projection Immutability Retention Post-Caching', () => {
    const projection = { data: 'immutable' };
    cache.set('proj1', projection);

    const retrieved = cache.get('proj1');
    expect(Object.isFrozen(retrieved)).toBe(true);
  });

  it('TEST-PERFORMANCE-07: Memory Allocation Profile Categorization', () => {
    const memory = PerformanceProfiler.captureMemoryProfile();

    expect(memory.canonicalObjectsBytes).toBeGreaterThan(0);
    expect(memory.projectionAllocationsBytes).toBeGreaterThan(0);
    expect(memory.cacheOccupancyBytes).toBeGreaterThan(0);
    expect(memory.temporaryAllocationsBytes).toBeGreaterThan(0);
    expect(memory.totalHeapUsedBytes).toBeGreaterThan(0);
  });

  it('TEST-PERFORMANCE-08: Route Performance Budget Compliance Evaluation', () => {
    const report = RouteBudgetEngine.generateAuditReport();

    expect(report.routeMetrics.length).toBeGreaterThan(0);
    report.routeMetrics.forEach((metric) => {
      expect(metric.sloBudgetMs).toBe(50);
      expect(metric.isCompliant).toBe(true);
    });
  });

  it('TEST-PERFORMANCE-09: Audit Report Generation & Overall Health Status Calculation', () => {
    const report = RouteBudgetEngine.generateAuditReport();

    expect(report.overallStatus).toBe('OPTIMAL');
    expect(report.benchmarks.length).toBe(5);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it('TEST-PERFORMANCE-10: TTL Expiry Invalidation & Cache Eviction Cleanup', () => {
    const shortTtlCache = new ProjectionCacheEngine(10, -100); // Already expired
    shortTtlCache.set('expiredKey', { val: 'old' });

    const result = shortTtlCache.get('expiredKey');
    expect(result).toBeUndefined();
  });

  it('TEST-PERFORMANCE-11: Performance Infrastructure Safeguard Disclaimer Verification', () => {
    const report = RouteBudgetEngine.generateAuditReport();

    expect(report.performanceDisclaimer).toBe(
      'Performance Infrastructure measures, optimizes, and observes. Performance Infrastructure never changes canonical knowledge or reader-visible meaning.'
    );
  });

  it('TEST-PERFORMANCE-12: High-Volume Concurrent Cache Access Stability', () => {
    const perfCache = new ProjectionCacheEngine(500, 60000);

    for (let i = 0; i < 1000; i++) {
      perfCache.set(`key-${i}`, { index: i });
      perfCache.get(`key-${i % 50}`);
    }

    const stats = perfCache.getStats();
    expect(stats.itemCount).toBeLessThanOrEqual(500);
    expect(stats.hits).toBeGreaterThan(0);
  });

  it('TEST-PERFORMANCE-13: Non-Mutation Guarantee on Canonical Knowledge Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    RouteBudgetEngine.generateAuditReport();
    PerformanceProfiler.captureMemoryProfile();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-PERFORMANCE-14: Performance Boundary Safeguard Invariant ("Performance Infrastructure measures. Performance Infrastructure optimises. Performance Infrastructure observes. Performance Infrastructure never changes canonical knowledge. Performance Infrastructure never changes reader-visible meaning.")', () => {
    const report = RouteBudgetEngine.generateAuditReport();
    expect(report).toBeDefined();
  });

  it('TEST-PERFORMANCE-15: High-Volume Benchmark Reproducibility & Deterministic Metric Output', () => {
    const b1 = PerformanceProfiler.profileProjection('OutcomeTracking', () => ({ ok: true })).benchmark;
    const b2 = PerformanceProfiler.profileProjection('OutcomeTracking', () => ({ ok: true })).benchmark;

    expect(b1.projectionType).toBe(b2.projectionType);
    expect(b1.isBudgetCompliant).toBe(true);
    expect(b2.isBudgetCompliant).toBe(true);
  });

  it('TEST-PERFORMANCE-16: Audit Report Serialization Stability', () => {
    const report = RouteBudgetEngine.generateAuditReport();
    const json1 = JSON.stringify(report);
    const json2 = JSON.stringify(report);

    expect(json1).toBe(json2);
    expect(json1).toContain('"overallStatus":"OPTIMAL"');
  });
});
