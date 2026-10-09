/**
 * ─── Notification & Alert Dispatcher Types ──────────────────────────────────
 *
 * Governing Document: .planning/PHASE-4B-1-OUTBOUND-NOTIFICATION-DISPATCH.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Minimal, canonical event definitions for outbound operational notifications.
 * Strictly prevents leaking internal credentials, secrets, private editorial notes,
 * or full source documents.
 */

export type NotificationEventType =
  | 'SOURCE_HEALTH_FAILURE'
  | 'SOURCE_HEALTH_STALE'
  | 'SOURCE_HEALTH_RECOVERY'
  | 'P0_BREAKING_SIGNAL';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Canonical Alert Candidate payload sent to external notification transports.
 * Minimal, sanitized operational context only.
 */
export interface AlertCandidate {
  /** Canonical notification event classification */
  eventType: NotificationEventType;
  /** Unique alert identity (e.g. M4 alert ID or signal ID) */
  alertId: string;
  /** Originating source identifier (optional for story signals) */
  sourceId?: string;
  /** Human-readable source name */
  sourceName?: string;
  /** Operational severity level */
  severity: NotificationSeverity;
  /** Current operational state (e.g. failing, degraded, stale, healthy, active) */
  currentState: string;
  /** M4 Failure classification (for source health events) */
  failureClass?: string;
  /** ISO 8601 detection timestamp */
  detectedAt: string;
  /** Concise operator message */
  message: string;
  /** Actionable recommendation for desk operators */
  recommendedAction?: string;
  /** Sanitized operational metrics (consecutive failures, latencies, etc.) */
  metrics?: {
    consecutiveFailures?: number;
    consecutiveEmptyRuns?: number;
    httpStatus?: number;
    observedDelayMinutes?: number;
    confidenceScore?: number;
    velocityScore?: number;
  };
}

/**
 * Result returned by a notification transport execution.
 */
export interface NotificationDeliveryResult {
  success: boolean;
  destination: string;
  statusCode?: number;
  deliveryId?: string;
  error?: string;
  durationMs: number;
  retryCount: number;
  dryRun?: boolean;
  timestamp: string;
}

/**
 * Pluggable transport interface for outbound notification delivery.
 */
export interface NotificationTransport {
  readonly name: string;
  readonly destination?: string;
  dispatch(candidate: AlertCandidate): Promise<NotificationDeliveryResult>;
}

/**
 * Configuration options for the generic WebhookTransport.
 */
export interface WebhookTransportConfig {
  /** Destination webhook URL (e.g. from RADAR_ALERT_WEBHOOK_URL) */
  webhookUrl?: string;
  /** HMAC-SHA256 signing secret (e.g. from RADAR_ALERT_WEBHOOK_SECRET) */
  signingSecret?: string;
  /** Master kill-switch: true to allow dispatch, false disables external delivery */
  enabled?: boolean;
  /** Dry-run mode: true records decision without making external HTTP requests */
  dryRun?: boolean;
  /** Maximum retry attempts for transient failures (default: 3) */
  maxRetries?: number;
  /** Initial backoff delay in ms (default: 100ms) */
  initialBackoffMs?: number;
  /** Maximum backoff delay in ms (default: 1000ms) */
  maxBackoffMs?: number;
  /** Request timeout in ms (default: 5000ms) */
  timeoutMs?: number;
  /** Custom fetch implementation for unit testing */
  fetchFn?: typeof fetch;
}

/**
 * Internal delivery tracking record for idempotency and anti-fatigue.
 */
export interface DeliveredIncidentRecord {
  incidentKey: string;
  lastIncidentId: string;
  lastState: string;
  lastSeverity: NotificationSeverity;
  firstDeliveredAt: string;
  lastDeliveredAt: string;
  deliveryCount: number;
  isResolved: boolean;
}

/**
 * Multi-phase delivery lifecycle status for durable idempotency.
 */
export type DurableDeliveryStatus = 'CLAIMED' | 'DELIVERED' | 'FAILED' | 'RETRYABLE';

/**
 * Canonical record stored in durable notification delivery ledger.
 */
export interface DurableDeliveryRecord {
  id: string;
  incidentKey: string;
  alertId: string;
  eventType: NotificationEventType;
  destination: string;
  deliveryId: string;
  status: DurableDeliveryStatus;
  attemptCount: number;
  claimExpiresAt: string;
  deliveredAt?: string;
  lastHttpStatus?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Result of an atomic claim attempt against the durable store.
 */
export interface DurableClaimResult {
  claimed: boolean;
  deliveryId: string;
  reason?:
    | 'NEW_CLAIM'
    | 'LEASE_RECLAIMED'
    | 'ALREADY_DELIVERED'
    | 'CONCURRENT_IN_FLIGHT'
    | 'RECOVERY_NOT_APPLICABLE'
    | 'TERMINAL_FAILURE'
    | 'MAX_ATTEMPTS_EXHAUSTED';
  existingRecord?: DurableDeliveryRecord;
}

/**
 * Interface for durable, cross-instance notification delivery ledger.
 */
export interface DurableDeliveryStore {
  readonly kind: 'memory' | 'supabase';

  /**
   * Atomically claims an alert candidate for outbound delivery to a destination.
   * If already delivered, terminally failed, attempts exhausted, or currently claimed by an active unexpired worker, returns claimed: false.
   */
  claimDelivery(
    candidate: AlertCandidate,
    destination: string,
    leaseDurationMs?: number,
    maxAttempts?: number
  ): Promise<DurableClaimResult>;

  /**
   * Marks a claimed delivery as successfully completed.
   */
  completeDelivery(
    deliveryId: string,
    metadata?: { statusCode?: number; durationMs?: number }
  ): Promise<void>;

  /**
   * Marks a claimed delivery as failed, optionally allowing another worker to retry.
   */
  failDelivery(
    deliveryId: string,
    error: string,
    statusCode?: number,
    retryable?: boolean
  ): Promise<void>;

  /**
   * Retrieves an existing delivery record by compound key.
   */
  getDeliveryRecord(
    incidentKey: string,
    eventType: NotificationEventType,
    destination: string
  ): Promise<DurableDeliveryRecord | null>;
}
