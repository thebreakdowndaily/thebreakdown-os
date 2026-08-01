// ── Declarative Performance Budget Registry (Phase 18D Recommendation 1) ─────

import { PerformanceBudget } from '../../types/performance';

export const DEFAULT_BUDGETS: PerformanceBudget[] = [
  {
    budgetId: 'bgt-api-latency',
    budgetName: 'API Latency P95',
    metricName: 'API Latency P95',
    targetValue: 50,
    warningThreshold: 100,
    criticalThreshold: 300,
    unit: 'ms',
  },
  {
    budgetId: 'bgt-render-latency',
    budgetName: 'Render Latency P95',
    metricName: 'Render Latency P95',
    targetValue: 16,
    warningThreshold: 33,
    criticalThreshold: 100,
    unit: 'ms',
  },
  {
    budgetId: 'bgt-queue-throughput',
    budgetName: 'Queue Throughput',
    metricName: 'Queue Throughput',
    targetValue: 1000,
    warningThreshold: 500,
    criticalThreshold: 100,
    unit: 'req_per_sec',
  },
  {
    budgetId: 'bgt-memory-overhead',
    budgetName: 'Memory Overhead',
    metricName: 'Memory Overhead',
    targetValue: 256,
    warningThreshold: 512,
    criticalThreshold: 1024,
    unit: 'mb',
  },
];

export class PerformanceBudgetRegistry {
  private static budgets = new Map<string, PerformanceBudget>();

  public static initialize(): void {
    if (this.budgets.size === 0) {
      DEFAULT_BUDGETS.forEach((b) => this.budgets.set(b.budgetId, Object.freeze({ ...b })));
    }
  }

  public static getBudgets(): readonly PerformanceBudget[] {
    this.initialize();
    return Object.freeze(Array.from(this.budgets.values()));
  }

  public static clear(): void {
    this.budgets.clear();
  }
}
