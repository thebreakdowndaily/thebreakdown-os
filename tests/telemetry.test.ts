import { describe, it, expect } from 'vitest';
import { MemoryCollector } from '../lib/telemetry/collector';
import { TelemetryEventBuilder } from '../lib/telemetry/events/builders';
import { validateTelemetryEvent } from '../lib/telemetry/events/validators';
import { TelemetryMetricsEngine } from '../lib/telemetry/metrics';
import { TelemetryHealthEngine } from '../lib/telemetry/health';
import { TelemetryProjectionBuilder } from '../lib/telemetry/projection';
import { TelemetrySerializer } from '../lib/telemetry/serializer';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-TELEMETRY: Telemetry & Monitoring Foundation (Phase 17C)', () => {
  it('TEST-TELEMETRY-01: Event Validation Rules', () => {
    const validEvent = TelemetryEventBuilder.storyPublished('ch-01');
    const validResult = validateTelemetryEvent(validEvent);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    const invalidResult = validateTelemetryEvent({ id: '', type: 'InvalidType' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('TEST-TELEMETRY-02: Event Creation via Builders', () => {
    const evt = TelemetryEventBuilder.searchExecuted('Strategic Autonomy', 45);
    expect(evt.type).toBe('SearchExecuted');
    expect(evt.source).toBe('search-engine');
    expect(evt.metadata.query).toBe('Strategic Autonomy');
    expect(evt.metadata.durationMs).toBe(45);
  });

  it('TEST-TELEMETRY-03: Metric Family Aggregation', () => {
    const collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.apiRequest('/api/v1/fixes', 50, 200));
    collector.collect(TelemetryEventBuilder.apiRequest('/api/v1/fixes', 150, 200));
    collector.collect(TelemetryEventBuilder.apiError('/api/v1/fixes', 'Internal Error', 500));
    collector.collect(TelemetryEventBuilder.storyPublished('ch-01'));
    collector.collect(TelemetryEventBuilder.searchExecuted('Nehru', 20));

    const events = collector.events();
    const perf = TelemetryMetricsEngine.derivePerformance(events);
    expect(perf.avgApiLatencyMs).toBe(100);

    const rel = TelemetryMetricsEngine.deriveReliability(events);
    expect(rel.totalApiRequests).toBe(2);
    expect(rel.totalErrors).toBe(1);
    expect(rel.errorRate).toBe(0.3333);

    const ed = TelemetryMetricsEngine.deriveEditorial(events);
    expect(ed.storiesPublishedCount).toBe(1);

    const usg = TelemetryMetricsEngine.deriveUsage(events);
    expect(usg.totalSearches).toBe(1);
  });

  it('TEST-TELEMETRY-04: Declarative Health Derivation', () => {
    const collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.apiRequest('/api/v1/fixes', 20, 200));

    const health = TelemetryHealthEngine.evaluateHealth(collector.events());
    expect(health.status).toBe('Healthy');
    expect(health.alertLevel).toBe('INFO');
  });

  it('TEST-TELEMETRY-05: Empty Event Stream Handling', () => {
    const collector = new MemoryCollector();
    const projection = TelemetryProjectionBuilder.buildProjection(collector.events());

    expect(projection.eventCount).toBe(0);
    expect(projection.snapshot.health.status).toBe('Warning');
  });

  it('TEST-TELEMETRY-06: Duplicate ID Rejection', () => {
    const collector = new MemoryCollector();
    const evt = TelemetryEventBuilder.storyPublished('ch-01');
    collector.collect(evt);

    expect(() => collector.collect(evt)).toThrow(/Duplicate ID Rejection/);
  });

  it('TEST-TELEMETRY-07: Timestamp Ordering & Staleness Detection', () => {
    const collector = new MemoryCollector();
    const oldTime = new Date(Date.now() - 120 * 60 * 1000).toISOString(); // 2 hours ago
    collector.collect(TelemetryEventBuilder.createEvent('APIRequest', 'test', { durationMs: 10 }, oldTime));

    const health = TelemetryHealthEngine.evaluateHealth(collector.events());
    expect(health.status).toBe('Critical');
    expect(health.activeAlerts.some((a) => a.includes('Stale Telemetry Stream'))).toBe(true);
  });

  it('TEST-TELEMETRY-08: Deterministic Serialization & Checksum Calculation', () => {
    const collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.storyPublished('ch-01'));
    const projection = TelemetryProjectionBuilder.buildProjection(collector.events());

    const json1 = TelemetrySerializer.serialize(projection);
    const json2 = TelemetrySerializer.serialize(projection);

    expect(json1).toBe(json2);
    expect(json1).toContain('"checksum": "chk-');

    const deserialized = TelemetrySerializer.deserialize(json1);
    expect(deserialized.eventCount).toBe(1);
  });

  it('TEST-TELEMETRY-09: Non-Mutation Guarantee on Canonical Objects & Input Events', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);
    const collector = new MemoryCollector();
    const evt = TelemetryEventBuilder.storyPublished('ch-01');
    const originalEvtJson = JSON.stringify(evt);

    collector.collect(evt);
    TelemetryProjectionBuilder.buildProjection(collector.events());

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
    expect(JSON.stringify(evt)).toBe(originalEvtJson);
  });

  it('TEST-TELEMETRY-10: Invalid Event Rejection', () => {
    const collector = new MemoryCollector();
    const invalidEvt = { id: 'evt-bad', type: 'Unknown' as any, timestamp: 'invalid', source: '', schemaVersion: 0, metadata: {} };

    expect(() => collector.collect(invalidEvt)).toThrow(/Telemetry Collector Rejection/);
  });

  it('TEST-TELEMETRY-11: Declarative Threshold Transitions', () => {
    const collector = new MemoryCollector();
    // 5 errors out of 10 requests = 50% error rate -> Critical
    for (let i = 0; i < 5; i++) collector.collect(TelemetryEventBuilder.apiRequest('/api', 10, 200));
    for (let i = 0; i < 5; i++) collector.collect(TelemetryEventBuilder.apiError('/api', 'Error', 500));

    const health = TelemetryHealthEngine.evaluateHealth(collector.events());
    expect(health.status).toBe('Critical');
    expect(health.activeAlerts.length).toBeGreaterThan(0);
  });

  it('TEST-TELEMETRY-12: High Volume Event Stream Performance', () => {
    const collector = new MemoryCollector();
    const startMs = Date.now();

    for (let i = 0; i < 1000; i++) {
      collector.collect(TelemetryEventBuilder.apiRequest(`/path/${i}`, i, 200));
    }

    const projection = TelemetryProjectionBuilder.buildProjection(collector.events());
    const durationMs = Date.now() - startMs;

    expect(projection.eventCount).toBe(1000);
    expect(durationMs).toBeLessThan(500); // Must process 1000 events under 500ms
  });

  it('TEST-TELEMETRY-13: Concurrent Event Insertion Simulation', () => {
    const collector = new MemoryCollector();
    const events = Array.from({ length: 50 }, (_, i) => TelemetryEventBuilder.searchExecuted(`query-${i}`, i));

    events.forEach((evt) => collector.collect(evt));
    expect(collector.count()).toBe(50);
  });

  it('TEST-TELEMETRY-14: Deserialization Future Schema Version Guard', () => {
    const futurePayload = JSON.stringify({
      schemaVersion: 99,
      projectionVersion: 1,
      platformVersion: 'AR-99',
      generatedAt: new Date().toISOString(),
      checksum: 'chk-123',
      data: { eventCount: 0 },
    });

    expect(() => TelemetrySerializer.deserialize(futurePayload)).toThrow(/Unsupported future schemaVersion/);
  });

  it('TEST-TELEMETRY-15: Invalid Timestamp Rejection', () => {
    const invalidTimeEvt = TelemetryEventBuilder.createEvent('APIRequest', 'test', {}, 'not-a-date');
    const collector = new MemoryCollector();

    expect(() => collector.collect(invalidTimeEvt)).toThrow(/ISO 8601 timestamp/);
  });

  it('TEST-TELEMETRY-16: Telemetry Projection Building & Immutability', () => {
    const collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.dashboardOpened());
    const projection = TelemetryProjectionBuilder.buildProjection(collector.events());

    expect(projection.platformVersion).toBe('AR-13A.0');
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.snapshot)).toBe(true);
  });
});
