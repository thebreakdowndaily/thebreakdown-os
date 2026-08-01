// ── Telemetry Collector Interface & In-Memory Implementation ───────────────────

import { TelemetryEvent } from '../../types/telemetry';
import { validateTelemetryEvent } from './events/validators';

export interface TelemetryCollector {
  collect(event: TelemetryEvent): void;
  events(): readonly TelemetryEvent[];
  clear(): void;
  count(): number;
}

export class MemoryCollector implements TelemetryCollector {
  private store: TelemetryEvent[] = [];
  private seenIds = new Set<string>();

  public collect(event: TelemetryEvent): void {
    const validation = validateTelemetryEvent(event);
    if (!validation.valid) {
      throw new Error(`Telemetry Collector Rejection: ${validation.errors.join('; ')}`);
    }

    if (this.seenIds.has(event.id)) {
      throw new Error(`Telemetry Collector Duplicate ID Rejection: Event ID "${event.id}" has already been processed.`);
    }

    // Freeze event object to guarantee immutability
    const immutableEvent: TelemetryEvent = Object.freeze({
      ...event,
      metadata: Object.freeze({ ...event.metadata }),
    });

    this.store.push(immutableEvent);
    this.seenIds.add(event.id);
  }

  public events(): readonly TelemetryEvent[] {
    return Object.freeze([...this.store]);
  }

  public clear(): void {
    this.store = [];
    this.seenIds.clear();
  }

  public count(): number {
    return this.store.length;
  }
}
