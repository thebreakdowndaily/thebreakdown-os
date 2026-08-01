// ── Telemetry Metric Family Derivation (Phase 17C WP4) ───────────────────────
// Pure functions: 0 side effects, 0 state mutations.

import {
  TelemetryEvent,
  PerformanceMetrics,
  EditorialMetrics,
  ReliabilityMetrics,
  UsageMetrics,
} from '../../types/telemetry';

export class TelemetryMetricsEngine {
  /**
   * Computes Performance Metrics family (API latencies, build durations).
   */
  public static derivePerformance(events: readonly TelemetryEvent[]): PerformanceMetrics {
    const latencies: number[] = [];
    let buildDurationMs = 0;

    for (const e of events) {
      if (e.type === 'APIRequest' && typeof e.metadata?.durationMs === 'number') {
        latencies.push(e.metadata.durationMs);
      }
      if (e.type === 'BuildCompleted' && typeof e.metadata?.durationMs === 'number') {
        buildDurationMs = e.metadata.durationMs;
      }
    }

    if (latencies.length === 0) {
      return { avgApiLatencyMs: 0, p95ApiLatencyMs: 0, buildDurationMs };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = Math.round((sum / sorted.length) * 100) / 100;
    const p95Idx = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Idx] || sorted[sorted.length - 1];

    return {
      avgApiLatencyMs: avg,
      p95ApiLatencyMs: p95,
      buildDurationMs,
    };
  }

  /**
   * Computes Editorial Metrics family.
   */
  public static deriveEditorial(events: readonly TelemetryEvent[]): EditorialMetrics {
    let storiesPublishedCount = 0;
    let storiesUpdatedCount = 0;

    for (const e of events) {
      if (e.type === 'StoryPublished') storiesPublishedCount += 1;
      if (e.type === 'StoryUpdated') storiesUpdatedCount += 1;
    }

    return {
      storiesPublishedCount,
      storiesUpdatedCount,
      attestationCoverage: storiesPublishedCount > 0 ? 1.0 : 0.0,
    };
  }

  /**
   * Computes Reliability Metrics family.
   */
  public static deriveReliability(events: readonly TelemetryEvent[]): ReliabilityMetrics {
    let totalApiRequests = 0;
    let totalErrors = 0;

    for (const e of events) {
      if (e.type === 'APIRequest') totalApiRequests += 1;
      if (e.type === 'APIError') totalErrors += 1;
    }

    const totalCalls = totalApiRequests + totalErrors;
    const errorRate = totalCalls > 0 ? Math.round((totalErrors / totalCalls) * 10000) / 10000 : 0.0;

    return {
      totalApiRequests,
      totalErrors,
      errorRate,
    };
  }

  /**
   * Computes Usage Metrics family.
   */
  public static deriveUsage(events: readonly TelemetryEvent[]): UsageMetrics {
    let totalSearches = 0;
    let totalEntityViews = 0;
    let dashboardOpenCount = 0;

    for (const e of events) {
      if (e.type === 'SearchExecuted') totalSearches += 1;
      if (e.type === 'EntityViewed') totalEntityViews += 1;
      if (e.type === 'DashboardOpened') dashboardOpenCount += 1;
    }

    return {
      totalSearches,
      totalEntityViews,
      dashboardOpenCount,
    };
  }
}
