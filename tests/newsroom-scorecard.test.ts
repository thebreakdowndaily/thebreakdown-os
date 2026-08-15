import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { computeNewsroomScorecard } from '../services/intelligence/newsroom/scorecard-service';
import { NewsroomIntelligenceCore } from '../services/intelligence/newsroom';
import { MemoryStateRepository } from '../services/intelligence/newsroom/persistence/memory';
import { NewsroomAuditService } from '../services/intelligence/newsroom/audit-service';
import type {
  NewsroomObservation,
  StoryCluster,
  NewsroomSignal,
  IntelligenceAlert,
  CoverageGap,
  NewsroomAuditLogRecord,
  NewsroomScorecardBaselineReference,
} from '../types/newsroom-intelligence';

const BASELINE: NewsroomScorecardBaselineReference = {
  tag: 'news-intelligence-baseline-1.2',
  version: '1.2.0',
  coverageRecall: 0.778,
  intelligenceRecall: 1.0,
  silentLosses: 0,
  falsePositiveGaps: 0,
  sourceArtifact: 'data/newsroom-advantage-v1.2-baseline.json',
};

function makeObservation(overrides: Partial<NewsroomObservation> & { id: string }): NewsroomObservation {
  return {
    sourceId: 'pib',
    title: 'Test release',
    snippet: 'Test content',
    contentHash: `hash-${overrides.id}`,
    publicationTimestamp: '2026-08-15T09:00:00Z',
    ingestionTimestamp: '2026-08-15T09:01:00Z',
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    entities: ['Finance Ministry'],
    ...overrides,
  };
}

function makeCluster(overrides: Partial<StoryCluster> & { id: string }): StoryCluster {
  return {
    title: 'Test cluster',
    summary: 'Test summary',
    firstDetectedAt: '2026-08-15T09:00:00Z',
    lastUpdatedAt: '2026-08-15T09:00:00Z',
    observationIds: [],
    sourceIds: ['pib'],
    claimIds: [],
    entities: ['Finance Ministry'],
    primarySourceCount: 1,
    independentSourceCount: 1,
    geographicSpread: ['National'],
    status: 'active',
    ...overrides,
  };
}

function makeSignal(overrides: Partial<NewsroomSignal> & { id: string }): NewsroomSignal {
  return {
    clusterId: 'cl-1',
    title: 'Test signal',
    summary: 'Test summary',
    firstDetectedAt: '2026-08-15T09:02:00Z',
    lastUpdatedAt: '2026-08-15T09:02:00Z',
    lifecycleState: 'monitoring',
    priority: 'P1',
    scores: {
      relevance: 80,
      importance: 80,
      novelty: 70,
      velocity: 50,
      evidenceStrength: 70,
      confidence: 70,
      uncertainty: 30,
      misinformationRisk: 10,
      sourceReliability: 90,
    },
    explanation: {
      priority: 'P1',
      compositeScore: 80,
      threshold: 60,
      triggeredRules: ['test'],
      whyItMatters: 'Matters.',
      evidenceBasis: [],
      recommendedAction: 'Verify',
    },
    observationCount: 1,
    independentSourceCount: 1,
    primarySourceCount: 1,
    keyEntities: ['Finance Ministry'],
    keyClaims: [],
    contradictionIds: [],
    version: 1,
    ...overrides,
  };
}

function makeAlert(overrides: Partial<IntelligenceAlert> & { id: string; signalId: string }): IntelligenceAlert {
  return {
    idempotencyKey: `${overrides.signalId}:first_detection:1`,
    clusterId: 'cl-1',
    triggerReason: 'first_detection',
    priority: 'P1',
    title: 'P1 Alert',
    message: 'Alert message',
    triggeredAt: '2026-08-15T09:05:00Z',
    acknowledged: false,
    shadowMode: true,
    ...overrides,
  };
}

function makeGap(overrides: Partial<CoverageGap> & { id: string }): CoverageGap {
  return {
    gapType: 'source_gap',
    title: 'Test gap',
    description: 'Gap description',
    expectedDevelopment: 'Expected development',
    monitoredEntityOrTopic: 'PIB',
    recommendation: 'Backfill from archive',
    severity: 'high',
    detectedAt: '2026-08-15T09:30:00Z',
    status: 'open',
    ...overrides,
  };
}

const NOW = new Date('2026-08-18T09:00:00Z');

