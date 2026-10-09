/**
 * ─── Latency-Informed Bounded Adaptive Scheduler ──────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 5: Global Coverage Operating System
 *
 * Dynamically computes optimal polling intervals based on:
 *   - Change frequency
 *   - Unique event yield
 *   - Failure rates & backoff
 *   - Geographic uniqueness
 *
 * Enforces hard bounds: 5 minutes <= recommended_interval <= 1440 minutes (24h).
 */

import type { RadarSourceDefinition, RadarSourceHealth } from '../types';
import type { SourceValueDimensions } from './types';
import type { StoryCluster } from '@/types/newsroom-intelligence';

export const MIN_POLL_INTERVAL_MINUTES = 5;
export const MAX_POLL_INTERVAL_MINUTES = 1440; // 24 hours

export interface ScheduleRecommendation {
  sourceId: string;
  currentIntervalMinutes: number;
  recommendedIntervalMinutes: number;
  adjustmentDirection: 'FASTER' | 'SLOWER' | 'UNCHANGED';
  reason: string;
  metrics: {
    changeRate: number;
    eventYield: number;
    failureRate: number;
    uniqueness: number;
  };
}

export interface EventYieldMetrics {
  sourceId: string;
  lookbackDays: number;
  uniqueClustersOriginated: number;
  totalContributions: number;
  originationRatio: number;
}

export class RadarAdaptiveScheduler {
  /**
   * Computes a recommended polling interval for a source within bounded limits [5, 1440] minutes.
   */
  public computeRecommendation(
    source: RadarSourceDefinition,
    health?: RadarSourceHealth,
    valueDims?: SourceValueDimensions
  ): ScheduleRecommendation {
    const currentInterval = source.pollIntervalMinutes || 30;
    const totalFetches = health?.totalFetches || 1;
    const totalChanges = health?.totalChanges || 0;
    const changeRate = totalFetches > 0 ? totalChanges / totalFetches : 0;
    const failureRate = valueDims?.failureRate ?? (health && health.totalFetches > 0 ? health.totalFailures / health.totalFetches : 0);
    const eventYield = valueDims?.eventYield || 0;
    const uniqueness = valueDims?.coverageUniqueness || 0.5;

    let target = currentInterval;
    const reasons: string[] = [];

    // 1. Health & Failure dampening
    if (failureRate > 0.5 || (health?.consecutiveFailures || 0) >= 3) {
      target = Math.max(target * 2, 60);
      reasons.push(`High failure rate (${Math.round(failureRate * 100)}%) dampens polling`);
    } else if (changeRate > 0.3 && eventYield > 0) {
      // 2. High change rate + proven event yield -> accelerate polling
      target = Math.min(target * 0.5, 15);
      reasons.push(`High change rate (${Math.round(changeRate * 100)}%) and proven event yield (${eventYield}) accelerate polling`);
    } else if (changeRate < 0.05 && totalFetches > 20 && eventYield === 0) {
      // 3. Stagnant source -> relax polling
      target = Math.max(target * 1.5, 120);
      reasons.push(`Low change rate (${Math.round(changeRate * 100)}%) with zero event yield relaxes polling`);
    }

    // 4. Sole sensor protection: never relax sole sensor beyond 60 mins
    if (uniqueness >= 0.9 && target > 60) {
      target = 60;
      reasons.push('Sole sensor for geography/beat capped at 60m maximum interval');
    }

    // 5. Official primary authority boost (only when healthy)
    if (source.officialStatus === 'official_primary' && failureRate <= 0.2 && target > 30) {
      target = Math.min(target, 30);
      reasons.push('Primary official authority capped at 30m');
    }

    // Enforce hard bounds
    const recommended = Math.max(
      MIN_POLL_INTERVAL_MINUTES,
      Math.min(MAX_POLL_INTERVAL_MINUTES, Math.round(target))
    );

    let adjustmentDirection: ScheduleRecommendation['adjustmentDirection'] = 'UNCHANGED';
    if (recommended < currentInterval) adjustmentDirection = 'FASTER';
    else if (recommended > currentInterval) adjustmentDirection = 'SLOWER';

    return {
      sourceId: source.id,
      currentIntervalMinutes: currentInterval,
      recommendedIntervalMinutes: recommended,
      adjustmentDirection,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Current interval is optimal for observed telemetry',
      metrics: {
        changeRate: Math.round(changeRate * 100) / 100,
        eventYield,
        failureRate: Math.round(failureRate * 100) / 100,
        uniqueness: Math.round(uniqueness * 100) / 100,
      },
    };
  }

  /**
   * Evaluates historical event yield for a source across StoryClusters over a lookback window.
   */
  public calculateEventYield(
    clusters: StoryCluster[],
    sourceId: string,
    lookbackDays = 90
  ): EventYieldMetrics {
    const cutoffMs = Date.now() - lookbackDays * 86_400_000;
    const relevantClusters = clusters.filter((c) => {
      const detectedMs = new Date(c.firstDetectedAt).getTime();
      return detectedMs >= cutoffMs;
    });

    let uniqueClustersOriginated = 0;
    let totalContributions = 0;

    for (const cluster of relevantClusters) {
      if (cluster.sourceIds && cluster.sourceIds.includes(sourceId)) {
        totalContributions++;
        if (cluster.sourceIds[0] === sourceId) {
          uniqueClustersOriginated++;
        }
      }
    }

    const originationRatio =
      totalContributions > 0
        ? Math.round((uniqueClustersOriginated / totalContributions) * 100) / 100
        : 0;

    return {
      sourceId,
      lookbackDays,
      uniqueClustersOriginated,
      totalContributions,
      originationRatio,
    };
  }
}
