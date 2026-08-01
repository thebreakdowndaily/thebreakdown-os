// ── Telemetry Event Runtime Validation (Phase 17C WP2/WP3) ─────────────────────

import { TelemetryEvent, EventType } from '../../../types/telemetry';

const VALID_EVENT_TYPES: Set<EventType> = new Set([
  'StoryPublished',
  'StoryUpdated',
  'SearchExecuted',
  'EntityViewed',
  'DashboardOpened',
  'BuildCompleted',
  'APIRequest',
  'APIError',
]);

export function validateTelemetryEvent(event: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event must be a non-null object.'] };
  }

  const e = event as Partial<TelemetryEvent>;

  if (!e.id || typeof e.id !== 'string' || e.id.trim() === '') {
    errors.push('Event must have a valid non-empty string id.');
  }

  if (!e.type || !VALID_EVENT_TYPES.has(e.type as EventType)) {
    errors.push(`Invalid or missing event type: "${e.type}".`);
  }

  if (!e.timestamp || typeof e.timestamp !== 'string' || isNaN(Date.parse(e.timestamp))) {
    errors.push('Event must have a valid ISO 8601 timestamp.');
  }

  if (!e.source || typeof e.source !== 'string' || e.source.trim() === '') {
    errors.push('Event must specify a valid source.');
  }

  if (typeof e.schemaVersion !== 'number' || e.schemaVersion < 1) {
    errors.push('Event schemaVersion must be a positive integer.');
  }

  if (!e.metadata || typeof e.metadata !== 'object') {
    errors.push('Event metadata must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
