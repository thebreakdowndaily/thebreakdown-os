// ── Control Plane Manager (Phase 18A WP2 / Recommendation 1) ─────────────────

import { OperationsSnapshot, ControlPlaneEvent, ControlPlaneEventType } from '../../types/control-plane';
import { TelemetryProvider, JobsProvider, HealthProvider, ConfigurationProvider, ControlPlaneExtensionRegistry } from './providers';

export interface ControlPlaneManagerOptions {
  telemetryProvider: TelemetryProvider;
  jobsProvider: JobsProvider;
  healthProvider: HealthProvider;
  configurationProvider: ConfigurationProvider;
  clock?: { now(): string };
}

export class ControlPlaneManager {
  private telemetryProvider: TelemetryProvider;
  private jobsProvider: JobsProvider;
  private healthProvider: HealthProvider;
  private configurationProvider: ConfigurationProvider;
  private clock: { now(): string };
  private events: ControlPlaneEvent[] = [];
  private sequenceCounter = 0;

  constructor(options: ControlPlaneManagerOptions) {
    this.telemetryProvider = options.telemetryProvider;
    this.jobsProvider = options.jobsProvider;
    this.healthProvider = options.healthProvider;
    this.configurationProvider = options.configurationProvider;
    this.clock = options.clock || {
      now: () => new Date().toISOString(),
    };
  }

  public emitEvent(type: ControlPlaneEventType, source: string, payload?: Record<string, unknown>): ControlPlaneEvent {
    this.sequenceCounter += 1;
    const event: ControlPlaneEvent = Object.freeze({
      eventId: `cpevt-${Date.now()}-${this.sequenceCounter}`,
      type,
      timestamp: this.clock.now(),
      source,
      payload,
    });
    this.events.push(event);
    return event;
  }

  /**
   * Generates unified OperationsSnapshot with Provider Isolation.
   */
  public generateSnapshot(): OperationsSnapshot {
    const timestamp = this.clock.now();

    // Provider Isolation Guards: Handle partial subsystem availability safely
    let telemetryProj;
    try {
      telemetryProj = this.telemetryProvider.getProjection();
    } catch {
      telemetryProj = {
        eventCount: 0,
        snapshot: {
          reliability: { totalErrors: 0, errorRate: 0 },
          performance: { avgApiLatencyMs: 0 },
          health: { status: 'Warning' as const, activeAlerts: ['Telemetry Provider Unavailable'] },
        },
      } as any;
    }

    let jobsProj;
    try {
      jobsProj = this.jobsProvider.getProjection();
    } catch {
      jobsProj = {
        totalEnqueued: 0,
        pendingCount: 0,
        runningCount: 0,
        completedCount: 0,
        failedCount: 0,
      } as any;
    }

    let config;
    try {
      config = this.configurationProvider.getConfiguration();
    } catch {
      config = {
        maintenanceMode: false,
        featureFlags: {},
        buildVersion: 'v1.0.0-fallback',
        platformVersion: 'AR-13A.0',
        environment: 'production' as const,
        maxConcurrentJobs: 1,
      };
    }

    let health;
    try {
      health = this.healthProvider.evaluateHealth(telemetryProj, jobsProj);
    } catch {
      health = {
        severity: 'DEGRADED' as const,
        alertCount: 1,
        activeAlerts: ['Health Provider Aggregation Failure'],
        lastEvaluatedAt: timestamp,
        subsystemStatuses: { telemetry: 'WARNING' as const, jobs: 'WARNING' as const, editorial: 'HEALTHY' as const },
      };
    }

    const snapshot: OperationsSnapshot = Object.freeze({
      snapshotId: `snap-cp-${Date.now()}`,
      snapshotVersion: 1,
      schemaVersion: 1,
      platformVersion: config.platformVersion || 'AR-13A.0',
      generatedAt: timestamp,
      health,
      configuration: config,
      telemetrySummary: {
        totalEvents: telemetryProj.eventCount || 0,
        errorRate: telemetryProj.snapshot?.reliability?.errorRate || 0,
        avgLatencyMs: telemetryProj.snapshot?.performance?.avgApiLatencyMs || 0,
      },
      jobsSummary: {
        totalEnqueued: jobsProj.totalEnqueued || 0,
        pendingCount: jobsProj.pendingCount || 0,
        runningCount: jobsProj.runningCount || 0,
        completedCount: jobsProj.completedCount || 0,
        failedCount: jobsProj.failedCount || 0,
      },
    });

    // Extension Registry Hook Call
    for (const ext of ControlPlaneExtensionRegistry.listAll()) {
      try {
        ext.onSnapshotGenerated(snapshot);
      } catch {
        // Silently isolate extension errors
      }
    }

    return snapshot;
  }

  public getEvents(): readonly ControlPlaneEvent[] {
    return Object.freeze([...this.events]);
  }
}
