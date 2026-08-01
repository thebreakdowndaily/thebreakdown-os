// ── Performance Telemetry Exporter (Phase 18D WP5) ───────────────────────────

import { TelemetryCollector } from '../telemetry/collector';
import { TelemetryEventBuilder } from '../telemetry/events/builders';
import { SlowOperationEvent } from '../../types/performance';

export class PerformanceTelemetryExporter {
  public static exportSlowOperation(collector: TelemetryCollector, evt: SlowOperationEvent): void {
    try {
      collector.collect(
        TelemetryEventBuilder.createEvent(
          'APIError',
          'performance-profiler',
          {
            operation: evt.operation || evt.operationName || 'unknown',
            durationMs: evt.durationMs,
            thresholdMs: evt.thresholdMs,
            subsystem: evt.subsystem || 'performance',
          }
        )
      );
    } catch {
      // Non-blocking telemetry exporter failure isolation
    }
  }
}
