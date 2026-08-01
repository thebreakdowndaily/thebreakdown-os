import { describe, it, expect, beforeEach } from 'vitest';
import { ControlPlaneManager } from '../lib/control-plane/manager';
import { ControlPlaneProjectionBuilder } from '../lib/control-plane/projection';
import { ControlPlaneHealthAggregator } from '../lib/control-plane/health';
import { RuntimeConfigurationService } from '../lib/control-plane/configuration';
import { ControlPlaneExtensionRegistry } from '../lib/control-plane/providers';
import { MemoryCollector } from '../lib/telemetry/collector';
import { TelemetryEventBuilder } from '../lib/telemetry/events/builders';
import { TelemetryProjectionBuilder } from '../lib/telemetry/projection';
import { JobRegistry } from '../lib/jobs/registry';
import { JobScheduler } from '../lib/jobs/scheduler';
import { JobRunner } from '../lib/jobs/runner';
import { JobProjectionBuilder } from '../lib/jobs/projection';
import { ProjectionRebuildJob } from '../lib/jobs/jobs/projection-rebuild';
import { SearchIndexRefreshJob } from '../lib/jobs/jobs/search-index-refresh';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-CONTROL-PLANE: Operations Control Plane (Phase 18A)', () => {
  let collector: MemoryCollector;
  let scheduler: JobScheduler;
  let runner: JobRunner;
  let configService: RuntimeConfigurationService;
  let healthAggregator: ControlPlaneHealthAggregator;

  beforeEach(() => {
    collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.storyPublished('ch-01'));
    collector.collect(TelemetryEventBuilder.apiRequest('/api/v1/fixes', 50, 200));

    JobRegistry.clear();
    JobRegistry.register(ProjectionRebuildJob);
    JobRegistry.register(SearchIndexRefreshJob);

    scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild');
    runner = new JobRunner({ scheduler });

    configService = new RuntimeConfigurationService();
    healthAggregator = new ControlPlaneHealthAggregator();
    ControlPlaneExtensionRegistry.clear();
  });

  const getTelemetryProvider = () => ({
    getProjection: () => TelemetryProjectionBuilder.buildProjection(collector.events()),
  });

  const getJobsProvider = () => ({
    getProjection: () => JobProjectionBuilder.buildProjection(scheduler),
  });

  it('TEST-CONTROL-PLANE-01: Provider Interface Isolation', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.telemetrySummary.totalEvents).toBe(2);
    expect(snapshot.jobsSummary.totalEnqueued).toBe(1);
  });

  it('TEST-CONTROL-PLANE-02: Snapshot Metadata & Versioning', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.snapshotVersion).toBe(1);
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.platformVersion).toBe('AR-13A.0');
    expect(snapshot.snapshotId).toContain('snap-cp-');
  });

  it('TEST-CONTROL-PLANE-03: System Health Severity Evaluation', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.health.severity).toBe('HEALTHY');
    expect(snapshot.health.subsystemStatuses.telemetry).toBe('HEALTHY');
    expect(snapshot.health.subsystemStatuses.jobs).toBe('HEALTHY');
  });

  it('TEST-CONTROL-PLANE-04: Immutable Runtime Configuration', () => {
    const config = configService.getConfiguration();
    expect(config.platformVersion).toBe('AR-13A.0');
    expect(config.environment).toBe('production');
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('TEST-CONTROL-PLANE-05: Event Emission & Control Audit Log', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    manager.emitEvent('TelemetryUpdated', 'test-source', { count: 2 });
    manager.emitEvent('JobCompleted', 'job-runner', { jobId: 'job-1' });

    const events = manager.getEvents();
    expect(events.length).toBe(2);
    expect(events[0].type).toBe('TelemetryUpdated');
    expect(events[1].type).toBe('JobCompleted');
  });

  it('TEST-CONTROL-PLANE-06: ControlPlaneProjection Building & Immutability', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const projection = ControlPlaneProjectionBuilder.buildProjection(manager);
    expect(projection.systemStatusLabel).toBe('OPERATIONAL');
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.snapshot)).toBe(true);
  });

  it('TEST-CONTROL-PLANE-07: Provider Failure Isolation & Fallback Handling', () => {
    const FailingTelemetryProvider = {
      getProjection: () => {
        throw new Error('Telemetry Subsystem Offline');
      },
    };

    const manager = new ControlPlaneManager({
      telemetryProvider: FailingTelemetryProvider,
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.telemetrySummary.totalEvents).toBe(0);
    expect(snapshot.health.severity).not.toBe('HEALTHY'); // Aggregated alert
  });

  it('TEST-CONTROL-PLANE-08: Partial Subsystem Availability', () => {
    const FailingJobsProvider = {
      getProjection: () => {
        throw new Error('Jobs Subsystem Outage');
      },
    };

    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: FailingJobsProvider,
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.telemetrySummary.totalEvents).toBe(2);
    expect(snapshot.jobsSummary.totalEnqueued).toBe(0);
  });

  it('TEST-CONTROL-PLANE-09: Stale Snapshot Handling', () => {
    const oldTime = new Date(Date.now() - 120 * 60 * 1000).toISOString(); // 2 hrs ago
    collector.clear();
    collector.collect(TelemetryEventBuilder.createEvent('APIRequest', 'test', { durationMs: 10 }, oldTime));

    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.health.severity).toBe('CRITICAL');
  });

  it('TEST-CONTROL-PLANE-10: Deterministic Snapshot Generation', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snap1 = manager.generateSnapshot();
    const snap2 = manager.generateSnapshot();

    expect(snap1.telemetrySummary).toEqual(snap2.telemetrySummary);
    expect(snap1.jobsSummary).toEqual(snap2.jobsSummary);
  });

  it('TEST-CONTROL-PLANE-11: Concurrent Snapshot Generation Simulation', async () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshots = await Promise.all([
      Promise.resolve(manager.generateSnapshot()),
      Promise.resolve(manager.generateSnapshot()),
      Promise.resolve(manager.generateSnapshot()),
    ]);

    expect(snapshots.length).toBe(3);
    expect(snapshots[0].schemaVersion).toBe(1);
  });

  it('TEST-CONTROL-PLANE-12: Extension Registry Execution & Failure Isolation', () => {
    let called = false;
    ControlPlaneExtensionRegistry.register({
      id: 'test-ext',
      name: 'Test Extension',
      onSnapshotGenerated() {
        called = true;
      },
    });

    ControlPlaneExtensionRegistry.register({
      id: 'failing-ext',
      name: 'Failing Extension',
      onSnapshotGenerated() {
        throw new Error('Extension crash');
      },
    });

    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot).toBeDefined();
    expect(called).toBe(true);
  });

  it('TEST-CONTROL-PLANE-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    ControlPlaneProjectionBuilder.buildProjection(manager);

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-CONTROL-PLANE-14: High Volume Event Emission Performance', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      manager.emitEvent('JobCompleted', 'perf-test', { idx: i });
    }
    const duration = Date.now() - start;

    expect(manager.getEvents().length).toBe(500);
    expect(duration).toBeLessThan(100); // 500 events under 100ms
  });

  it('TEST-CONTROL-PLANE-15: Dashboard UI Projection Compatibility', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const projection = ControlPlaneProjectionBuilder.buildProjection(manager);
    expect(projection.snapshot.health.severity).toBeDefined();
    expect(projection.snapshot.configuration.platformVersion).toBe('AR-13A.0');
  });

  it('TEST-CONTROL-PLANE-16: Serialization Stability', () => {
    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const projection = ControlPlaneProjectionBuilder.buildProjection(manager);
    const json = JSON.stringify(projection);

    expect(json).toContain('"platformVersion":"AR-13A.0"');
    expect(JSON.parse(json).projectionVersion).toBe(1);
  });
});
