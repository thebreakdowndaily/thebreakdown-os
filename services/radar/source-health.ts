/**
 * ─── Radar Source Health Monitor ──────────────────────────────────────────────
 *
 * Governing document: AGENTS.md (Operational Observability & Durability)
 *
 * Tracks persistent source reliability, failures, latency, and bounded backoff.
 */

import type { RadarSourceHealth, RadarSourceScheduleState } from './types';
import type { RadarPersistenceRepository } from './persistence/types';
import { SourceScheduler } from './source-scheduler';

export class RadarSourceHealthMonitor {
  private healthMap: Map<string, RadarSourceHealth> = new Map();
  private dirtyIds: Set<string> = new Set();

  constructor(private readonly repository?: RadarPersistenceRepository) {}

  /**
   * Loads persisted health state from repository into memory.
   */
  async load(): Promise<void> {
    if (this.repository) {
      const persisted = await this.repository.loadSourceHealth();
      for (const [k, v] of persisted.entries()) {
        this.healthMap.set(k, v);
      }
    }
  }

  public recordSuccess(sourceId: string, fetchDurationMs: number, pollIntervalMinutes = 60): void {
    const current = this.getHealth(sourceId);
    const now = new Date().toISOString();
    const nextEligible = new Date(Date.now() + pollIntervalMinutes * 60 * 1000).toISOString();

    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status: 'healthy',
      scheduleState: 'SUCCEEDED',
      lastCheckedAt: now,
      lastSuccessAt: now,
      nextEligiblePollAt: nextEligible,
      consecutiveFailures: 0,
      backoffMinutes: 0,
      totalFetches: current.totalFetches + 1,
      averageFetchMs: current.averageFetchMs
        ? current.averageFetchMs * 0.9 + fetchDurationMs * 0.1
        : fetchDurationMs,
      lastHttpStatus: 200,
      lastError: undefined,
    };

    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public recordFailure(sourceId: string, httpStatus?: number, error?: string): void {
    const current = this.getHealth(sourceId);
    const failures = (current.consecutiveFailures || 0) + 1;
    let status = current.status;
    if (failures >= 3) status = 'failing';
    else if (failures >= 1) status = 'degraded';

    const now = new Date();
    const backoffMinutes = SourceScheduler.computeBackoffMinutes(failures);
    const nextEligible = new Date(now.getTime() + backoffMinutes * 60 * 1000).toISOString();

    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status,
      scheduleState: failures >= 2 ? 'BACKOFF' : 'FAILED',
      lastCheckedAt: now.toISOString(),
      lastFailureAt: now.toISOString(),
      nextEligiblePollAt: nextEligible,
      backoffMinutes,
      consecutiveFailures: failures,
      totalFetches: current.totalFetches + 1,
      totalFailures: current.totalFailures + 1,
      lastHttpStatus: httpStatus,
      lastError: error,
    };

    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public recordChange(sourceId: string): void {
    const current = this.getHealth(sourceId);
    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status: 'changed',
      lastChangedAt: new Date().toISOString(),
      totalChanges: current.totalChanges + 1,
    };

    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public markStale(sourceId: string): void {
    const current = this.getHealth(sourceId);
    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status: 'stale',
      scheduleState: 'STALE',
    };
    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public markUnavailable(sourceId: string, reason?: string): void {
    const current = this.getHealth(sourceId);
    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status: 'unavailable',
      scheduleState: 'DISABLED',
      lastError: reason || 'Source marked unavailable by operational probe',
    };
    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public markDisputed(sourceId: string, reason?: string): void {
    const current = this.getHealth(sourceId);
    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status: 'disputed',
      lastError: reason || 'Source reliability or provenance disputed by editorial audit',
    };
    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);
  }

  public setScheduleState(sourceId: string, state: RadarSourceScheduleState): void {
    const current = this.getHealth(sourceId);
    this.healthMap.set(sourceId, {
      ...current,
      scheduleState: state,
    });
    this.dirtyIds.add(sourceId);
  }

  public getHealth(sourceId: string): RadarSourceHealth {
    return (
      this.healthMap.get(sourceId) || {
        sourceId,
        status: 'unknown',
        scheduleState: 'READY',
        consecutiveFailures: 0,
        totalFetches: 0,
        totalFailures: 0,
        totalChanges: 0,
        averageFetchMs: 0,
      }
    );
  }

  public getAllHealth(): RadarSourceHealth[] {
    return Array.from(this.healthMap.values());
  }

  public getHealthMap(): Map<string, RadarSourceHealth> {
    return new Map(this.healthMap);
  }

  public getFailingSources(): RadarSourceHealth[] {
    return this.getAllHealth().filter((h) => h.status === 'failing');
  }

  public getStaleSources(staleThresholdMs: number = 24 * 60 * 60 * 1000): RadarSourceHealth[] {
    const now = Date.now();
    return this.getAllHealth().filter((h) => {
      if (!h.lastSuccessAt) return true;
      return now - new Date(h.lastSuccessAt).getTime() > staleThresholdMs;
    });
  }

  /**
   * Flushes all modified source health records to the repository.
   */
  async flush(): Promise<void> {
    if (this.repository && this.dirtyIds.size > 0) {
      const dirtyList: RadarSourceHealth[] = [];
      for (const id of this.dirtyIds) {
        const h = this.healthMap.get(id);
        if (h) dirtyList.push(h);
      }
      await this.repository.saveAllSourceHealth(dirtyList);
      this.dirtyIds.clear();
    }
  }

  public save(): string {
    const entries = Array.from(this.healthMap.entries());
    return JSON.stringify(entries);
  }

  public restore(stateJson: string): void {
    try {
      const data = JSON.parse(stateJson);
      this.healthMap = new Map(data);
    } catch (e) {
      throw new Error(`Failed to restore health monitor state: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  public clear(): void {
    this.healthMap.clear();
    this.dirtyIds.clear();
  }
}
