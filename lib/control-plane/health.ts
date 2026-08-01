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

    // Evaluate Telemetry Subsystem Severity
    let telemetrySeverity: SystemHealthSeverity = 'HEALTHY';
    if (telemetry.snapshot.health.status === 'Critical') {
      telemetrySeverity = 'CRITICAL';
      activeAlerts.push(...telemetry.snapshot.health.activeAlerts);
    } else if (telemetry.snapshot.health.status === 'Warning') {
      telemetrySeverity = 'WARNING';
      activeAlerts.push(...telemetry.snapshot.health.activeAlerts);
    }

    // Evaluate Jobs Subsystem Severity
    let jobsSeverity: SystemHealthSeverity = 'HEALTHY';
    if (jobs.failedCount > 0) {
      jobsSeverity = jobs.failedCount > 3 ? 'CRITICAL' : 'WARNING';
      activeAlerts.push(`Automation Queue Alert: ${jobs.failedCount} job(s) failed in history.`);
    }

    // Overall Platform Severity Aggregation
    let overallSeverity: SystemHealthSeverity = 'HEALTHY';
    if (telemetrySeverity === 'CRITICAL' || jobsSeverity === 'CRITICAL') {
      overallSeverity = 'CRITICAL';
    } else if (telemetrySeverity === 'WARNING' || jobsSeverity === 'WARNING') {
      overallSeverity = 'WARNING';
    }

    return Object.freeze({
      severity: overallSeverity,
      alertCount: activeAlerts.length,
      activeAlerts: Object.freeze(activeAlerts),
      lastEvaluatedAt: currentTime.toISOString(),
      subsystemStatuses: Object.freeze({
        telemetry: telemetrySeverity,
        jobs: jobsSeverity,
        editorial: 'HEALTHY' as SystemHealthSeverity,
      }),
    });
  }
}
