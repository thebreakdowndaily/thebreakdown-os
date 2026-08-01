// ── Telemetry Event Builders (Factory Functions) ─────────────────────────────

import { TelemetryEvent, EventType, TelemetryEventMetadata } from '../../../types/telemetry';

export class TelemetryEventBuilder {
  private static sequenceCounter = 0;

  private static generateId(type: string): string {
    this.sequenceCounter += 1;
    return `evt-${type.toLowerCase()}-${Date.now()}-${this.sequenceCounter}`;
  }

  public static createEvent(
    type: EventType,
    source: string,
    metadata: TelemetryEventMetadata = {},
    customTimestamp?: string
  ): TelemetryEvent {
    return {
      id: this.generateId(type),
      type,
      timestamp: customTimestamp || new Date().toISOString(),
      source,
      schemaVersion: 1,
      metadata,
    };
  }

  public static storyPublished(storyId: string, source = 'editorial-service'): TelemetryEvent {
    return this.createEvent('StoryPublished', source, { entityId: storyId, entityType: 'STORY' });
  }

  public static storyUpdated(storyId: string, source = 'editorial-service'): TelemetryEvent {
    return this.createEvent('StoryUpdated', source, { entityId: storyId, entityType: 'STORY' });
  }

  public static searchExecuted(query: string, durationMs: number, source = 'search-engine'): TelemetryEvent {
    return this.createEvent('SearchExecuted', source, { query, durationMs });
  }

  public static entityViewed(entityId: string, entityType: string, source = 'reader-surface'): TelemetryEvent {
    return this.createEvent('EntityViewed', source, { entityId, entityType });
  }

  public static dashboardOpened(dashboardName = 'OperationsDashboard', source = 'ui-client'): TelemetryEvent {
    return this.createEvent('DashboardOpened', source, { path: `/operations/${dashboardName}` });
  }

  public static buildCompleted(durationMs: number, source = 'ci-pipeline'): TelemetryEvent {
    return this.createEvent('BuildCompleted', source, { durationMs });
  }

  public static apiRequest(path: string, durationMs: number, statusCode = 200, source = 'api-gateway'): TelemetryEvent {
    return this.createEvent('APIRequest', source, { path, durationMs, statusCode });
  }

  public static apiError(path: string, errorMessage: string, statusCode = 500, source = 'api-gateway'): TelemetryEvent {
    return this.createEvent('APIError', source, { path, errorMessage, statusCode });
  }
}
