/**
 * ─── News Radar Domain Types (Phase 2 Operationalization) ─────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 *
 * The News Radar extends the existing newsroom intelligence domain model.
 * It does NOT create a parallel Event entity. The existing StoryCluster
 * represents a real-world event grouping, and NewsroomSignal is the
 * evaluated priority/lifecycle wrapper.
 *
 * Domain model relationship:
 *   RadarSourceDefinition → SourceScheduler → Collector → RawArtifact
 *   → ChangeDetection → NewsroomObservation → StoryCluster → NewsroomSignal
 *   → Alert → Queue → Radar Dashboard
 */

import type { ResearchSourceDefinition } from '@/types/research-intelligence';

// ── 1. Geographic Granularity & Beats ─────────────────────────────────────────

export type RadarBeat =
  | 'government'
  | 'politics'
  | 'courts'
  | 'public_safety'
  | 'infrastructure'
  | 'business'
  | 'environment'
  | 'education';

export type RadarOfficialStatus =
  | 'official_primary'
  | 'official_secondary'
  | 'institutional'
  | 'media'
  | 'social';

export type RadarCollectorType = 'rss' | 'html' | 'json' | 'pdf' | 'browser';

// ── 2. Source Definition ─────────────────────────────────────────────────────

export interface RadarSourceDefinition extends ResearchSourceDefinition {
  /** Geographic hierarchy — references country pack nodes */
  country: string;
  state?: string;
  district?: string;
  city?: string;
  firstOrderAdmin?: string;
  secondOrderAdmin?: string;
  thirdOrderAdmin?: string;
  locality?: string;
  /** Newsroom beat classification */
  beat: RadarBeat;
  /** Source authority classification */
  officialStatus: RadarOfficialStatus;
  /** Polling interval in minutes */
  pollIntervalMinutes: number;
  /** Which collector to use */
  collectorType: RadarCollectorType;
  /** Wire service attribution (e.g. 'wire:pti', 'wire:ani') to prevent duplicate corroboration credit */
  syndicatedFrom?: string;
}

// ── 3. Source Scheduling & States ────────────────────────────────────────────

export type RadarSourceScheduleState =
  | 'READY'
  | 'DUE'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'BACKOFF'
  | 'DISABLED'
  | 'STALE';

export interface RadarSourceSchedule {
  sourceId: string;
  state: RadarSourceScheduleState;
  lastPolledAt?: string;
  nextEligiblePollAt: string;
  pollIntervalMinutes: number;
  consecutiveFailures: number;
  backoffMinutes: number;
  leaseOwner?: string;
  leaseExpiresAt?: string;
}

// ── 4. Raw Artifact (collector output) ───────────────────────────────────────

export interface RawArtifact {
  sourceId: string;
  url: string;
  retrievedAt: string; // ISO 8601 (first seen / system retrieval time)
  publishedAt?: string; // ISO 8601 (source publication time)
  title?: string;
  content: string;
  contentHash: string; // SHA-256 of NFKC-normalized content
  contentLength: number;
  metadata: Record<string, unknown>;
  // Phase 4B-2B Evidence Vault additions:
  rawPayload?: Buffer | Uint8Array | string;
  rawSha256?: string;
  mimeType?: string;
}

// ── 5. Change Detection ──────────────────────────────────────────────────────

export interface ContentFingerprint {
  sourceId: string;
  resourceUrl: string;
  contentHash: string;
  previousHash?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastChangedAt?: string;
  changeCount: number;
}

export type ChangeType = 'new' | 'changed' | 'unchanged';

export interface ChangeDetectionResult {
  artifact: RawArtifact;
  changeType: ChangeType;
  previousHash?: string;
  detectedAt: string;
}

// ── 6. Collector Interface & Security ────────────────────────────────────────

export interface CollectorResult {
  artifacts: RawArtifact[];
  errors: string[];
  fetchDurationMs: number;
  httpStatus?: number;
}

export interface CollectorConfig {
  timeoutMs: number;
  maxResponseBytes: number;
  userAgent: string;
  maxRetries: number;
  allowPrivateIps?: boolean; // Default false (SSRF protection)
}

export const DEFAULT_COLLECTOR_CONFIG: CollectorConfig = {
  timeoutMs: 30_000,
  maxResponseBytes: 5 * 1024 * 1024, // 5MB
  userAgent: 'TheBreakdownRadar/1.0 (+https://thebreakdown.in)',
  maxRetries: 2,
  allowPrivateIps: false,
};

// ── 7. Source Health & Alerting ──────────────────────────────────────────────

export type RadarSourceHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'failing'
  | 'stale'
  | 'changed'
  | 'unavailable'
  | 'disputed'
  | 'unknown';

