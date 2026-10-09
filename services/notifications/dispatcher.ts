/**
 * ─── Alert Notification Dispatcher ───────────────────────────────────────────
 *
 * Governing Document: .planning/PHASE-4B-1-OUTBOUND-NOTIFICATION-DISPATCH.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Coordinates delivery of internal newsroom alerts (M4 source health, M5 P0 signals)
 * to configured external notification transports.
 *
 * Enforces strict failure isolation, incident deduplication across repeated cron runs,
 * single-fire recovery notifications, and rate-limiting anti-fatigue.
 */

import type { RadarSourceAlert } from '@/services/radar/types';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';
import type { RadarSourceHealthMonitor } from '@/services/radar/source-health';
import type {
  AlertCandidate,
  NotificationTransport,
  NotificationDeliveryResult,
  DeliveredIncidentRecord,
  DurableDeliveryStore,
} from './types';
import { WebhookTransport } from './transports/webhook';
import {
  getIncidentKey,
  MemoryDurableDeliveryStore,
  SupabaseDurableDeliveryStore,
} from './durable-store';

export interface AlertDispatcherOptions {
  transports?: NotificationTransport[];
  durableStore?: DurableDeliveryStore;
  defaultLeaseDurationMs?: number;
  defaultMaxAttempts?: number;
}

export class AlertDispatcher {
  private transports: NotificationTransport[];
  private durableStore?: DurableDeliveryStore;
  private defaultLeaseDurationMs: number;
  private defaultMaxAttempts: number;
  private deliveredIncidents: Map<string, DeliveredIncidentRecord> = new Map();
  private inFlightDispatches: Set<string> = new Set();

