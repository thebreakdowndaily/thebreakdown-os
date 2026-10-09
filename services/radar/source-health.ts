/**
 * ─── Radar Source Health Monitor ──────────────────────────────────────────────
 *
 * Governing document: AGENTS.md (Operational Observability & Durability)
 *
 * Tracks persistent source reliability, failures, latency, and bounded backoff.
 */

import type {
  RadarSourceHealth,
  RadarSourceScheduleState,
  RadarSourceAlert,
  SourceFailureClass,
  RadarSourceDefinition,
} from './types';
import type { RadarPersistenceRepository } from './persistence/types';
import { SourceScheduler, STALE_THRESHOLD_MS } from './source-scheduler';

export class RadarSourceHealthMonitor {
  private healthMap: Map<string, RadarSourceHealth> = new Map();
  private alerts: Map<string, RadarSourceAlert> = new Map();
  private dirtyIds: Set<string> = new Set();

  constructor(private readonly repository?: RadarPersistenceRepository) {}

  /**
   * Classifies root failure class from HTTP status and error string.
   */
  public classifyFailure(httpStatus?: number, error?: string): SourceFailureClass {
    const err = (error || '').toLowerCase();
    if (err.includes('timed out') || err.includes('aborted') || err.includes('timeout')) {
      return 'NETWORK_TIMEOUT';
    }
    if (
      httpStatus === 401 ||
      httpStatus === 403 ||
      err.includes('unauthorized') ||
      err.includes('forbidden') ||
      err.includes('auth')
    ) {
      return 'AUTHENTICATION_FAILURE';
    }
    if (
      err.includes('parse') ||
      err.includes('xml') ||
      err.includes('html') ||
      err.includes('syntax') ||
      err.includes('malformed') ||
      err.includes('invalid')
    ) {
      return 'PARSER_FAILURE';
    }
    if (httpStatus && httpStatus >= 400) {
      return 'HTTP_ERROR';
    }
    if (
      err.includes('enotfound') ||
      err.includes('econnrefused') ||
      err.includes('dns') ||
      err.includes('network') ||
      err.includes('fetch failed')
    ) {
      return 'DNS_NETWORK_ERROR';
    }
    return 'UNKNOWN';
  }

  public getRecommendedAction(failureClass: SourceFailureClass): string {
    switch (failureClass) {
      case 'HTTP_ERROR':
        return 'Inspect remote server response codes, verify URL configuration, or check for upstream server outages.';
      case 'NETWORK_TIMEOUT':
        return 'Verify server responsiveness, network latency, or increase collector timeout threshold if appropriate.';
      case 'DNS_NETWORK_ERROR':
        return 'Verify domain name resolution, upstream host availability, and network egress rules.';
      case 'PARSER_FAILURE':
        return 'Inspect upstream document structure or XML schema changes; adjust collector extraction rules.';
      case 'EMPTY_FEED_ANOMALY':
        return 'Verify target feed contents or page DOM selectors. The remote server returned 200 OK but yielded zero extractable artifacts.';
      case 'STALE_SOURCE_SILENCE':
        return 'Check institutional publishing schedule or verify whether news feed URL or section has moved.';
      case 'AUTHENTICATION_FAILURE':
        return 'Check API keys, request headers, or reverse proxy authorization policies.';
      default:
        return 'Inspect detector execution logs and collector telemetry.';
    }
  }

  private createOrUpdateAlert(params: {
    sourceId: string;
    sourceName?: string;
    failureClass: SourceFailureClass;
    severity: 'info' | 'warning' | 'error' | 'critical';
    currentState: RadarSourceHealth['status'];
    message: string;
    consecutiveFailures: number;
    consecutiveEmptyRuns: number;
    lastHttpStatus?: number;
    expectedCadenceMinutes: number;
    observedDelayMinutes: number;
    lastSuccessAt?: string;
    lastObservationAt?: string;
    lastNewContentAt?: string;
    now?: string;
  }): RadarSourceAlert {
    const idempotencyKey = `${params.sourceId}:${params.failureClass}`;
    const existing = this.alerts.get(idempotencyKey);
    const now = params.now || new Date().toISOString();

    if (existing && !existing.resolvedAt) {
      existing.severity = params.severity;
      existing.currentState = params.currentState;
      existing.consecutiveFailures = params.consecutiveFailures;
      existing.consecutiveEmptyRuns = params.consecutiveEmptyRuns;
      existing.lastHttpStatus = params.lastHttpStatus;
      existing.observedDelayMinutes = params.observedDelayMinutes;
      existing.message = params.message;
      existing.lastSuccessAt = params.lastSuccessAt;
      existing.lastObservationAt = params.lastObservationAt;
      existing.lastNewContentAt = params.lastNewContentAt;
      return existing;
    }

    const newAlert: RadarSourceAlert = {
      id: `alert-${params.sourceId}-${params.failureClass}-${Date.now()}`,
      sourceId: params.sourceId,
      sourceName: params.sourceName,
      severity: params.severity,
      currentState: params.currentState,
      failureClass: params.failureClass,
      lastSuccessAt: params.lastSuccessAt,
      lastObservationAt: params.lastObservationAt,
      lastNewContentAt: params.lastNewContentAt,
      consecutiveFailures: params.consecutiveFailures,
      consecutiveEmptyRuns: params.consecutiveEmptyRuns,
      lastHttpStatus: params.lastHttpStatus,
      expectedCadenceMinutes: params.expectedCadenceMinutes,
      observedDelayMinutes: params.observedDelayMinutes,
      message: params.message,
      recommendedAction: this.getRecommendedAction(params.failureClass),
      detectedAt: now,
      acknowledged: false,
      idempotencyKey,
    };

    this.alerts.set(idempotencyKey, newAlert);
    return newAlert;
  }

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