export type SourceFailureClass =
  | 'HTTP_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'DNS_NETWORK_ERROR'
  | 'PARSER_FAILURE'
  | 'EMPTY_FEED_ANOMALY'
  | 'STALE_SOURCE_SILENCE'
  | 'AUTHENTICATION_FAILURE'
  | 'UNKNOWN';

export interface RadarSourceAlert {
  id: string;                      // Deterministic alert ID
  sourceId: string;                // SOURCE
  sourceName?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  currentState: RadarSourceHealthStatus; // CURRENT STATE
  failureClass: SourceFailureClass;// LIKELY FAILURE CLASS
  lastSuccessAt?: string;          // LAST SUCCESS
  lastObservationAt?: string;      // LAST OBSERVATION
  lastNewContentAt?: string;       // LAST NEW CONTENT
  consecutiveFailures: number;     // CONSECUTIVE FAILURES
  consecutiveEmptyRuns: number;    // CONSECUTIVE EMPTY FETCHES
  lastHttpStatus?: number;         // LAST HTTP STATUS
  expectedCadenceMinutes: number;  // EXPECTED CADENCE
  observedDelayMinutes: number;    // OBSERVED DELAY
  message: string;                 // DIAGNOSTIC SUMMARY
  recommendedAction: string;       // RECOMMENDED HUMAN ACTION
  detectedAt: string;              // ISO timestamp
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  idempotencyKey: string;          // Deduplication key
  resolvedAt?: string;             // ISO timestamp when source recovered
}

export interface RadarSourceHealth {
  sourceId: string;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastChangedAt?: string;
  lastHttpStatus?: number;
  lastError?: string;
  consecutiveFailures: number;
  totalFetches: number;
  totalFailures: number;
  totalChanges: number;
  averageFetchMs: number;
  status: RadarSourceHealthStatus;
  scheduleState?: RadarSourceScheduleState;
  nextEligiblePollAt?: string;
  backoffMinutes?: number;
  // Milestone 4: Silent Feed Monitoring & Source Health Alerting
  consecutiveEmptyRuns?: number;
  lastObservationAt?: string;
  silentFailureSuspected?: boolean;
  failureClass?: SourceFailureClass;
}

// ── 8. Precision Latency Measurement ─────────────────────────────────────────

export interface RadarLatencyRecord {
  clusterId: string;
  sourcePublishedAt?: string; // source publication time (null if unknown)
  firstSeenAt: string;        // system retrieval time
  firstDetectedAt: string;    // event detection time
  firstVerifiedAt?: string;   // editorial verification time
  publishedAt?: string;       // publication time
  detectionLatencyMs?: number;   // firstDetectedAt - sourcePublishedAt
  verificationLatencyMs?: number;// firstVerifiedAt - firstDetectedAt
  publicationLatencyMs?: number; // publishedAt - firstVerifiedAt
  observationLatencyMs?: number; // firstSeenAt - sourcePublishedAt
  detectionProcessingLatencyMs?: number; // firstDetectedAt - firstSeenAt
  endToEndPublicationLatencyMs?: number; // publishedAt - sourcePublishedAt
}

export interface DerivedLatencyMetrics {
  detectionLatencyMs: number | null;          // firstDetectedAt - sourcePublishedAt
  observationLatencyMs: number | null;        // firstSeenAt - sourcePublishedAt
  detectionProcessingLatencyMs: number | null;// firstDetectedAt - firstSeenAt
  verificationLatencyMs: number | null;       // firstVerifiedAt - firstDetectedAt
  editorialToPublicationLatencyMs: number | null; // publishedAt - firstVerifiedAt
  endToEndPublicationLatencyMs: number | null;// publishedAt - sourcePublishedAt
  isValidChronology: boolean;
  chronologyViolations: string[];
}

// ── 9. Pipeline Runs & Operational Metrics ───────────────────────────────────

export interface RadarPipelineRunRecord {
  id: string;
  generatedAt: string;
  cycleDurationMs: number;
  sourcesConsidered: number;
  sourcesPolled: number;
  successful: number;
  failed: number;
  newArtifacts: number;
  changedArtifacts: number;
  unchanged: number;
  eventsOrSignalsCreated: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
  medianDetectionLatencyMs?: number | null;
  p90DetectionLatencyMs?: number | null;
}

export interface RadarPipelineMetrics extends RadarPipelineRunRecord {
  runId: string;
  sourceFailureRate: number;
  duplicateRate: number;
}

// ── 10. Event Type Classification ────────────────────────────────────────────

export type RadarEventType =
  | 'announcement'
  | 'decision'
  | 'appointment'
  | 'resignation'
  | 'arrest'
  | 'court_action'
  | 'policy_change'
  | 'law_change'
  | 'accident'
  | 'disaster'
  | 'protest'
  | 'infrastructure_change'
  | 'service_disruption'
  | 'business_event'
  | 'economic_event'
  | 'education_event'
  | 'environmental_event'
  | 'not_an_event';
