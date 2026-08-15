/**
 * ─── NEWSROOM INTELLIGENCE OS — Production Remediation Certification ─────────
 *
 * Certifies the fixes delivered by NEWSROOM-INTEL-PRODUCTION-REMEDIATION-01:
 *   1. RESTART — authoritative durable state survives worker restart (file).
 *   2. TAXONOMY — runtime exposes the frozen 16-beat taxonomy + canonical registry.
 *   3. ROUTING — overlap matrix resolves ambiguous signals deterministically.
 *   4. FATIGUE — alert fatigue caps are ENFORCED at delivery time.
 *   5. IDOR — beat-level access control holds for the canonical registry.
 *   6. METRICS — operational telemetry is computed from real state, not constants.
 *   7. BOOTSTRAP — runtime provisioning is idempotent and demo-only.
 *
 * Governing document: NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §4, §9,
 * §14, §21, and the remediation report's status split (CERTIFIED TEST
 * BEHAVIOR vs IMPLEMENTED RUNTIME vs LIVE PRODUCTION).
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  NewsroomIntelligenceCore,
  newsroomIntelligenceCore,
} from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { FileStateRepository } from '@/services/intelligence/newsroom/persistence';
import { emptyBeatFatigue } from '@/services/intelligence/newsroom/persistence/state';
import { ensureNewsroomRuntime } from '@/lib/intelligence/newsroom-bootstrap';
import { isDemoMode, DEMO_USER } from '@/features/auth/demo';
import {
  NewsroomSignal,
  StoryCluster,
  NewsroomObservation,
} from '@/types/newsroom-intelligence';

const FROZEN_BEATS = [
  'economy',
  'agriculture',
  'judiciary',
  'politics',
  'defence',
  'technology',
  'health',
  'education',
  'foreign_affairs',
  'climate',
  'telecom',
  'labour',
  'science',
  'business',
  'consumer',
  'transport',
];

function tempStateFile(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'newsroom-remediation-'));
  return path.join(dir, 'state.json');
}

function removeStateFile(filePath: string): void {
  try {
    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

function makeSignal(overrides: Partial<NewsroomSignal> & { id: string; keyEntities: string[] }): NewsroomSignal {
  const base: NewsroomSignal = {
    id: overrides.id,
    clusterId: overrides.clusterId || `cl-${overrides.id}`,
    title: overrides.title || 'Test signal',
    summary: overrides.summary || 'Developing details.',
    firstDetectedAt: overrides.firstDetectedAt || new Date().toISOString(),
    lastUpdatedAt: overrides.lastUpdatedAt || new Date().toISOString(),
    lifecycleState: overrides.lifecycleState || 'discovered',
    priority: overrides.priority || 'P1',
    scores: {
      relevance: 80, importance: 80, novelty: 70, velocity: 65,
      evidenceStrength: 85, confidence: 85, uncertainty: 20, misinformationRisk: 10, sourceReliability: 90,
    },
    explanation: {
      priority: overrides.priority || 'P1', compositeScore: 80, threshold: 70, triggeredRules: [],
      whyItMatters: overrides.explanation?.whyItMatters || '', evidenceBasis: [], recommendedAction: '',
    },
    observationCount: 3, independentSourceCount: 3, primarySourceCount: 1,
    keyEntities: overrides.keyEntities, keyClaims: [], contradictionIds: [], version: 1,
  };
  return { ...base, ...overrides };
}

function makeCluster(id: string, entities: string[], title: string, observationIds?: string[], sourceIds?: string[]): StoryCluster {
  return {
    id,
    title,
    summary: 'Summary.',
    firstDetectedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    observationIds: observationIds || [`obs-${id}`],
    sourceIds: sourceIds || [`src-${id}`],
    claimIds: [],
    entities,
    primarySourceCount: 1,
    independentSourceCount: 2,
    geographicSpread: ['National'],
    status: 'active',
  };
}

function makeObservation(id: string, entities: string[], when: Date): NewsroomObservation {
  return {
    id: `obs-${id}`,
    sourceId: `src-${id}`,
    title: 'Observation',
    snippet: 'Observation snippet.',
    contentHash: `hash-${id}`,
    publicationTimestamp: when.toISOString(),
    ingestionTimestamp: when.toISOString(),
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    entities,
  };
}

afterEach(() => {
  beatRoutingService.clear();
  NewsroomAuditService.clear();
  newsroomIntelligenceCore.clear();
});

describe('NEWSROOM INTELLIGENCE OS — PRODUCTION REMEDIATION CERTIFICATION', () => {
  describe('1. RESTART — durable authoritative state (file provider)', () => {
    it('RESTART-01: signals, registry, and Phase 2 authorization survive restart', () => {
      const filePath = tempStateFile();
      try {
        const repo = new FileStateRepository(filePath);
        const coreA = new NewsroomIntelligenceCore(repo);

        beatRoutingService.authorizePhase2({
          authorizedBy: 'managing-editor-01',
          authorizedRole: 'managing_editor',
          authorizationTimestamp: new Date().toISOString(),
          approvedScope: 'Beat alerting activation',
          approvedRecipients: ['reporter-01', 'reporter-02'],
          approvedBeats: ['economy', 'judiciary'],
          approvedChannels: ['beat_desk_channel'],
          rollbackAuthority: 'managing-editor-01',
        });

        coreA.ingestObservation(makeObservation('restart-1', ['RBI'], new Date()));
        const { signal } = coreA.upsertCluster(makeCluster('cl-restart-1', ['RBI'], 'RBI decision'));
        expect(signal).toBeDefined();
        expect(fs.existsSync(filePath)).toBe(true);

        // Simulated worker restart: fresh core instance over the same snapshot.
        const coreB = new NewsroomIntelligenceCore(repo);

        expect(coreB.getSignals().map((s) => s.id)).toContain(signal.id);
        expect(coreB.getSignals().length).toBe(1);
        expect(beatRoutingService.getBeats().length).toBe(16);
        expect(beatRoutingService.getBeats().map((b) => b.id).sort()).toEqual([...FROZEN_BEATS].sort());
        expect(beatRoutingService.getRecipient('reporter-01')).toBeDefined();
        expect(beatRoutingService.getRecipient('editor-01')).toBeDefined();
        expect(beatRoutingService.isPhase2Active()).toBe(true);
      } finally {
        removeStateFile(filePath);
      }
    });

    it('RESTART-02: alerts, audit ledger, reputation, and fatigue telemetry survive restart', () => {
      const filePath = tempStateFile();
      try {
        const repo = new FileStateRepository(filePath);
        const coreA = new NewsroomIntelligenceCore(repo);

        beatRoutingService.authorizePhase2({
          authorizedBy: 'managing-editor-01',
          authorizedRole: 'managing_editor',
          authorizationTimestamp: new Date().toISOString(),
          approvedScope: 'Beat alerting activation',
          approvedRecipients: ['reporter-01'],
          approvedBeats: ['economy'],
          approvedChannels: ['beat_desk_channel'],
          rollbackAuthority: 'managing-editor-01',
        });

        coreA.registerSource({ id: 'src-r', name: 'RBI', tier: 't1' });
        const now = new Date();
        coreA.ingestObservation(makeObservation('restart-2', ['RBI'], now));
        coreA.ingestObservation(makeObservation('restart-2b', ['RBI'], now));
        coreA.ingestObservation(makeObservation('restart-2c', ['RBI'], now));
        const { alert } = coreA.upsertCluster(
          makeCluster('cl-restart-2', ['RBI'], 'RBI decision', ['obs-restart-2', 'obs-restart-2b', 'obs-restart-2c'])
        );
        expect(alert).not.toBeNull();
        coreA.executeAction({
          signalId: 'sig-cl-restart-2',
          action: 'FOLLOW',
          actorId: 'reporter-01',
          actorName: 'Reporter 01',
        });

        const fatigueBefore = beatRoutingService.getUserFatigueMetrics('reporter-01');
        expect(fatigueBefore.alertsToday).toBe(1);

        const coreB = new NewsroomIntelligenceCore(repo);

        expect(coreB.getAlerts().length).toBe(1);
        expect(NewsroomAuditService.getAuditTrail().length).toBeGreaterThan(0);
        expect(coreB.getSourceReputations().map((r) => r.sourceId)).toContain('src-r');
        expect(beatRoutingService.getUserFatigueMetrics('reporter-01').alertsToday).toBe(1);
      } finally {
        removeStateFile(filePath);
      }
    });
  });

  describe('2. TAXONOMY — frozen 16-beat runtime + canonical recipient registry', () => {
    it('TAXONOMY-01: runtime exposes exactly the frozen 16 beats', () => {
      new NewsroomIntelligenceCore();
      expect(beatRoutingService.getBeats().length).toBe(16);
      expect(beatRoutingService.getBeats().map((b) => b.id).sort()).toEqual([...FROZEN_BEATS].sort());
    });

    it('TAXONOMY-02: canonical recipient registry is provisioned', () => {
      const core = new NewsroomIntelligenceCore();
      const recipients = beatRoutingService.getRecipients();

      for (const id of ['reporter-01', 'reporter-02', 'reporter-03', 'reporter-04', 'reporter-05', 'reporter-06', 'reporter-07', 'reporter-08']) {
        expect(recipients.find((r) => r.userId === id)).toBeDefined();
      }
      const editor = beatRoutingService.getRecipient('editor-01');
      expect(editor?.beatIds.length).toBe(16);
      const managing = beatRoutingService.getRecipient('managing-editor-01');
      expect(managing?.role).toBe('managing_editor');
    });
  });

  describe('3. ROUTING — deterministic overlap resolution', () => {
    it('ROUTING-01: overlapping beats resolve to exactly one authoritative beat', () => {
      const cases: Array<{ entities: string[]; text: string; expected: string[] }> = [
        { entities: ['SEBI', 'NCLT'], text: 'insolvency petition admitted', expected: ['business'] },
        { entities: ['TRAI'], text: 'spectrum auction finalised', expected: ['telecom'] },
        { entities: ['ISRO'], text: 'satellite launch window announced', expected: ['science'] },
        { entities: ['Supreme Court'], text: 'election petition listed for hearing', expected: ['judiciary'] },
        { entities: ['RBI'], text: 'repo rate decision published', expected: ['economy'] },
        { entities: ['ICMR'], text: 'clinical trial guidance updated', expected: ['health'] },
      ];

      for (const c of cases) {
        const signal = makeSignal({
          id: `sig-${c.entities.join('-')}`,
          keyEntities: c.entities,
          summary: c.text,
        });
        expect(beatRoutingService.determineSignalBeats(signal).sort()).toEqual([...c.expected].sort());
      }
    });

    it('ROUTING-02: unmatched signals route to zero beats — no silent general bucket', () => {
      const signal = makeSignal({
        id: 'sig-unmatched',
        keyEntities: ['UnknownCorp'],
        summary: 'Company issued an internal update.',
      });
      expect(beatRoutingService.determineSignalBeats(signal)).toEqual([]);
      expect(beatRoutingService.checkUserAccess({ id: 'reporter-01', role: 'reporter' }, signal)).toBe(false);
      expect(beatRoutingService.checkUserAccess({ id: 'managing-editor-01', role: 'managing_editor' }, signal)).toBe(true);
    });
  });

  describe('4. FATIGUE — alert fatigue caps enforced at delivery', () => {
    it('FATIGUE-01: per-recipient 3/hr cap suppresses the 4th delivery in the hour', () => {
      const snap = beatRoutingService.snapshot();
      snap.recipients = [
        { userId: 'reporter-01', role: 'reporter', beatIds: ['economy'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      ];
      snap.fatigue = { userFatigue: {}, beatFatigue: {} };
      beatRoutingService.restore(snap);

      const t0 = new Date('2026-01-01T00:00:00Z');
      const signal = makeSignal({ id: 'sig-fat-1', keyEntities: ['RBI'], priority: 'P1', summary: 'repo rate decision' });

      beatRoutingService.routeAlert(signal, 'alt-fat-1', t0);
      beatRoutingService.routeAlert(signal, 'alt-fat-2', t0);
      beatRoutingService.routeAlert(signal, 'alt-fat-3', t0);

      const afterThree = beatRoutingService.getUserFatigueMetrics('reporter-01');
      expect(afterThree.alertsToday).toBe(3);
      expect(afterThree.fatigueSuppressed).toBe(0);

      beatRoutingService.routeAlert(signal, 'alt-fat-4', t0);

      const afterFour = beatRoutingService.getUserFatigueMetrics('reporter-01');
      expect(afterFour.alertsToday).toBe(3);
      expect(afterFour.fatigueSuppressed).toBe(1);
      expect(afterFour.deliveredAt.length).toBe(3);
    });

    it('FATIGUE-02: per-beat 5/day cap suppresses the entire beat after 5 deliveries', () => {
      const snap = beatRoutingService.snapshot();
      snap.recipients = [
        { userId: 'reporter-01', role: 'reporter', beatIds: ['economy'], active: true, notificationPreference: 'immediate', escalationLevel: 1 },
      ];
      const t0 = new Date('2026-01-01T00:00:00Z');
      const beatFatigue = emptyBeatFatigue();
      beatFatigue.deliveredAt = [
        new Date(t0.getTime() - 1000).toISOString(),
        new Date(t0.getTime() - 2000).toISOString(),
        new Date(t0.getTime() - 3000).toISOString(),
        new Date(t0.getTime() - 4000).toISOString(),
        new Date(t0.getTime() - 5000).toISOString(),
      ];
      snap.fatigue = { userFatigue: {}, beatFatigue: { economy: beatFatigue } };
      beatRoutingService.restore(snap);

      const signal = makeSignal({ id: 'sig-fat-2', keyEntities: ['RBI'], priority: 'P1', summary: 'repo rate decision' });
      const deliveries = beatRoutingService.routeAlert(signal, 'alt-fat-5', t0);

      expect(deliveries).toEqual([]);
      expect(beatRoutingService.getUserFatigueMetrics('reporter-01').alertsToday).toBe(0);
      expect(beatRoutingService.getBeatFatigueMetrics('economy').suppressedAlerts).toBe(1);
    });
  });

  describe('5. IDOR — beat-level access control', () => {
    it('IDOR-01: reporters only access assigned beats; editors/global roles have visibility', () => {
      const economySignal = makeSignal({ id: 'sig-idor-eco', keyEntities: ['RBI'], summary: 'repo rate decision' });
      const judiciarySignal = makeSignal({ id: 'sig-idor-jud', keyEntities: ['Supreme Court'], summary: 'verdict announced' });

      expect(beatRoutingService.checkUserAccess({ id: 'reporter-01', role: 'reporter' }, economySignal)).toBe(true);
      expect(beatRoutingService.checkUserAccess({ id: 'reporter-01', role: 'reporter' }, judiciarySignal)).toBe(false);
      expect(beatRoutingService.checkUserAccess({ id: 'reporter-02', role: 'reporter' }, judiciarySignal)).toBe(true);
      expect(beatRoutingService.checkUserAccess({ id: 'reporter-02', role: 'reporter' }, economySignal)).toBe(false);
      expect(beatRoutingService.checkUserAccess({ id: 'managing-editor-01', role: 'managing_editor' }, economySignal)).toBe(true);
      expect(beatRoutingService.checkUserAccess({ id: 'guest', role: 'guest' }, economySignal)).toBe(false);

      if (isDemoMode()) {
        expect(beatRoutingService.checkUserAccess({ id: 'demo-editor', role: 'editor' }, economySignal)).toBe(true);
        expect(beatRoutingService.checkUserAccess({ id: 'demo-editor', role: 'editor' }, judiciarySignal)).toBe(true);
      }
    });
  });

  describe('6. METRICS — real telemetry, not constants', () => {
    it('METRICS-01: empty state yields zeros (hardcoded constants removed)', () => {
      const core = new NewsroomIntelligenceCore();
      const m = core.getMetrics();
      expect(m.observationsPerMinute).toBe(0);
      expect(m.newClustersPerHour).toBe(0);
      expect(m.signalsPerHour).toBe(0);
      expect(m.medianTimeToSignalMs).toBe(0);
      expect(m.medianTimeToAlertMs).toBe(0);
      expect(m.primarySourceConfirmationRate).toBe(0);
      expect(m.falseAlertRate).toBe(0);
    });

    it('METRICS-02: seeded state reflects real observations within the window', () => {
      const core = new NewsroomIntelligenceCore();
      const now = new Date();
      const withinMinute = new Date(now.getTime() - 20_000);
      const outsideMinute = new Date(now.getTime() - 5 * 60_000);

      core.ingestObservation(makeObservation('m1', ['RBI'], withinMinute));
      core.ingestObservation(makeObservation('m2', ['RBI'], withinMinute));
      core.ingestObservation(makeObservation('m3', ['RBI'], outsideMinute));
      core.upsertCluster(
        makeCluster('cl-m1', ['RBI'], 'RBI decision', ['obs-m1', 'obs-m2', 'obs-m3'])
      );

      const m = core.getMetrics();
      expect(m.observationsPerMinute).toBe(2);
      expect(m.newClustersPerHour).toBe(1);
      expect(m.signalsPerHour).toBe(1);
      expect(m.alertVolume).toBe(1);
      expect(m.p0Count + m.p1Count + m.p2Count + m.p3Count).toBe(1);
    });
  });

  describe('7. BOOTSTRAP — idempotent runtime provisioning', () => {
    it('BOOTSTRAP-01: provisions canonical registry and seeds demo baseline only in demo mode', async () => {
      newsroomIntelligenceCore.clear();
      beatRoutingService.clear();
      NewsroomAuditService.clear();

      const first = await ensureNewsroomRuntime();
      expect(first.beatsProvisioned).toBe(16);
      expect(first.recipientsProvisioned).toBeGreaterThanOrEqual(10);
      expect(first.demoMode).toBe(isDemoMode());

      if (isDemoMode()) {
        expect(first.demoBaselineSeeded).toBe(true);
        expect(first.signalsSeeded).toBe(16);
      } else {
        expect(first.demoBaselineSeeded).toBe(false);
        expect(first.signalsSeeded).toBe(0);
      }

      const second = await ensureNewsroomRuntime();
      expect(second.demoBaselineSeeded).toBe(false);
      expect(second.signalsSeeded).toBe(0);
      expect(second.beatsProvisioned).toBe(16);
    });

    it('DEMO-01: demo identity is a registered global recipient only in demo mode', () => {
      expect(DEMO_USER.id).toBe('demo-editor');
      const recipient = beatRoutingService.getRecipient('demo-editor');
      if (isDemoMode()) {
        expect(recipient).toBeDefined();
        expect(recipient!.beatIds.length).toBe(16);
      } else {
        expect(recipient).toBeUndefined();
      }
    });
  });
});