  public recordSuccess(
    sourceId: string,
    fetchDurationMs: number,
    pollIntervalMinutes = 60,
    artifactCount = 1
  ): void {
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
      lastObservationAt: artifactCount > 0 ? now : current.lastObservationAt,
      nextEligiblePollAt: nextEligible,
      consecutiveFailures: 0,
      consecutiveEmptyRuns: 0,
      silentFailureSuspected: false,
      failureClass: undefined,
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

    // Resolve any active alerts for this source (Recovery confirmation)
    for (const alert of this.alerts.values()) {
      if (alert.sourceId === sourceId && !alert.resolvedAt) {
        alert.resolvedAt = now;
        alert.severity = 'info';
        alert.currentState = 'healthy';
        alert.message = `Resolved: Source recovered operational status with ${artifactCount} artifact(s).`;
      }
    }
  }

  public recordEmptyFetch(
    sourceId: string,
    fetchDurationMs: number,
    pollIntervalMinutes = 60,
    source?: RadarSourceDefinition
  ): RadarSourceAlert | null {
    const current = this.getHealth(sourceId);
    const now = new Date().toISOString();
    const nextEligible = new Date(Date.now() + pollIntervalMinutes * 60 * 1000).toISOString();
    const emptyRuns = (current.consecutiveEmptyRuns || 0) + 1;

    // Threshold derivation:
    // P0 official sources expect content more consistently: threshold 2
    // Standard P1/P2/P3: threshold 3
    const threshold = source?.priority === 'P0' ? 2 : 3;
    const isAnomaly = emptyRuns >= threshold;

    let status = current.status;
    let failureClass: SourceFailureClass | undefined = current.failureClass;

    if (isAnomaly) {
      status = emptyRuns >= 5 ? 'failing' : 'degraded';
      failureClass = 'EMPTY_FEED_ANOMALY';
    } else {
      // Under threshold: treated as healthy + low news volume (quiet period)
      status = 'healthy';
    }

    const updated: RadarSourceHealth = {
      ...current,
      sourceId,
      status,
      scheduleState: isAnomaly ? 'FAILED' : 'SUCCEEDED',
      lastCheckedAt: now,
      lastSuccessAt: now, // HTTP fetch succeeded
      nextEligiblePollAt: nextEligible,
      consecutiveEmptyRuns: emptyRuns,
      silentFailureSuspected: isAnomaly,
      failureClass,
      totalFetches: current.totalFetches + 1,
      averageFetchMs: current.averageFetchMs
        ? current.averageFetchMs * 0.9 + fetchDurationMs * 0.1
        : fetchDurationMs,
      lastHttpStatus: 200,
      lastError: isAnomaly
        ? `Suspected silent failure: ${emptyRuns} consecutive empty fetches (HTTP 200 OK)`
        : undefined,
    };

    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);

    if (isAnomaly) {
      const cadence = source?.pollIntervalMinutes || pollIntervalMinutes;
      const delay = emptyRuns * cadence;
      return this.createOrUpdateAlert({
        sourceId,
        sourceName: source?.name,
        failureClass: 'EMPTY_FEED_ANOMALY',
        severity: emptyRuns >= 5 ? 'error' : 'warning',
        currentState: status,
        message: `Detector extracted 0 artifacts across ${emptyRuns} consecutive successful HTTP fetches (cadence: ${cadence}m).`,
        consecutiveFailures: current.consecutiveFailures || 0,
        consecutiveEmptyRuns: emptyRuns,
        lastHttpStatus: 200,
        expectedCadenceMinutes: cadence,
        observedDelayMinutes: delay,
        lastSuccessAt: now,
        lastObservationAt: current.lastObservationAt,
        lastNewContentAt: current.lastChangedAt,
        now,
      });
    }

