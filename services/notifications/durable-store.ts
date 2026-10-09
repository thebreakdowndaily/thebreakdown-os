/**
 * ─── Durable Notification Delivery Store ─────────────────────────────────────
 *
 * Governing Document: .planning/PHASE-4B-1A-DURABLE-NOTIFICATION-IDEMPOTENCY.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Provides cross-instance, cross-worker, crash-safe idempotency for outbound
 * operational notifications.
 *
 * Enforces the exact delivery invariant:
 *   same incident + same event + same destination -> exactly one delivery identity
 */

import { randomUUID } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AlertCandidate,
  DurableDeliveryStore,
  DurableDeliveryRecord,
  DurableClaimResult,
  NotificationEventType,
} from './types';

/**
 * Normalizes an incident key from an AlertCandidate.
 */
export function getIncidentKey(candidate: AlertCandidate): string {
  if (candidate.eventType === 'P0_BREAKING_SIGNAL') {
    return `p0:${candidate.alertId}`;
  }
  return `${candidate.sourceId || 'src'}:${candidate.failureClass || 'generic'}`;
}

/**
 * Generates the canonical compound storage key for an incident delivery.
 */
export function getCompoundDeliveryKey(
  incidentKey: string,
  eventType: NotificationEventType,
  destination: string
): string {
  return `${incidentKey}::${eventType}::${destination}`;
}

/**
 * In-memory simulation of the durable delivery store.
 * Emulates atomic database operations, lease expirations, crash timeouts,
 * and concurrency controls. Used for testing and serverless unit testing.
 */
export class MemoryDurableDeliveryStore implements DurableDeliveryStore {
  public readonly kind = 'memory';
  private records: Map<string, DurableDeliveryRecord> = new Map();
  private deliveryIdIndex: Map<string, string> = new Map(); // deliveryId -> compoundKey

