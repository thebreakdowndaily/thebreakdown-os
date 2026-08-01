// ── Operations Control Plane Domain Specification (Phase 18A) ──────────────────
// Observational & Operational Control Plane domain types. Immutable interfaces.

export type SystemHealthSeverity = 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';

export type ControlPlaneEventType =
  | 'TelemetryUpdated'
  | 'JobCompleted'
  | 'ConfigurationChanged'
  | 'HealthUpdated';

export interface ControlPlaneEvent {
  eventId: string;
  type: ControlPlaneEventType;
  timestamp: string;
  source: string;
  payload?: Record<string, unknown>;
}

export interface RuntimeConfiguration {
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  buildVersion: string;
  platformVersion: string;
  environment: 'development' | 'staging' | 'production';
  maxConcurrentJobs: number;
}

export interface SystemHealth {
  severity: SystemHealthSeverity;
  alertCount: number;
  activeAlerts: readonly string[];
  lastEvaluatedAt: string;
  subsystemStatuses: {
    telemetry: SystemHealthSeverity;
    jobs: SystemHealthSeverity;
    editorial: SystemHealthSeverity;
  };
}

export interface OperationsSnapshot {
  snapshotId: string;
  snapshotVersion: number;
  schemaVersion: number;
  platformVersion: string;
  generatedAt: string;
  health: SystemHealth;
  configuration: RuntimeConfiguration;
  telemetrySummary: {
    totalEvents: number;
    errorRate: number;
    avgLatencyMs: number;
  };
  jobsSummary: {
    totalEnqueued: number;
    pendingCount: number;
    runningCount: number;
    completedCount: number;
    failedCount: number;
  };
}

export interface ControlPlaneProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  snapshot: OperationsSnapshot;
  recentControlEvents: readonly ControlPlaneEvent[];
  systemStatusLabel: string;
}
