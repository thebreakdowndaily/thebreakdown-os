// ── Declarative Platform Health Engine (Phase 17C WP5 / Recommendation 5) ─────

import { TelemetryEvent, HealthMetrics, HealthStatus, AlertLevel } from '../../types/telemetry';

export interface HealthThresholdRules {
  errorRate: {
    warning: number;
    critical: number;
  };
  p95LatencyMs: {
    warning: number;
    critical: number;
  };
  staleMinutes: {
    warning: number;
    critical: number;
  };
}

export const DEFAULT_HEALTH_THRESHOLDS: HealthThresholdRules = {
  errorRate: {
    warning: 0.05,  // 5% error rate -> Warning
    critical: 0.10, // 10% error rate -> Critical
  },
  p95LatencyMs: {
    warning: 1000,  // 1000ms -> Warning
    critical: 3000, // 3000ms -> Critical
  },
  staleMinutes: {
    warning: 15,    // 15 mins inactive -> Warning
    critical: 60,   // 60 mins inactive -> Critical
  },
};

export class TelemetryHealthEngine {
  /**
   * Computes declarative HealthMetrics based on active telemetry events and threshold rules.
   */
  public static evaluateHealth(
    events: readonly TelemetryEvent[],
    rules: HealthThresholdRules = DEFAULT_HEALTH_THRESHOLDS,
    currentTime: Date = new Date()
  ): HealthMetrics {
    const activeAlerts: string[] = [];
    let status: HealthStatus = 'Healthy';
    let alertLevel: AlertLevel = 'INFO';

    if (events.length === 0) {
      return {
        status: 'Warning',
        alertLevel: 'WARNING',
        activeAlerts: ['No telemetry events recorded in current window.'],
        lastActivityTimestamp: 'N/A',
      };
    }

    // 1. Calculate Error Rate
    let totalCalls = 0;
    let errorCalls = 0;
    let maxLatencyFound = 0;
    let latestTimestampMs = 0;
    let latestTimestampStr = events[0].timestamp;

    for (const e of events) {
      const eventMs = Date.parse(e.timestamp);
      if (eventMs > latestTimestampMs) {
        latestTimestampMs = eventMs;
        latestTimestampStr = e.timestamp;
      }

      if (e.type === 'APIRequest') {
        totalCalls += 1;
        if (typeof e.metadata?.durationMs === 'number' && e.metadata.durationMs > maxLatencyFound) {
          maxLatencyFound = e.metadata.durationMs;
        }
      }
      if (e.type === 'APIError') {
        totalCalls += 1;
        errorCalls += 1;
      }
    }

    const errorRate = totalCalls > 0 ? errorCalls / totalCalls : 0;

    // 2. Evaluate Error Rate Thresholds
    if (errorRate >= rules.errorRate.critical) {
      status = 'Critical';
      alertLevel = 'CRITICAL';
      activeAlerts.push(`Critical Error Rate: ${(errorRate * 100).toFixed(1)}% (Threshold: ${(rules.errorRate.critical * 100)}%)`);
    } else if (errorRate >= rules.errorRate.warning) {
      if ((status as string) !== 'Critical') {
        status = 'Warning';
        alertLevel = 'WARNING';
      }
      activeAlerts.push(`Elevated Error Rate: ${(errorRate * 100).toFixed(1)}% (Threshold: ${(rules.errorRate.warning * 100)}%)`);
    }

    // 3. Evaluate Latency Thresholds
    if (maxLatencyFound >= rules.p95LatencyMs.critical) {
      status = 'Critical';
      alertLevel = 'CRITICAL';
      activeAlerts.push(`Critical Latency: ${maxLatencyFound}ms (Threshold: ${rules.p95LatencyMs.critical}ms)`);
    } else if (maxLatencyFound >= rules.p95LatencyMs.warning) {
      if ((status as string) !== 'Critical') {
        status = 'Warning';
        alertLevel = 'WARNING';
      }
      activeAlerts.push(`High Latency Warning: ${maxLatencyFound}ms (Threshold: ${rules.p95LatencyMs.warning}ms)`);
    }

    // 4. Evaluate Inactivity / Staleness Thresholds
    if (latestTimestampMs > 0) {
      const elapsedMinutes = (currentTime.getTime() - latestTimestampMs) / (1000 * 60);
      if (elapsedMinutes >= rules.staleMinutes.critical) {
        status = 'Critical';
        alertLevel = 'CRITICAL';
        activeAlerts.push(`Stale Telemetry Stream: Inactive for ${Math.round(elapsedMinutes)} minutes.`);
      } else if (elapsedMinutes >= rules.staleMinutes.warning) {
        if ((status as string) !== 'Critical') {
          status = 'Warning';
          alertLevel = 'WARNING';
        }
        activeAlerts.push(`Telemetry Inactivity Warning: ${Math.round(elapsedMinutes)} minutes since last event.`);
      }
    }

    return {
      status,
      alertLevel,
      activeAlerts,
      lastActivityTimestamp: latestTimestampStr,
    };
  }
}
