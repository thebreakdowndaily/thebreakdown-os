/**
 * ─── Radar Source Scheduler & Bounded Backoff Engine ─────────────────────────
 *
 * Governing document: AGENTS.md (Reliability & Source Governance)
 *
 * Evaluates source eligibility, scheduling states, and bounded exponential
 * backoff to prevent hammering degraded endpoints while prioritizing high-value
 * feeds (P0 > P1 > P2 > P3).
 *
 * States:
 *   DISABLED  → source.enabled === false
 *   RUNNING   → active lease held by worker
 *   BACKOFF   → consecutive failures with unexpired backoff window
 *   STALE     → no successful fetch within 24 hours
 *   DUE       → ready for collection based on poll interval or retry window
 *   READY     → operational, awaiting next schedule window
 *   SUCCEEDED → last fetch completed successfully
 *   FAILED    → fetch errored, pending backoff transition
 */

import type {
  RadarSourceDefinition,
  RadarSourceHealth,
  RadarSourceScheduleState,
} from './types';

export const MAX_BACKOFF_MINUTES = 24 * 60; // 24 hours cap
export const BASE_BACKOFF_MINUTES = 5;      // 5 minutes initial backoff
export const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

const PRIORITY_WEIGHTS: Record<string, number> = {
  P0: 100,
  P1: 75,
  P2: 50,
  P3: 25,
};

export class SourceScheduler {
  /**
   * Computes bounded exponential backoff minutes: 5m, 10m, 20m, 40m... max 24h.
   */
  public static computeBackoffMinutes(consecutiveFailures: number): number {
    if (consecutiveFailures <= 0) return 0;
    const minutes = BASE_BACKOFF_MINUTES * Math.pow(2, consecutiveFailures - 1);
    return Math.min(MAX_BACKOFF_MINUTES, Math.round(minutes));
  }

  /**
   * Evaluates the scheduling state and eligibility of a source at a given time.
   */
  public static evaluateSource(
    source: RadarSourceDefinition,
    health?: RadarSourceHealth,
    now: Date = new Date()
  ): {
    state: RadarSourceScheduleState;
    isDue: boolean;
    nextEligiblePollAt: string;
    backoffMinutes: number;
  } {
    if (!source.enabled) {
      return {
        state: 'DISABLED',
        isDue: false,
        nextEligiblePollAt: new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString(),
        backoffMinutes: 0,
      };
    }

    const nowMs = now.getTime();
    const failures = health?.consecutiveFailures || 0;
    const backoffMinutes = this.computeBackoffMinutes(failures);

    // If source has never been polled, it is immediately DUE
    if (!health || !health.lastCheckedAt) {
      return {
        state: 'DUE',
        isDue: true,
        nextEligiblePollAt: now.toISOString(),
        backoffMinutes: 0,
      };
    }

    const lastCheckedMs = new Date(health.lastCheckedAt).getTime();
    const intervalMs = (source.pollIntervalMinutes || 60) * 60 * 1000;

    // Check backoff state for degraded/failing sources
    if (failures > 0) {
      const backoffMs = backoffMinutes * 60 * 1000;
      const nextEligibleMs = lastCheckedMs + backoffMs;

      if (nowMs < nextEligibleMs) {
        return {
          state: 'BACKOFF',
          isDue: false,
          nextEligiblePollAt: new Date(nextEligibleMs).toISOString(),
          backoffMinutes,
        };
      }

      // Backoff expired; ready to retry
      return {
        state: 'DUE',
        isDue: true,
        nextEligiblePollAt: new Date(nextEligibleMs).toISOString(),
        backoffMinutes,
      };
    }

    // Healthy source: check poll interval
    const nextEligibleMs = lastCheckedMs + intervalMs;
    const isDue = nowMs >= nextEligibleMs;

    // Check for stale source
    const lastSuccessMs = health.lastSuccessAt ? new Date(health.lastSuccessAt).getTime() : 0;
    const isStale = lastSuccessMs > 0 && nowMs - lastSuccessMs > STALE_THRESHOLD_MS;

    let state: RadarSourceScheduleState = isDue ? 'DUE' : 'READY';
    if (isStale && !isDue) {
      state = 'STALE';
    }

    return {
      state,
      isDue,
      nextEligiblePollAt: new Date(nextEligibleMs).toISOString(),
      backoffMinutes: 0,
    };
  }

  /**
   * Filters and sorts sources that are DUE, prioritized by P0 > P1 > P2 > P3.
   */
  public static getDueSources(
    sources: RadarSourceDefinition[],
    healthMap: Map<string, RadarSourceHealth>,
    now: Date = new Date()
  ): { dueSources: RadarSourceDefinition[]; evaluatedStates: Map<string, RadarSourceScheduleState> } {
    const evaluatedStates = new Map<string, RadarSourceScheduleState>();
    const dueList: Array<{ source: RadarSourceDefinition; weight: number }> = [];

    for (const source of sources) {
      const health = healthMap.get(source.id);
      const evalResult = this.evaluateSource(source, health, now);
      evaluatedStates.set(source.id, evalResult.state);

      if (evalResult.isDue) {
        const baseWeight = PRIORITY_WEIGHTS[source.priority] || 50;
        // Boost priority if source has been waiting longer
        const waitBonus = health?.lastCheckedAt
          ? Math.min(50, Math.floor((now.getTime() - new Date(health.lastCheckedAt).getTime()) / (60 * 1000)))
          : 50;

        dueList.push({
          source,
          weight: baseWeight + waitBonus,
        });
      }
    }

    // Sort descending by priority weight
    dueList.sort((a, b) => b.weight - a.weight);

    return {
      dueSources: dueList.map((item) => item.source),
      evaluatedStates,
    };
  }
}
