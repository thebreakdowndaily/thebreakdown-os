// ── Telemetry Domain Specification (Phase 17C) ─────────────────────────────────
// Observational metadata types. Immutable interfaces & metric family definitions.

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

export type EventType =
  | 'StoryPublished'
  | 'StoryUpdated'
  | 'SearchExecuted'
  | 'EntityViewed'
  | 'DashboardOpened'
  | 'BuildCompleted'
  | 'APIRequest'
  | 'APIError';

export interface TelemetryEventMetadata {
  durationMs?: number;
  statusCode?: number;
  path?: string;
  query?: string;
  errorMessage?: string;
  entityId?: string;
  entityType?: string;
  actorId?: string;
  [key: string]: unknown;
}

export interface TelemetryEvent {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  schemaVersion: number;
  metadata: TelemetryEventMetadata;
}

// ── Metric Families ───────────────────────────────────────────────────────────
export interface PerformanceMetrics {
  avgApiLatencyMs: number;
  p95ApiLatencyMs: number;
  buildDurationMs: number;
}

export interface EditorialMetrics {
  storiesPublishedCount: number;
  storiesUpdatedCount: number;
  attestationCoverage: number;
}

export interface ReliabilityMetrics {
  totalApiRequests: number;
  totalErrors: number;
  errorRate: number;
}

export interface UsageMetrics {
  totalSearches: number;
  totalEntityViews: number;
  dashboardOpenCount: number;
}

export interface HealthMetrics {
  status: HealthStatus;
  alertLevel: AlertLevel;
  activeAlerts: string[];
  lastActivityTimestamp: string;
}

export interface MetricSnapshot {
  snapshotId: string;
  timestamp: string;
  performance: PerformanceMetrics;
  editorial: EditorialMetrics;
  reliability: ReliabilityMetrics;
  usage: UsageMetrics;
  health: HealthMetrics;
}

export interface TelemetryProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  eventCount: number;
  snapshot: MetricSnapshot;
}