  constructor(options?: AlertDispatcherOptions) {
    this.transports = options?.transports || [new WebhookTransport()];
    this.defaultLeaseDurationMs = options?.defaultLeaseDurationMs || 300_000; // 5 minutes default lease
    this.defaultMaxAttempts = options?.defaultMaxAttempts || 5; // 5 attempts maximum ceiling

    if (options?.durableStore) {
      this.durableStore = options.durableStore;
    } else if (process.env.DATA_PROVIDER === 'supabase') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey || supabaseUrl === 'https://dummy.supabase.co') {
        throw new Error(
          '[AlertDispatcher] DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for SupabaseDurableDeliveryStore. In-memory fallback is strictly prohibited in Supabase runtime.'
        );
      }
      this.durableStore = new SupabaseDurableDeliveryStore();
    } else {
      this.durableStore = undefined;
    }
  }

  /**
   * Sets or updates the durable delivery store.
   */
  public setDurableStore(store: DurableDeliveryStore): void {
    this.durableStore = store;
  }

  /**
   * Returns the configured durable delivery store.
   */
  public getDurableStore(): DurableDeliveryStore | undefined {
    return this.durableStore;
  }

  /**
   * Registers an additional notification transport adapter.
   */
  public registerTransport(transport: NotificationTransport): void {
    this.transports.push(transport);
  }

  /**
   * Clears internal deduplication registry (used for isolated unit testing).
   */
  public clearRegistry(): void {
    this.deliveredIncidents.clear();
    this.inFlightDispatches.clear();
    if (this.durableStore && this.durableStore instanceof MemoryDurableDeliveryStore) {
      this.durableStore.clear();
    }
  }

  /**
   * Checks if an incident candidate is eligible for outbound dispatch.
   * Prevents alert storms and duplicate deliveries across recurring cron polls.
   */
  public isEligibleForDispatch(candidate: AlertCandidate): { eligible: boolean; reason: string } {
    const incidentKey = candidate.eventType === 'P0_BREAKING_SIGNAL'
      ? `p0:${candidate.alertId}`
      : `${candidate.sourceId || 'src'}:${candidate.failureClass || 'generic'}`;

    const existing = this.deliveredIncidents.get(incidentKey);

    // 1. Recovery Event Handling
    if (candidate.eventType === 'SOURCE_HEALTH_RECOVERY') {
      if (this.durableStore) {
        // Delegate authoritative recovery history to the cross-instance durable store
        return { eligible: true, reason: 'Delegating recovery eligibility to durable store.' };
      }
      if (!existing) {
        return { eligible: false, reason: 'No prior incident recorded; recovery notification suppressed.' };
      }
      if (existing.isResolved) {
        return { eligible: false, reason: 'Recovery notification already dispatched for this incident.' };
      }
      return { eligible: true, reason: 'First recovery notification for active incident.' };
    }

    // 2. Quiet / Non-Failure State Suppression
    if (candidate.currentState === 'healthy') {
      return { eligible: false, reason: 'Source is in healthy state; notification suppressed.' };
    }

    // 3. Duplicate Incident Detection across repeated cron cycles
    if (existing && !existing.isResolved) {
      if (existing.lastIncidentId === candidate.alertId && existing.lastState === candidate.currentState) {
        return {
          eligible: false,
          reason: `Duplicate delivery suppressed. Incident ${candidate.alertId} in state ${candidate.currentState} was already delivered.`,
        };
      }
    }

    return { eligible: true, reason: 'New incident or state transition.' };
  }

  /**
   * Dispatches a single alert candidate across all registered transports with full failure isolation.
   */
  public async dispatchCandidate(candidate: AlertCandidate): Promise<NotificationDeliveryResult[]> {
    const eligibility = this.isEligibleForDispatch(candidate);
    if (!eligibility.eligible) {
      return [
        {
          success: true,
          destination: 'suppressed_by_deduplication',
          error: eligibility.reason,
          durationMs: 0,
          retryCount: 0,
          dryRun: true,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    const incidentKey = getIncidentKey(candidate);

    // Prevent concurrent duplicate in-flight dispatches within this process
    if (this.inFlightDispatches.has(incidentKey)) {
      return [
        {
          success: true,
          destination: 'suppressed_concurrent_inflight',
          error: 'Dispatch already in-flight for incident.',
          durationMs: 0,
          retryCount: 0,
          dryRun: true,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    this.inFlightDispatches.add(incidentKey);
    const results: NotificationDeliveryResult[] = [];

    try {
      for (const transport of this.transports) {
        const destination = transport.destination || transport.name;

        // If durable store is configured, perform cross-instance atomic claim
        let claimId: string | undefined;
        if (this.durableStore) {
          try {
            const claim = await this.durableStore.claimDelivery(
              candidate,
              destination,
              this.defaultLeaseDurationMs,
              this.defaultMaxAttempts
            );
            if (!claim.claimed) {
              results.push({
                success: true,
                destination,
                deliveryId: claim.deliveryId,
                error: `Suppressed by durable store: ${claim.reason}`,
                durationMs: 0,
                retryCount: 0,
                dryRun: true,
                timestamp: new Date().toISOString(),
              });
              continue;
            }
            claimId = claim.deliveryId;
          } catch (durableErr) {
            // Failure isolation: log error and report isolated failure
            console.error('[AlertDispatcher] Durable store claim error:', durableErr);
            results.push({
              success: false,
              destination,
              error: `Durable store claim error: ${durableErr instanceof Error ? durableErr.message : String(durableErr)}`,
              durationMs: 0,
              retryCount: 0,
              dryRun: false,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
        }

        try {
          const res = await transport.dispatch(candidate);
          results.push(res);

          // Update durable store on completion
          if (this.durableStore && claimId) {
            if (res.success) {
              await this.durableStore.completeDelivery(claimId, {
                statusCode: res.statusCode,
                durationMs: res.durationMs,
              });
            } else {
              const isTerminal4xx = !!(res.statusCode && res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429);
              const isSsrf = !!(res.error && res.error.includes('SSRF'));
              const isRetryable = !isTerminal4xx && !isSsrf;
              await this.durableStore.failDelivery(claimId, res.error || 'Transport failed', res.statusCode, isRetryable);
            }
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          // Failure isolation: individual transport failures never crash the dispatcher
          results.push({
            success: false,
            destination: transport.name,
            error: errMsg,
            durationMs: 0,
            retryCount: 0,
            dryRun: false,
            timestamp: new Date().toISOString(),
          });

          if (this.durableStore && claimId) {
            await this.durableStore.failDelivery(claimId, errMsg, undefined, true);
          }
        }
      }

      // Update incident registry if at least one delivery succeeded (or dry-run succeeded)
      const hasDelivered = results.some((r) => r.success);
      if (hasDelivered) {
        const now = new Date().toISOString();
        const existing = this.deliveredIncidents.get(incidentKey);

        if (candidate.eventType === 'SOURCE_HEALTH_RECOVERY') {
          if (existing) {
            existing.isResolved = true;
            existing.lastDeliveredAt = now;
            existing.deliveryCount++;
          }
        } else {
          this.deliveredIncidents.set(incidentKey, {
            incidentKey,
            lastIncidentId: candidate.alertId,
            lastState: candidate.currentState,
            lastSeverity: candidate.severity,
            firstDeliveredAt: existing ? existing.firstDeliveredAt : now,
            lastDeliveredAt: now,
            deliveryCount: (existing?.deliveryCount || 0) + 1,
            isResolved: false,
          });
        }
      }
    } finally {
      this.inFlightDispatches.delete(incidentKey);
    }

    return results;
  }

  /**
   * Converts a RadarSourceAlert into a canonical AlertCandidate.
   */
  public mapSourceAlertToCandidate(alert: RadarSourceAlert): AlertCandidate {
    const isRecovery = Boolean(alert.resolvedAt);
    let eventType: AlertCandidate['eventType'] = 'SOURCE_HEALTH_FAILURE';

    if (isRecovery) {
      eventType = 'SOURCE_HEALTH_RECOVERY';
    } else if (alert.failureClass === 'STALE_SOURCE_SILENCE') {
      eventType = 'SOURCE_HEALTH_STALE';
    }

    return {
      eventType,
      alertId: alert.id,
      sourceId: alert.sourceId,
      sourceName: alert.sourceName,
      severity: alert.severity,
      currentState: alert.currentState,
      failureClass: alert.failureClass,
      detectedAt: alert.detectedAt,
      message: alert.message,
      recommendedAction: alert.recommendedAction,
      metrics: {
        consecutiveFailures: alert.consecutiveFailures,
        consecutiveEmptyRuns: alert.consecutiveEmptyRuns,
        httpStatus: alert.lastHttpStatus,
        observedDelayMinutes: alert.observedDelayMinutes,
      },
    };
  }

  /**
   * Converts a P0 NewsroomSignal into a canonical AlertCandidate.
   */
  public mapSignalToCandidate(signal: NewsroomSignal): AlertCandidate {
    return {
      eventType: 'P0_BREAKING_SIGNAL',
      alertId: signal.id,
      severity: 'critical',
      currentState: signal.lifecycleState,
      detectedAt: signal.firstDetectedAt || signal.lastUpdatedAt || new Date().toISOString(),
      message: `P0 BREAKING SIGNAL: ${signal.title}`,
      recommendedAction: 'Assign desk lead, review corroborating sources, and initiate verification protocol.',
      metrics: {
        confidenceScore: signal.scores?.confidence,
        velocityScore: signal.scores?.velocity,
      },
    };
  }

  /**
   * High-level pipeline hook: Evaluates all source health alerts and P0 signals from a pipeline run.
   * Completely failure-isolated: any internal exception is caught and logged, never failing the caller.
   */
  public async dispatchPipelineAlerts(
    healthMonitor: RadarSourceHealthMonitor,
    signals?: NewsroomSignal[]
  ): Promise<NotificationDeliveryResult[]> {
    const aggregatedResults: NotificationDeliveryResult[] = [];

    try {
      // 1. Process active alerts and resolved alerts from health monitor
      const alerts = healthMonitor.getAlerts(false); // fetch all (active + recently resolved)
      for (const alert of alerts) {
        const candidate = this.mapSourceAlertToCandidate(alert);
        const res = await this.dispatchCandidate(candidate);
        aggregatedResults.push(...res);
      }

      // 2. Process P0 breaking signals if provided
      if (signals && signals.length > 0) {
        const p0Signals = signals.filter((s) => s.priority === 'P0' && s.lifecycleState !== 'resolved');
        for (const sig of p0Signals) {
          const candidate = this.mapSignalToCandidate(sig);
          const res = await this.dispatchCandidate(candidate);
          aggregatedResults.push(...res);
        }
      }
    } catch (err: unknown) {
      // Absolute failure isolation: log error safely without leaking tokens or failing the radar cycle
      console.error('[AlertDispatcher] Isolated pipeline alert dispatch failure:', err instanceof Error ? err.message : String(err));
    }

    return aggregatedResults;
  }
}

/**
 * Factory function to instantiate an AlertDispatcher adhering to the runtime durability policy.
 *
 * Explicit DI:
 * - If options?.durableStore is provided, it is used directly (preserves test isolation).
 *
 * Supabase Runtime:
 * - If DATA_PROVIDER === 'supabase', mandates valid Supabase credentials and instantiates SupabaseDurableDeliveryStore.
 * - Fails closed with an informative error if credentials are missing or invalid (no silent fallback).
 *
 * Local/Test Runtime:
 * - When DATA_PROVIDER !== 'supabase', defaults to MemoryDurableDeliveryStore.
 */
export function createAlertDispatcher(options?: AlertDispatcherOptions): AlertDispatcher {
  return new AlertDispatcher(options);
}

let _globalAlertDispatcher: AlertDispatcher | null = null;

export function getGlobalAlertDispatcher(): AlertDispatcher {
  if (!_globalAlertDispatcher) {
    _globalAlertDispatcher = createAlertDispatcher();
  }
  return _globalAlertDispatcher;
}

export function resetGlobalAlertDispatcher(): void {
  _globalAlertDispatcher = null;
}

/** Global singleton alert dispatcher (lazily initialized to adhere to runtime environment) */
export const globalAlertDispatcher: AlertDispatcher = new Proxy(
  Object.create(AlertDispatcher.prototype),
  {
    get(_target, prop, receiver) {
      const instance = getGlobalAlertDispatcher();
      const val = Reflect.get(instance, prop, receiver);
      if (typeof val === 'function') {
        return val.bind(instance);
      }
      return val;
    },
    set(_target, prop, value, receiver) {
      const instance = getGlobalAlertDispatcher();
      return Reflect.set(instance, prop, value, receiver);
    },
  }
);