describe('NEWSROOM INTELLIGENCE SCORECARD — operational observation', () => {
  describe('Pure projection (computeNewsroomScorecard)', () => {
    it('SCORE-01: Empty state yields zeroed detection, intact frozen baseline, no latency samples', () => {
      const s = computeNewsroomScorecard({
        observations: [],
        clusters: [],
        signals: [],
        alerts: [],
        gaps: [],
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.detection.observations).toBe(0);
      expect(s.detection.signals).toBe(0);
      expect(s.coverage.coverageGapsOpen).toBe(0);
      expect(s.alerts.generated).toBe(0);
      expect(s.alerts.acknowledgementRate).toBe(0);
      expect(s.editorial.triageActions).toBe(0);
      expect(s.latency.medianTimeToEditorMs).toBeNull();
      expect(s.latency.medianTimeToActionMs).toBeNull();
      expect(s.observationPeriod.startAt).toBeNull();
      expect(s.observationPeriod.observationWindowElapsed).toBe(false);
      expect(s.baseline).toEqual(BASELINE);
    });

    it('SCORE-02: Detection counts, priority split, and duplicate rate reconcile', () => {
      const observations = [
        makeObservation({ id: 'o1', duplicateState: 'unique' }),
        makeObservation({ id: 'o2', duplicateState: 'exact_duplicate' }),
      ];
      const signals = [
        makeSignal({ id: 's1', priority: 'P0' }),
        makeSignal({ id: 's2', priority: 'P1' }),
        makeSignal({ id: 's3', priority: 'P2' }),
        makeSignal({ id: 's4', priority: 'P3' }),
      ];
      const s = computeNewsroomScorecard({
        observations,
        clusters: [makeCluster({ id: 'cl-1' })],
        signals,
        alerts: [],
        gaps: [],
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.detection.observations).toBe(2);
      expect(s.detection.clusters).toBe(1);
      expect(s.detection.signals).toBe(4);
      expect(s.detection.p0).toBe(1);
      expect(s.detection.p1).toBe(1);
      expect(s.detection.p2).toBe(1);
      expect(s.detection.p3).toBe(1);
      expect(s.detection.duplicateObservations).toBe(1);
      expect(s.detection.duplicateRate).toBe(0.5);
    });

    it('SCORE-03: Acknowledgement rate and median time-to-editor derive from alert timestamps', () => {
      const signals = [makeSignal({ id: 's1' }), makeSignal({ id: 's2' })];
      const alerts = [
        makeAlert({ id: 'a1', signalId: 's1', triggeredAt: '2026-08-15T09:05:00Z', acknowledged: true, acknowledgedAt: '2026-08-15T09:10:00Z' }),
        makeAlert({ id: 'a2', signalId: 's2', triggeredAt: '2026-08-15T09:40:00Z', acknowledged: true, acknowledgedAt: '2026-08-15T09:46:00Z' }),
        makeAlert({ id: 'a3', signalId: 's2', triggeredAt: '2026-08-15T11:00:00Z', acknowledged: false }),
      ];
      const s = computeNewsroomScorecard({
        observations: [],
        clusters: [],
        signals,
        alerts,
        gaps: [],
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.alerts.generated).toBe(3);
      expect(s.alerts.acknowledged).toBe(2);
      expect(s.alerts.unacknowledged).toBe(1);
      expect(s.alerts.acknowledgementRate).toBeCloseTo(2 / 3, 3);
      expect(s.latency.medianTimeToEditorMs).toBe(330000);
      expect(s.latency.timeToEditorSamples).toBe(2);
    });

    it('SCORE-04: Editorial actions drive false-positive rate and published-from-alert', () => {
      const signals = [
        makeSignal({ id: 's1', linkedStoryId: 'story-1', assignedTo: 'desk-1' }),
        makeSignal({ id: 's2' }),
      ];
      const alerts = [
        makeAlert({ id: 'a1', signalId: 's1' }),
        makeAlert({ id: 'a2', signalId: 's2' }),
      ];
      const audit: NewsroomAuditLogRecord[] = [
        { id: 'x1', timestamp: '2026-08-15T09:12:00Z', signalId: 's1', actorId: 'u1', actorName: 'Ed', action: 'ASSIGN', previousState: 'monitoring', newState: 'monitoring' },
        { id: 'x2', timestamp: '2026-08-15T09:20:00Z', signalId: 's1', actorId: 'u1', actorName: 'Ed', action: 'VERIFY', previousState: 'monitoring', newState: 'confirmed' },
        { id: 'x3', timestamp: '2026-08-15T09:25:00Z', signalId: 's2', actorId: 'u1', actorName: 'Ed', action: 'NOT_RELEVANT', previousState: 'monitoring', newState: 'retracted' },
        { id: 'x4', timestamp: '2026-08-15T09:26:00Z', signalId: 's2', actorId: 'u1', actorName: 'Ed', action: 'ALERT_ACK', previousState: undefined, newState: undefined },
      ];
      const s = computeNewsroomScorecard({
        observations: [],
        clusters: [],
        signals,
        alerts,
        gaps: [],
        audit,
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.editorial.triageActions).toBe(3); // ALERT_ACK excluded
      expect(s.editorial.falsePositiveJudgements).toBe(1);
      expect(s.editorial.falsePositiveRate).toBeCloseTo(1 / 3, 3);
      expect(s.editorial.publishedFromAlert).toBe(1);
      expect(s.editorial.publishedFromAlertRate).toBe(0.5);
      expect(s.editorial.assignedSignals).toBe(1);
    });

    it('SCORE-05: Median time-to-action uses the earliest triage action after each alert', () => {
      const signals = [makeSignal({ id: 's1' }), makeSignal({ id: 's2', clusterId: 'cl-2' })];
      const alerts = [
        makeAlert({ id: 'a1', signalId: 's1', triggeredAt: '2026-08-15T09:05:00Z' }),
        makeAlert({ id: 'a2', signalId: 's2', triggeredAt: '2026-08-15T09:40:00Z' }),
      ];
      const audit: NewsroomAuditLogRecord[] = [
        { id: 'x1', timestamp: '2026-08-15T09:12:00Z', signalId: 's1', actorId: 'u1', actorName: 'Ed', action: 'ASSIGN', previousState: 'monitoring', newState: 'monitoring' },
        { id: 'x2', timestamp: '2026-08-15T09:14:00Z', signalId: 's1', actorId: 'u1', actorName: 'Ed', action: 'VERIFY', previousState: 'monitoring', newState: 'confirmed' },
        { id: 'x3', timestamp: '2026-08-15T09:50:00Z', signalId: 's2', actorId: 'u1', actorName: 'Ed', action: 'VERIFY', previousState: 'monitoring', newState: 'confirmed' },
      ];
      const s = computeNewsroomScorecard({
        observations: [],
        clusters: [],
        signals,
        alerts,
        gaps: [],
        audit,
        baseline: BASELINE,
        now: NOW,
      });
      // a1: earliest action 09:12 - 09:05 = 420000; a2: 09:50 - 09:40 = 600000.
      expect(s.latency.medianTimeToActionMs).toBe(510000);
      expect(s.latency.timeToActionSamples).toBe(2);
    });

    it('SCORE-06: Coverage gap buckets reconcile open vs resolved', () => {
      const gaps = [
        makeGap({ id: 'g1', severity: 'critical' }),
        makeGap({ id: 'g2', severity: 'high' }),
        makeGap({ id: 'g3', severity: 'low', status: 'resolved' }),
      ];
      const s = computeNewsroomScorecard({
        observations: [],
        clusters: [],
        signals: [],
        alerts: [],
        gaps,
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.coverage.coverageGapsOpen).toBe(2);
      expect(s.coverage.coverageGapsTotal).toBe(3);
      expect(s.coverage.criticalOpen).toBe(1);
      expect(s.coverage.highOpen).toBe(1);
      expect(s.coverage.resolved).toBe(1);
    });

    it('SCORE-07: Observation period derives from the earliest canonical timestamp', () => {
      const observations = [makeObservation({ id: 'o1', ingestionTimestamp: '2026-08-16T02:00:00Z' })];
      const clusters = [makeCluster({ id: 'cl-1', firstDetectedAt: '2026-08-15T09:00:00Z' })];
      const signals = [makeSignal({ id: 's1', firstDetectedAt: '2026-08-15T09:02:00Z' })];
      const s = computeNewsroomScorecard({
        observations,
        clusters,
        signals,
        alerts: [],
        gaps: [],
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.observationPeriod.startAt).toBe('2026-08-15T09:00:00.000Z');
      // 2026-08-15T09:00Z → 2026-08-18T09:00Z = exactly 3 days.
      expect(s.observationPeriod.daysElapsed).toBe(3);
      expect(s.observationPeriod.observationWindowElapsed).toBe(false);
    });

    it('SCORE-08: Median detection latency and median time-to-alert reconcile', () => {
      const clusters = [
        makeCluster({ id: 'cl-1', firstDetectedAt: '2026-08-15T09:00:00Z' }),
        makeCluster({ id: 'cl-2', firstDetectedAt: '2026-08-15T09:30:00Z' }),
      ];
      const signals = [
        makeSignal({ id: 's1', clusterId: 'cl-1', firstDetectedAt: '2026-08-15T09:02:00Z' }),
        makeSignal({ id: 's2', clusterId: 'cl-2', firstDetectedAt: '2026-08-15T09:34:00Z' }),
      ];
      const alerts = [
        makeAlert({ id: 'a1', signalId: 's1', triggeredAt: '2026-08-15T09:05:00Z' }),
        makeAlert({ id: 'a2', signalId: 's2', triggeredAt: '2026-08-15T09:40:00Z' }),
      ];
      const s = computeNewsroomScorecard({
        observations: [],
        clusters,
        signals,
        alerts,
        gaps: [],
        audit: [],
        baseline: BASELINE,
        now: NOW,
      });
      expect(s.latency.medianTimeToSignalMs).toBe(180000);
      expect(s.latency.medianTimeToAlertMs).toBe(270000);
    });
  });

  describe('Facade integration (core.getScorecard)', () => {
    beforeEach(() => {
      NewsroomIntelligenceCore.resetInstance(new MemoryStateRepository());
      NewsroomAuditService.clear();
    });

    afterEach(() => {
      NewsroomIntelligenceCore.resetInstance(new MemoryStateRepository());
      NewsroomAuditService.clear();
    });

    it('SCORE-09: getScorecard() returns well-formed result with the frozen baseline reference', async () => {
      const core = NewsroomIntelligenceCore.getInstance();
      await core.ensureLoaded();

      core.ingestObservation(makeObservation({ id: 'o1' }));
      core.upsertCluster(makeCluster({ id: 'cl-1' }));
      core.registerCoverageGap(makeGap({ id: 'g1' }));
      core.executeAction({
        action: 'ASSIGN',
        actorId: 'u1',
        actorName: 'Ed',
        signalId: 'sig-1',
        assignedTo: 'desk-1',
      });

      const s = core.getScorecard();
      expect(s.observationPeriod.mode).toBe('live_observation');
      expect(s.detection.observations).toBe(1);
      expect(s.detection.clusters).toBe(1);
      expect(s.detection.signals).toBeGreaterThanOrEqual(1);
      expect(s.coverage.coverageGapsOpen).toBe(1);
      expect(s.baseline.tag).toBe('news-intelligence-baseline-1.2');
      expect(s.baseline.version).toBe('1.2.0');
      expect(s.baseline.coverageRecall).toBeGreaterThan(0);
      expect(s.baseline.sourceArtifact).toContain('newsroom-advantage-v1.2-baseline.json');
      expect(s.generatedAt).toBeTruthy();
    });

    it('SCORE-10: Real alert ack flows into acknowledgement rate and time-to-editor', async () => {
      const core = NewsroomIntelligenceCore.getInstance();
      await core.ensureLoaded();

      // The proven RESTART-02 recipe: 3 primary observations + a multi-observation
      // cluster reliably scores P0/P1 and emits a first_detection alert through the
      // real SignalEngine/AlertEngine.
      const base = '2026-08-17T10:00:00Z';
      core.ingestObservation(makeObservation({ id: 'o-a', sourceId: 'src-r', publicationTimestamp: base, ingestionTimestamp: base, sourceTier: 't1', isPrimarySource: true }));
      core.ingestObservation(makeObservation({ id: 'o-b', sourceId: 'src-r', publicationTimestamp: base, ingestionTimestamp: base, sourceTier: 't1', isPrimarySource: true }));
      core.ingestObservation(makeObservation({ id: 'o-c', sourceId: 'src-r', publicationTimestamp: base, ingestionTimestamp: base, sourceTier: 't1', isPrimarySource: true }));
      const { signal, alert } = core.upsertCluster(
        makeCluster({
          id: 'cl-high',
          title: 'RBI decision',
          observationIds: ['o-a', 'o-b', 'o-c'],
          sourceIds: ['src-r'],
          independentSourceCount: 2,
          primarySourceCount: 1,
          firstDetectedAt: base,
        })
      );
      expect(alert).not.toBeNull();

      if (signal && alert) {
        core.acknowledgeAlert(alert.id, 'u1', 'managing_editor');
      }

      const s = core.getScorecard();
      expect(s.alerts.generated).toBeGreaterThanOrEqual(1);
      expect(s.alerts.acknowledged).toBeGreaterThanOrEqual(1);
      expect(s.alerts.acknowledgementRate).toBeGreaterThan(0);
      // Signals have real cluster timestamps so latency samples may be present.
      expect(s.latency.medianTimeToSignalMs).not.toBeNull();
    });
  });
});
