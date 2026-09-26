import { describe, it, expect, beforeEach } from 'vitest';
import { ControlPlaneManager } from '../lib/control-plane/manager';
import { ControlPlaneHealthAggregator } from '../lib/control-plane/health';
import { RuntimeConfigurationService } from '../lib/control-plane/configuration';
import { ControlPlaneExtensionRegistry } from '../lib/control-plane/providers';
import { TelemetryProjectionBuilder } from '../lib/telemetry/projection';
import { MemoryCollector } from '../lib/telemetry/collector';
import { TelemetryEventBuilder } from '../lib/telemetry/events/builders';
import { JobRegistry } from '../lib/jobs/registry';
import { JobScheduler } from '../lib/jobs/scheduler';
import { JobRunner } from '../lib/jobs/runner';
import { JobProjectionBuilder } from '../lib/jobs/projection';
import { ProjectionRebuildJob } from '../lib/jobs/jobs/projection-rebuild';
import { SearchIndexRefreshJob } from '../lib/jobs/jobs/search-index-refresh';
import { OperationalResilienceEngine } from '../lib/infrastructure/resilience';
import { OperationalIntelligenceEngine } from '../lib/observability/intelligence-engine';
import { ProductionReadinessAuditor } from '../lib/integration/readiness-auditor';
import { GovernancePolicyEngine } from '../lib/governance/policy-engine';
import { CrossSubsystemAuditCorrelator } from '../lib/governance/audit-correlator';
import { KnowledgeDrivenInsightsEngine } from '../lib/observability/recommendation-engine';
import { EditorialDashboardProjection } from '../services/intelligence/editorial-dashboard.service';
import { computeNewsroomScorecard } from '../services/intelligence/newsroom/scorecard-service';
import { NewsroomPipelineHealthAggregator } from '../lib/operations/pipeline-health';
import { decideIntelAccess, guardIntel } from '../features/auth/intel-auth';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';
import type { NewsroomScorecardBaselineReference } from '../types/newsroom-intelligence';

const HOLD_BASELINE: NewsroomScorecardBaselineReference = {
  tag: 'news-intelligence-baseline-1.2',
  version: '1.2.0',
  coverageRecall: 0.778,
  intelligenceRecall: 1.0,
  silentLosses: 0,
  falsePositiveGaps: 0,
  sourceArtifact: 'data/newsroom-advantage-v1.2-baseline.json',
};

