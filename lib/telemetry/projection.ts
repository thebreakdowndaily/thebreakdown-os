// ── Telemetry Projection Builder Layer (Phase 17C WP4/WP5 / Recommendation 4) ───

import { TelemetryEvent, TelemetryProjection, MetricSnapshot } from '../../types/telemetry';
import { TelemetryMetricsEngine } from './metrics';
import { TelemetryHealthEngine, HealthThresholdRules } from './health';

export class TelemetryProjectionBuilder {
  /**
   * Projects raw telemetry events into a unified, immutable TelemetryProjection.
   */
  public static buildProjection(
    events: readonly TelemetryEvent[],
    options?: {
      projectionId?: string;
      platformVersion?: string;
      rules?: HealthThresholdRules;
      currentTime?: Date;
    }
  ): TelemetryProjection {
    const timestamp = options?.currentTime ? options.currentTime.toISOString() : new Date().toISOString();

    const performance = TelemetryMetricsEngine.derivePerformance(events);
    const editorial = TelemetryMetricsEngine.deriveEditorial(events);
    const reliability = TelemetryMetricsEngine.deriveReliability(events);
    const usage = TelemetryMetricsEngine.deriveUsage(events);
    const health = TelemetryHealthEngine.evaluateHealth(events, options?.rules, options?.currentTime);

    const snapshot: MetricSnapshot = Object.freeze({
      snapshotId: `snap-${Date.now()}`,
      timestamp,
      performance: Object.freeze(performance),
      editorial: Object.freeze(editorial),
      reliability: Object.freeze(reliability),
      usage: Object.freeze(usage),
      health: Object.freeze(health),
    });

    return Object.freeze({
      projectionId: options?.projectionId || `proj-telemetry-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'AR-13A.0',
      generatedAt: timestamp,
      eventCount: events.length,
      snapshot,
    });
  }
}