  public async claimDelivery(
    candidate: AlertCandidate,
    destination: string,
    leaseDurationMs = 300_000,
    maxAttempts = 5
  ): Promise<DurableClaimResult> {
    const incidentKey = getIncidentKey(candidate);
    const compoundKey = getCompoundDeliveryKey(incidentKey, candidate.eventType, destination);
    const existing = this.records.get(compoundKey);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const expiresAtIso = new Date(nowMs + leaseDurationMs).toISOString();

    // 1. Special rule for RECOVERY events: only deliver if a prior failure was delivered
    if (candidate.eventType === 'SOURCE_HEALTH_RECOVERY') {
      const priorFailureKey = getCompoundDeliveryKey(incidentKey, 'SOURCE_HEALTH_FAILURE', destination);
      const priorStaleKey = getCompoundDeliveryKey(incidentKey, 'SOURCE_HEALTH_STALE', destination);
      const priorFailure = this.records.get(priorFailureKey);
      const priorStale = this.records.get(priorStaleKey);

      const hasDeliveredFailure =
        (priorFailure && priorFailure.status === 'DELIVERED') ||
        (priorStale && priorStale.status === 'DELIVERED');

      if (!hasDeliveredFailure) {
        return {
          claimed: false,
          deliveryId: '',
          reason: 'RECOVERY_NOT_APPLICABLE',
        };
      }
    }

    // 2. Evaluate existing record
    if (existing) {
      // Case A: Already delivered
      if (existing.status === 'DELIVERED') {
        // Recovery is single-fire; once delivered, subsequent recoveries for this incident are suppressed
        if (candidate.eventType === 'SOURCE_HEALTH_RECOVERY') {
          return {
            claimed: false,
            deliveryId: existing.deliveryId,
            reason: 'ALREADY_DELIVERED',
            existingRecord: { ...existing },
          };
        }

        // If same alert instance ID, duplicate delivery suppressed
        if (candidate.alertId === existing.alertId) {
          return {
            claimed: false,
            deliveryId: existing.deliveryId,
            reason: 'ALREADY_DELIVERED',
            existingRecord: { ...existing },
          };
        }

        // Fresh incident cycle after resolution (new alertId)
        const deliveryId = `del-${randomUUID().substring(0, 18)}`;
        this.deliveryIdIndex.delete(existing.deliveryId);
        existing.alertId = candidate.alertId;
        existing.deliveryId = deliveryId;
        existing.status = 'CLAIMED';
        existing.attemptCount = 1;
        existing.claimExpiresAt = expiresAtIso;
        existing.deliveredAt = undefined;
        existing.lastError = undefined;
        existing.updatedAt = nowIso;

        this.deliveryIdIndex.set(deliveryId, compoundKey);
        return {
          claimed: true,
          deliveryId,
          reason: 'NEW_CLAIM',
        };
      }

      // Case B: Currently claimed
      if (existing.status === 'CLAIMED') {
        const leaseExpiryMs = new Date(existing.claimExpiresAt).getTime();
        if (leaseExpiryMs > nowMs) {
          // Lease is still valid and held by another worker
          return {
            claimed: false,
            deliveryId: existing.deliveryId,
            reason: 'CONCURRENT_IN_FLIGHT',
            existingRecord: { ...existing },
          };
        }

        // Lease expired! Worker crashed mid-delivery; reclaim lease
        const deliveryId = `del-${randomUUID().substring(0, 18)}`;
        this.deliveryIdIndex.delete(existing.deliveryId);
        existing.deliveryId = deliveryId;
        existing.status = 'CLAIMED';
        existing.attemptCount += 1;
        existing.claimExpiresAt = expiresAtIso;
        existing.updatedAt = nowIso;

        this.deliveryIdIndex.set(deliveryId, compoundKey);
        return {
          claimed: true,
          deliveryId,
          reason: 'LEASE_RECLAIMED',
        };
      }

      // Case C: Terminal failure for the same alert instance ID
      if (existing.status === 'FAILED') {
        if (candidate.eventType === 'SOURCE_HEALTH_RECOVERY' || candidate.alertId === existing.alertId) {
          return {
            claimed: false,
            deliveryId: existing.deliveryId,
            reason: 'TERMINAL_FAILURE',
            existingRecord: { ...existing },
          };
        }

        // Fresh incident cycle after resolution (new alertId)
        const deliveryId = `del-${randomUUID().substring(0, 18)}`;
        this.deliveryIdIndex.delete(existing.deliveryId);
        existing.alertId = candidate.alertId;
        existing.deliveryId = deliveryId;
        existing.status = 'CLAIMED';
        existing.attemptCount = 1;
        existing.claimExpiresAt = expiresAtIso;
        existing.deliveredAt = undefined;
        existing.lastError = undefined;
        existing.updatedAt = nowIso;

        this.deliveryIdIndex.set(deliveryId, compoundKey);
        return {
          claimed: true,
          deliveryId,
          reason: 'NEW_CLAIM',
        };
      }

      // Case D: Retryable or expired lease - check maximum attempts
      if (existing.attemptCount >= maxAttempts) {
        existing.status = 'FAILED';
        existing.lastError = `Maximum delivery attempts exhausted (${maxAttempts}/${maxAttempts})`;
        existing.updatedAt = nowIso;
        return {
          claimed: false,
          deliveryId: existing.deliveryId,
          reason: 'MAX_ATTEMPTS_EXHAUSTED',
          existingRecord: { ...existing },
        };
      }

      // Case E: Reclaim expired lease or retry RETRYABLE delivery
      const deliveryId = `del-${randomUUID().substring(0, 18)}`;
      this.deliveryIdIndex.delete(existing.deliveryId);
      existing.deliveryId = deliveryId;
      existing.status = 'CLAIMED';
      existing.attemptCount += 1;
      existing.claimExpiresAt = expiresAtIso;
      existing.lastError = undefined;
      existing.updatedAt = nowIso;

      this.deliveryIdIndex.set(deliveryId, compoundKey);
      return {
        claimed: true,
        deliveryId,
        reason: existing.status === 'CLAIMED' ? 'LEASE_RECLAIMED' : 'NEW_CLAIM',
      };
    }

    // 3. Brand new claim
    const deliveryId = `del-${randomUUID().substring(0, 18)}`;
    const record: DurableDeliveryRecord = {
      id: randomUUID(),
      incidentKey,
      alertId: candidate.alertId,
      eventType: candidate.eventType,
      destination,
      deliveryId,
      status: 'CLAIMED',
      attemptCount: 1,
      claimExpiresAt: expiresAtIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.records.set(compoundKey, record);
    this.deliveryIdIndex.set(deliveryId, compoundKey);

    return {
      claimed: true,
      deliveryId,
      reason: 'NEW_CLAIM',
    };
  }

  public async completeDelivery(
    deliveryId: string,
    metadata?: { statusCode?: number; durationMs?: number }
  ): Promise<void> {
    const compoundKey = this.deliveryIdIndex.get(deliveryId);
    if (!compoundKey) return;

    const record = this.records.get(compoundKey);
    if (!record) return;

    record.status = 'DELIVERED';
    record.deliveredAt = new Date().toISOString();
    if (metadata?.statusCode !== undefined) {
      record.lastHttpStatus = metadata.statusCode;
    }
    record.updatedAt = new Date().toISOString();
  }

  public async failDelivery(
    deliveryId: string,
    error: string,
    statusCode?: number,
    retryable = true
  ): Promise<void> {
    const compoundKey = this.deliveryIdIndex.get(deliveryId);
    if (!compoundKey) return;

    const record = this.records.get(compoundKey);
    if (!record) return;

    record.status = retryable ? 'RETRYABLE' : 'FAILED';
    record.lastError = error;
    if (statusCode !== undefined) {
      record.lastHttpStatus = statusCode;
    }
    // Release claim lease immediately if retryable so next worker isn't blocked
    if (retryable) {
      record.claimExpiresAt = new Date(0).toISOString();
    }
    record.updatedAt = new Date().toISOString();
  }

  public async getDeliveryRecord(
    incidentKey: string,
    eventType: NotificationEventType,
    destination: string
  ): Promise<DurableDeliveryRecord | null> {
    const compoundKey = getCompoundDeliveryKey(incidentKey, eventType, destination);
    const rec = this.records.get(compoundKey);
    return rec ? { ...rec } : null;
  }

  /**
   * Resets all internal stores (used for testing).
   */
  public clear(): void {
    this.records.clear();
    this.deliveryIdIndex.clear();
  }
}

/**
 * Supabase implementation of the durable delivery store.
 * Requires table `public.radar_notification_deliveries` (Migration 024).
 * If the migration is not yet applied, methods throw an informative error.
 */
/**
 * Creates a PostgREST-compatible client backed by a PostgreSQL connection or pool.
 * Maps RPCs and table queries directly to PostgreSQL transactions on the target database.
 */
export function createPostgresDurableClient(poolOrClient: { query: (text: string, params?: any[]) => Promise<any> }) {
  return {
    async rpc(funcName: string, params: Record<string, any>) {
      if (funcName === 'radar_claim_notification_delivery') {
        const res = await poolOrClient.query(
          'SELECT public.radar_claim_notification_delivery($1, $2, $3, $4, $5, $6, $7) as result;',
          [
            params.p_incident_key,
            params.p_alert_id,
            params.p_event_type,
            params.p_destination,
            params.p_delivery_id,
            params.p_lease_duration_seconds,
            params.p_max_attempts !== undefined ? params.p_max_attempts : 5,
          ]
        );
        return { data: res.rows[0]?.result, error: null };
      }
      return { data: null, error: new Error(`Unsupported RPC: ${funcName}`) };
    },
    from(tableName: string) {
      if (tableName === 'radar_notification_deliveries') {
        return {
          update(updates: Record<string, any>) {
            return {
              async eq(col: string, val: any) {
                if (col === 'delivery_id') {
                  const setClauses: string[] = [];
                  const values: any[] = [];
                  let idx = 1;
                  for (const [k, v] of Object.entries(updates)) {
                    if (v === undefined) continue;
                    setClauses.push(`${k} = $${idx++}`);
                    values.push(v);
                  }
                  values.push(val);
                  try {
                    await poolOrClient.query(
                      `UPDATE public.radar_notification_deliveries SET ${setClauses.join(', ')} WHERE delivery_id = $${idx};`,
                      values
                    );
                    return { error: null };
                  } catch (err: any) {
                    return { error: err };
                  }
                }
                return { error: new Error(`Unsupported eq column: ${col}`) };
              },
            };
          },
          select(_fields: string) {
            const filters: Array<{ col: string; val: any }> = [];
            const builder = {
              eq(col: string, val: any) {
                filters.push({ col, val });
                return builder;
              },
              async maybeSingle() {
                const whereClauses = filters.map((f, i) => `${f.col} = $${i + 1}`);
                const values = filters.map((f) => f.val);
                const res = await poolOrClient.query(
                  `SELECT * FROM public.radar_notification_deliveries WHERE ${whereClauses.join(' AND ')} LIMIT 1;`,
                  values
                );
                return { data: res.rows[0] || null, error: null };
              },
            };
            return builder;
          },
        };
      }
      return {
        update: () => ({ eq: async () => ({ error: new Error(`Unsupported table: ${tableName}`) }) }),
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error(`Unsupported table: ${tableName}`) }) }) }),
      };
    },
  };
}