    return null;
  }

  public recordFailure(
    sourceId: string,
    httpStatus?: number,
    error?: string,
    explicitClass?: SourceFailureClass,
    source?: RadarSourceDefinition
  ): RadarSourceAlert {
    const current = this.getHealth(sourceId);
    const failures = (current.consecutiveFailures || 0) + 1;
    let status = current.status;
    if (failures >= 3) status = 'failing';
    else if (failures >= 1) status = 'degraded';

    const now = new Date();
    const backoffMinutes = SourceScheduler.computeBackoffMinutes(failures);
    const nextEligible = new Date(now.getTime() + backoffMinutes * 60 * 1000).toISOString();
    const failureClass = explicitClass || this.classifyFailure(httpStatus, error);

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
      failureClass,
    };

    this.healthMap.set(sourceId, updated);
    this.dirtyIds.add(sourceId);

    const cadence = source?.pollIntervalMinutes || 60;
    const delay = failures * cadence + backoffMinutes;

    return this.createOrUpdateAlert({
      sourceId,
      sourceName: source?.name,
      failureClass,
      severity: failures >= 3 ? 'error' : 'warning',
      currentState: status,
      message: error || `Collector fetch failed with HTTP ${httpStatus || 'unknown'}.`,
      consecutiveFailures: failures,
      consecutiveEmptyRuns: current.consecutiveEmptyRuns || 0,
      lastHttpStatus: httpStatus,
      expectedCadenceMinutes: cadence,
      observedDelayMinutes: delay,
      lastSuccessAt: current.lastSuccessAt,
      lastObservationAt: current.lastObservationAt,
      lastNewContentAt: current.lastChangedAt,
      now: now.toISOString(),
    });
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

  /**
   * Evaluates if a source has exceeded its maximum silence window without new observations.
   */
  public evaluateSourceSilence(
    source: RadarSourceDefinition,
    now: Date = new Date()
  ): RadarSourceAlert | null {
    const health = this.getHealth(source.id);
    const nowMs = now.getTime();
    const lastObs = health.lastObservationAt || health.lastSuccessAt;
    const cadence = source.pollIntervalMinutes || 60;

    // Silence window: STALE_THRESHOLD_MS (24h) or 3x poll interval, whichever is greater
    const maxSilenceMs = Math.max(STALE_THRESHOLD_MS, cadence * 3 * 60 * 1000);

    if (lastObs) {
      const elapsedMs = nowMs - new Date(lastObs).getTime();
      if (elapsedMs > maxSilenceMs) {
        const delayMins = Math.floor(elapsedMs / (60 * 1000));
        health.status = 'stale';
        health.scheduleState = 'STALE';
        health.failureClass = 'STALE_SOURCE_SILENCE';
        this.dirtyIds.add(source.id);

        return this.createOrUpdateAlert({
          sourceId: source.id,
          sourceName: source.name,
          failureClass: 'STALE_SOURCE_SILENCE',
          severity: 'warning',
          currentState: 'stale',
          message: `Source has produced zero observations for ${delayMins} minutes (exceeding ${Math.floor(maxSilenceMs / (60 * 1000))}m silence threshold).`,
          consecutiveFailures: health.consecutiveFailures || 0,
          consecutiveEmptyRuns: health.consecutiveEmptyRuns || 0,
          lastHttpStatus: health.lastHttpStatus,
          expectedCadenceMinutes: cadence,
          observedDelayMinutes: delayMins,
          lastSuccessAt: health.lastSuccessAt,
          lastObservationAt: health.lastObservationAt,
          lastNewContentAt: health.lastChangedAt,
          now: now.toISOString(),
        });
      }
    }
    return null;
  }

  public getAlerts(activeOnly = true): RadarSourceAlert[] {
    const list = Array.from(this.alerts.values());
    if (activeOnly) {
      return list.filter((a) => !a.resolvedAt);
    }
    return list;
  }

  public getAlert(alertId: string): RadarSourceAlert | undefined {
    return Array.from(this.alerts.values()).find((a) => a.id === alertId);
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.getAlert(alertId);
    if (!alert || alert.acknowledged) return false;
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = acknowledgedBy;
    return true;
  }

  public clearAlerts(): void {
    this.alerts.clear();
  }

  public clear(): void {
    this.healthMap.clear();
    this.alerts.clear();
    this.dirtyIds.clear();
  }
}
