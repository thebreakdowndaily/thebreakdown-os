// ── Control Plane Health Aggregator (Phase 18A WP4 / Recommendation 3) ─────────

import { SystemHealth, SystemHealthSeverity } from '../../types/control-plane';
import { TelemetryProjection } from '../../types/telemetry';
import { JobProjection } from '../../types/jobs';
import { HealthProvider } from './providers';

export class ControlPlaneHealthAggregator implements HealthProvider {
  public evaluateHealth(
    telemetry: TelemetryProjection,
    jobs: JobProjection,
    currentTime: Date = new Date()
  ): SystemHealth {
    const activeAlerts: string[] = [];
    const timestamp = currentTime.toISOString();

    // Evaluate Telemetry Subsystem Severity
    let telemetrySeverity: SystemHealthSeverity = 'HEALTHY';
    let telemetryError: string | undefined;

    if (!telemetry || !telemetry.snapshot) {
      telemetrySeverity = 'UNKNOWN';
      telemetryError = 'Telemetry projection unavailable';
      activeAlerts.push('Telemetry Subsystem: Projection unavailable');
    } else if (telemetry.snapshot.health.status === 'Critical') {
      telemetrySeverity = 'CRITICAL';
      activeAlerts.push(...telemetry.snapshot.health.activeAlerts);
    } else if (telemetry.snapshot.health.status === 'Warning') {
      telemetrySeverity = 'WARNING';
      activeAlerts.push(...telemetry.snapshot.health.activeAlerts);
    } else if ((telemetry.snapshot.health.status as string) === 'Degraded') {
      telemetrySeverity = 'DEGRADED';
      activeAlerts.push(...telemetry.snapshot.health.activeAlerts);
    }

    // Evaluate Jobs Subsystem Severity
    let jobsSeverity: SystemHealthSeverity = 'HEALTHY';
    let jobsError: string | undefined;

    if (!jobs) {
      jobsSeverity = 'UNKNOWN';
      jobsError = 'Jobs projection unavailable';
      activeAlerts.push('Jobs Subsystem: Projection unavailable');
    } else if (jobs.failedCount > 0) {
      jobsSeverity = jobs.failedCount > 3 ? 'CRITICAL' : 'WARNING';
      jobsError = `${jobs.failedCount} job(s) failed in history`;
      activeAlerts.push(`Automation Queue Alert: ${jobs.failedCount} job(s) failed in history.`);
    }

    // Overall Platform Severity Aggregation
    let overallSeverity: SystemHealthSeverity = 'HEALTHY';
    if (telemetrySeverity === 'CRITICAL' || jobsSeverity === 'CRITICAL') {
      overallSeverity = 'CRITICAL';
    } else if (telemetrySeverity === 'DEGRADED') {
      overallSeverity = 'DEGRADED';
    } else if (telemetrySeverity === 'WARNING' || jobsSeverity === 'WARNING') {
      overallSeverity = 'WARNING';
    } else if (telemetrySeverity === 'UNKNOWN' || jobsSeverity === 'UNKNOWN') {
      overallSeverity = 'UNKNOWN';
    }

    return Object.freeze({
      severity: overallSeverity,
      alertCount: activeAlerts.length,
      activeAlerts: Object.freeze(activeAlerts),
      lastEvaluatedAt: timestamp,
      subsystemStatuses: Object.freeze({
        telemetry: telemetrySeverity,
        jobs: jobsSeverity,
        editorial: 'HEALTHY' as SystemHealthSeverity,
      }),
      subsystemDetails: Object.freeze({
        telemetry: Object.freeze({
          status: telemetrySeverity,
          timestamp,
          latencyMs: telemetry?.snapshot?.performance?.avgApiLatencyMs,
          error: telemetryError,
        }),
        jobs: Object.freeze({
          status: jobsSeverity,
          timestamp,
          latencyMs: jobs?.averageDurationMs,
          error: jobsError,
        }),
        editorial: Object.freeze({
          status: 'HEALTHY' as SystemHealthSeverity,
          timestamp,
        }),
      }),
    });
  }
}