export class SupabaseDurableDeliveryStore implements DurableDeliveryStore {
  public readonly kind = 'supabase';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any = null;

  constructor(client?: any) {
    if (client) {
      this.client = client;
      return;
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (url && key && url !== 'https://dummy.supabase.co') {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
    }
  }

  private getClient() {
    if (!this.client) {
      throw new Error(
        'SCHEMA_CHANGE_REQUIRED: Supabase client unavailable. SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing, or migration 024 pending.'
      );
    }
    return this.client;
  }

  public async claimDelivery(
    candidate: AlertCandidate,
    destination: string,
    leaseDurationMs = 300_000,
    maxAttempts = 5
  ): Promise<DurableClaimResult> {
    const supabase = this.getClient();
    const incidentKey = getIncidentKey(candidate);
    const leaseSeconds = Math.max(10, Math.floor(leaseDurationMs / 1000));
    const deliveryId = `del-${randomUUID().substring(0, 18)}`;

    const { data, error } = await supabase.rpc('radar_claim_notification_delivery', {
      p_incident_key: incidentKey,
      p_alert_id: candidate.alertId,
      p_event_type: candidate.eventType,
      p_destination: destination,
      p_delivery_id: deliveryId,
      p_lease_duration_seconds: leaseSeconds,
      p_max_attempts: maxAttempts,
    });

    if (error) {
      // Check if table or RPC does not exist
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        throw new Error(
          `SCHEMA_CHANGE_REQUIRED: RPC 'radar_claim_notification_delivery' is not installed. Apply migration 024.`
        );
      }
      throw new Error(`[SupabaseDurableDeliveryStore] claimDelivery RPC failed: ${error.message}`);
    }

    const result = data as {
      claimed: boolean;
      reason?: DurableClaimResult['reason'];
      delivery_id?: string;
    };

    return {
      claimed: result.claimed,
      deliveryId: result.delivery_id || deliveryId,
      reason: result.reason,
    };
  }