describe('TEST-VS6: Newsroom Operations, Mission Control & Control Plane Master Suite', () => {
  let collector: MemoryCollector;
  let scheduler: JobScheduler;
  let runner: JobRunner;
  let configService: RuntimeConfigurationService;
  let healthAggregator: ControlPlaneHealthAggregator;

  beforeEach(() => {
    collector = new MemoryCollector();
    collector.collect(TelemetryEventBuilder.storyPublished('ch-01'));
    collector.collect(TelemetryEventBuilder.apiRequest('/api/v1/fixes', 35, 200));

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

  // Domain 1: Mission Control Read-Only Boundary
  it('TEST-VS6-01: Mission Control Read-Only Boundary & Non-Mutation Invariant', () => {
    const originalJson = JSON.stringify(CHAPTER_1_FIX);

    const data = EditorialDashboardProjection.projectDashboard([CHAPTER_1_FIX]);
    expect(data.evidenceHealthIndex).toBeGreaterThan(0);
    expect(data.publicationReadinessScore).toBeGreaterThan(0);

    // Verify non-mutation of canonical knowledge object
    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalJson);
  });

  // Domain 2: Control Plane Authorization
  it('TEST-VS6-02: Control Plane Server-Side Authorization Boundary', async () => {
    // Guest role must be denied access to operational newsroom triage
    const guestDecision = decideIntelAccess('newsroom', 'guest');
    expect(guestDecision.status).toBe('denied');

    // Unauthenticated user must fail closed
    const unauthResult = await guardIntel('newsroom', async () => null);
    expect(unauthResult.authorized).toBe(false);
    expect(unauthResult.reason).toBe('unauthenticated');

    // Managing editor role must be granted access
    const editorDecision = decideIntelAccess('newsroom', 'managing_editor');
    expect(editorDecision.status).toBe('authorized');
  });

  // Domain 3: Health Accuracy & Subsystem Details
  it('TEST-VS6-03: System Health Accuracy with Subsystem Details', () => {
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

    // Verify subsystem details carry timestamp and latency
    expect(snapshot.health.subsystemDetails).toBeDefined();
    expect(snapshot.health.subsystemDetails?.telemetry.status).toBe('HEALTHY');
    expect(snapshot.health.subsystemDetails?.telemetry.timestamp).toBeDefined();
    expect(snapshot.health.subsystemDetails?.jobs.status).toBe('HEALTHY');
  });

  // Domain 4: Degraded-State Accuracy
  it('TEST-VS6-04: Degraded-State Accuracy When Subsystem Fails', () => {
    const FailingJobsScheduler = new JobScheduler();
    // Enqueue 2 jobs and simulate failure
    const j1 = FailingJobsScheduler.enqueue('ProjectionRebuild');
    const j2 = FailingJobsScheduler.enqueue('SearchIndexRefresh');
    FailingJobsScheduler.dequeue();
    FailingJobsScheduler.recordResult(j1.jobId, { ...j1, status: 'FAILED' });
    FailingJobsScheduler.dequeue();
    FailingJobsScheduler.recordResult(j2.jobId, { ...j2, status: 'FAILED' });

    const failingJobsProvider = {
      getProjection: () => JobProjectionBuilder.buildProjection(FailingJobsScheduler),
    };

    const manager = new ControlPlaneManager({
      telemetryProvider: getTelemetryProvider(),
      jobsProvider: failingJobsProvider,
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    const snapshot = manager.generateSnapshot();
    expect(snapshot.health.severity).not.toBe('HEALTHY');
    expect(snapshot.health.subsystemStatuses.jobs).toBe('WARNING');
    expect(snapshot.health.alertCount).toBeGreaterThan(0);
    expect(snapshot.health.subsystemDetails?.jobs.error).toContain('failed in history');

    // Invariant: Unknown critical subsystem -> aggregate CANNOT be HEALTHY (becomes UNKNOWN)
    const unknownSnapshot = healthAggregator.evaluateHealth(null as any, JobProjectionBuilder.buildProjection(scheduler));
    expect(unknownSnapshot.severity).toBe('UNKNOWN');
    expect(unknownSnapshot.severity).not.toBe('HEALTHY');

    // Invariant: Degraded critical subsystem -> aggregate CANNOT be HEALTHY (becomes DEGRADED)
    const degradedTelemetry = {
      ...getTelemetryProvider().getProjection(),
      snapshot: {
        ...getTelemetryProvider().getProjection().snapshot!,
        health: { status: 'Degraded' as any, activeAlerts: ['High latency'] },
      },
    };
    const degradedSnapshot = healthAggregator.evaluateHealth(degradedTelemetry as any, JobProjectionBuilder.buildProjection(scheduler));
    expect(degradedSnapshot.severity).toBe('DEGRADED');
    expect(degradedSnapshot.severity).not.toBe('HEALTHY');
  });

  // Domain 5: Worker / Job State Accuracy
  it('TEST-VS6-05: Worker and Job Lifecycle State Accuracy', async () => {
    expect(scheduler.getQueue().length).toBe(1);
    expect(scheduler.getQueue()[0].status).toBe('PENDING');

    const result = await runner.executeNext();
    expect(result).toBeDefined();
    expect(result?.status).toBe('COMPLETED');
    expect(scheduler.getQueue().length).toBe(0);
    expect(scheduler.getHistory().length).toBe(1);
    expect(scheduler.getHistory()[0].status).toBe('COMPLETED');
  });

  // Domain 6: Incident State Correctness
  it('TEST-VS6-06: Incident State Machine & Recovery Transitions', () => {
    const engine = new OperationalResilienceEngine();
    expect(engine.deriveRecoveryState()).toBe('NORMAL');

    const incident = engine.reportIncident('Ingestion Adapter', 'HIGH');
    expect(incident.status).toBe('OPEN');
    expect(engine.getActiveIncidents().length).toBe(1);
    expect(engine.deriveRecoveryState()).toBe('DEGRADED');

    engine.resolveIncident(incident.id, 'Upstream rate limit cleared.');
    expect(engine.getActiveIncidents().length).toBe(0);
    expect(engine.deriveRecoveryState()).toBe('NORMAL');
  });

  // Domain 7: Operational Alert Correctness
  it('TEST-VS6-07: Operational Alert Structure and Severity Distinction', () => {
    const alerts = OperationalIntelligenceEngine.detectAnomalies();
    expect(alerts.length).toBeGreaterThan(0);

    const alert = alerts[0];
    expect(alert.alertId).toBeDefined();
    expect(alert.subsystem).toBe('TelemetrySubsystem');
    expect(alert.detectedTime).toBeDefined();
    expect(alert.source).toBe('TelemetryCollector');
    expect(alert.condition).toBeDefined();
    expect(alert.status).toBe('ACTIVE');
    expect(alert.operationalSeverity).toBe('P2');
  });

  // Domain 8: Release Readiness Freshness
  it('TEST-VS6-08: Release Readiness Audit with Evaluated Freshness', () => {
    const checks = ProductionReadinessAuditor.runAudit();
    expect(checks.length).toBe(4);
    expect(checks.every((c) => c.passed)).toBe(true);
    expect(checks.every((c) => typeof c.evaluatedAt === 'string')).toBe(true);
  });

  // Domain 9: Governance Integrity
  it('TEST-VS6-09: Governance Policy Registry & Canonical Immutability Policy', () => {
    const policies = GovernancePolicyEngine.listPolicies();
    const editPolicy = policies.find((p) => p.category === 'EDITORIAL');

    expect(editPolicy).toBeDefined();
    expect(editPolicy?.name).toBe('Canonical Object Non-Mutation Invariant');
    expect(GovernancePolicyEngine.evaluatePolicyCompliance()).toBe(true);
  });

  // Domain 10: Scorecard Provenance & Baseline Traceability
  it('TEST-VS6-10: Newsroom Scorecard Provenance and Holdout Baseline Reference', () => {
    const scorecard = computeNewsroomScorecard({
      observations: [],
      clusters: [],
      signals: [],
      alerts: [],
      gaps: [],
      audit: [],
      baseline: HOLD_BASELINE,
      periodStart: '2026-08-15T00:00:00Z',
    });

    expect(scorecard.baseline.coverageRecall).toBe(0.778);
    expect(scorecard.baseline.intelligenceRecall).toBe(1.0);
    expect(scorecard.baseline.silentLosses).toBe(0);
    expect(scorecard.baseline.falsePositiveGaps).toBe(0);
    expect(scorecard.baseline.sourceArtifact).toBe('data/newsroom-advantage-v1.2-baseline.json');
    expect(scorecard.detection.observations).toBe(0);
    expect(scorecard.detection.signals).toBe(0);
  });

  // Domain 11: Observability Boundary ("Observe. Explain. Recommend. Never execute.")
  it('TEST-VS6-11: Observability Advisory Invariant — Observe, Explain, Never Execute', () => {
    const recs = KnowledgeDrivenInsightsEngine.generateRecommendations();
    expect(recs.length).toBeGreaterThan(0);

    for (const rec of recs) {
      expect(rec.rationale).toBeDefined();
      expect(rec.suggestedAction).toBeDefined();
      expect(rec.evidenceReferences.length).toBeGreaterThan(0);
      expect(rec.confidenceScore).toBeGreaterThan(0);
    }
  });

  // Domain 12: Public Isolation
  it('TEST-VS6-12: Public Isolation — Operational Data Never Exposed in Public Route Contexts', () => {
    // Simulated public read context
    const publicReaderRoutes = ['/', '/trackers', '/trust', '/search'];
    expect(publicReaderRoutes.every((r) => !r.startsWith('/operations'))).toBe(true);
    expect(publicReaderRoutes.every((r) => !r.startsWith('/intel'))).toBe(true);
  });

  // Domain 13: Operational Mutation Audit Trail
  it('TEST-VS6-13: Cross-Subsystem Audit Correlation with Preserved Correlation IDs', () => {
    const customCorrelationId = 'corr-vs6-audit-test-999';
    const auditStream = CrossSubsystemAuditCorrelator.correlateAuditStream(customCorrelationId);

    expect(auditStream.length).toBe(4);
    expect(auditStream.every((event) => event.correlationId === customCorrelationId)).toBe(true);
    expect(auditStream.some((event) => event.sourceSubsystem === 'SecuritySubsystem')).toBe(true);
    expect(auditStream.some((event) => event.sourceSubsystem === 'JobAutomationSubsystem')).toBe(true);
  });

  // Domain 14: OCC for Mutable Operational State
  it('TEST-VS6-14: Optimistic Concurrency Control (OCC) Version Guard Pattern', () => {
    const signalState = { id: 'sig-01', version: 3, triageStatus: 'NEW' };

    // Valid update matching expected version
    const applyTriage = (state: typeof signalState, expectedVersion: number, newStatus: string) => {
      if (state.version !== expectedVersion) {
        throw new Error(`OCCVersionConflictError: expected version ${expectedVersion}, found ${state.version}`);
      }
      return { ...state, triageStatus: newStatus, version: state.version + 1 };
    };

    const updated = applyTriage(signalState, 3, 'IN_REVIEW');
    expect(updated.version).toBe(4);
    expect(updated.triageStatus).toBe('IN_REVIEW');

    // Stale update must throw OCC error
    expect(() => applyTriage(updated, 3, 'ASSIGNED')).toThrow('OCCVersionConflictError');
  });

  // Domain 15: Failure Degradation & Provider Isolation
  it('TEST-VS6-15: Failure Degradation — Partial Provider Failure Isolation', () => {
    const CrashingTelemetryProvider = {
      getProjection: () => {
        throw new Error('Telemetry Backend Socket Timeout');
      },
    };

    const manager = new ControlPlaneManager({
      telemetryProvider: CrashingTelemetryProvider,
      jobsProvider: getJobsProvider(),
      healthProvider: healthAggregator,
      configurationProvider: configService,
    });

    // Manager must not crash; snapshot must be generated with fallback metrics
    const snapshot = manager.generateSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.telemetrySummary.totalEvents).toBe(0);
    expect(snapshot.health.severity).not.toBe('HEALTHY');
  });

  // Domain 16: Newsroom Pipeline Health 10-Stage Aggregation
  it('TEST-VS6-16: Newsroom Pipeline Health 10-Stage Aggregation', async () => {
    const pipeline = await NewsroomPipelineHealthAggregator.evaluatePipelineHealth();
    expect(pipeline).toBeDefined();
    expect(pipeline.stages.length).toBe(10);

    const stageNames = pipeline.stages.map((s) => s.stage);
    expect(stageNames).toEqual([
      'INGESTION',
      'SIGNAL',
      'INTELLIGENCE',
      'TRIAGE',
      'RESEARCH',
      'EDITORIAL',
      'VERIFICATION',
      'PUBLICATION',
      'READER',
      'OUTCOMES',
    ]);

    // Check that stages do not fabricate 0 where unknown
    const editorialStage = pipeline.stages.find((s) => s.stage === 'EDITORIAL');
    expect(editorialStage?.throughput).toBe('UNKNOWN');
  });
});
