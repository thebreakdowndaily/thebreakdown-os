// ── Performance Projection Builder (Phase 18D Recommendation 6) ───────────────

import { PerformanceProjection } from '../../types/performance';
import { MultiLayerCacheEngine } from './cache-engine';
import { PerformanceBudgetProfiler } from './budget-profiler';
import { CapacityPlanner } from './capacity-planner';

export class PerformanceProjectionBuilder {
  /**
   * Projects MultiLayerCacheEngine & PerformanceBudgetProfiler states into an immutable PerformanceProjection.
   */
  public static buildProjection(
    cacheEngine?: MultiLayerCacheEngine,
    profiler?: PerformanceBudgetProfiler,
    options?: {
      projectionId?: string;
      platformVersion?: string;
      currentTime?: Date;
    }
  ): PerformanceProjection {
    const timestamp = options?.currentTime || new Date();
    const cache = cacheEngine || new MultiLayerCacheEngine();
    const prof = profiler || new PerformanceBudgetProfiler();

    const budgets = prof.evaluateBudgets();
    const cacheEfficiency = cache.getAllMetrics();
    const percentiles = prof.calculatePercentiles();
    const capacityTrend = CapacityPlanner.deriveCapacityTrend(percentiles);
    const recentSlowOperations = prof.getSlowOperations();

    let overallCompliance: 'COMPLIANT' | 'WARNING' | 'CRITICAL' = 'COMPLIANT';
    if (budgets.some((b) => b.status === 'VIOLATED')) {
      overallCompliance = 'CRITICAL';
    } else if (budgets.some((b) => b.status === 'WARNING')) {
      overallCompliance = 'WARNING';
    }

    return Object.freeze({
      projectionId: options?.projectionId || `proj-perf-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0-ar-13a.1',
      generatedAt: timestamp.toISOString(),
      overallCompliance,
      budgets: Object.freeze([...budgets]),
      cacheEfficiency: Object.freeze([...cacheEfficiency]),
      capacityTrend,
      recentSlowOperations: Object.freeze([...recentSlowOperations.slice(-10)]),
      cacheTiers: Object.freeze([...cacheEfficiency]),
      latencyPercentiles: percentiles,
      slowOperations: Object.freeze([...recentSlowOperations.slice(-10)]),
      budgetResults: Object.freeze([...budgets]),
      capacityTrends: Object.freeze([capacityTrend]),
      overallStatus: overallCompliance === 'COMPLIANT' ? 'OPTIMAL' : 'DEGRADED',
      performanceDisclaimer:
        'Performance Infrastructure measures, optimizes, and observes. Performance Infrastructure never changes canonical knowledge or reader-visible meaning.',
    });
  }
}