  public async completeDelivery(
    deliveryId: string,
    metadata?: { statusCode?: number; durationMs?: number }
  ): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase
      .from('radar_notification_deliveries')
      .update({
        status: 'DELIVERED',
        delivered_at: new Date().toISOString(),
        last_http_status: metadata?.statusCode,
        updated_at: new Date().toISOString(),
      })
      .eq('delivery_id', deliveryId);

    if (error) {
      console.error('[SupabaseDurableDeliveryStore] completeDelivery failed:', error.message);
    }
  }

  public async failDelivery(
    deliveryId: string,
    errorMsg: string,
    statusCode?: number,
    retryable = true
  ): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase
      .from('radar_notification_deliveries')
      .update({
        status: retryable ? 'RETRYABLE' : 'FAILED',
        last_error: errorMsg,
        last_http_status: statusCode,
        claim_expires_at: retryable ? new Date(0).toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('delivery_id', deliveryId);

    if (error) {
      console.error('[SupabaseDurableDeliveryStore] failDelivery failed:', error.message);
    }
  }

  public async getDeliveryRecord(
    incidentKey: string,
    eventType: NotificationEventType,
    destination: string
  ): Promise<DurableDeliveryRecord | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('radar_notification_deliveries')
      .select('*')
      .eq('incident_key', incidentKey)
      .eq('event_type', eventType)
      .eq('destination', destination)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      incidentKey: data.incident_key,
      alertId: data.alert_id,
      eventType: data.event_type,
      destination: data.destination,
      deliveryId: data.delivery_id,
      status: data.status,
      attemptCount: data.attempt_count,
      claimExpiresAt: data.claim_expires_at,
      deliveredAt: data.delivered_at,
      lastHttpStatus: data.last_http_status,
      lastError: data.last_error,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
