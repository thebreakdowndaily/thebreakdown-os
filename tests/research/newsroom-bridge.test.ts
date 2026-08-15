/**
 * ─── Research Intelligence — Newsroom Bridge Test ─────────────────────────────
 * Governing document: docs/research/source-governance.md
 *
 * Covers the gated News Intelligence → Research bridge: trigger precedence,
 * topic/entity resolution (no duplicate research universes), change-level
 * classification, evidence-oriented update alerts, signal mapping, and the
 * refusal semantics of the bridge factory without approved sources.
 */

import { ResearchIntelligenceCore } from '../../services/intelligence/research/core';
import { MemoryStateRepository } from '../../services/intelligence/research/persistence';
import { fixtureAdapter } from '../../services/intelligence/research/adapters/fixture';
import { ResearchSourceRegistry } from '../../services/intelligence/research/source-registry';
import {
  evaluateResearchTrigger,
  resolveResearchProject,
  classifyResearchChange,
  computeResearchRunDelta,
  buildResearchUpdateAlert,
  applyNewsEventToResearch,
  newsroomSignalToEvent,
  createNewsroomResearchBridge,
} from '../../services/intelligence/research/newsroom-bridge';
import type {
  NewsroomEventInput,
  TriggerEvaluation,
} from '../../services/intelligence/research/newsroom-bridge';
import type { ResearchRunDelta } from '../../types/research-intelligence';

function event(overrides: Partial<NewsroomEventInput> = {}): NewsroomEventInput {
  return {
    id: 'evt_1',
    title: 'India-US trade tariffs escalate',
    summary: 'New tariff measures shift the trade relationship between the two economies.',
    entities: ['India', 'United States', 'tariff'],
    priority: 'P1',
    firstDetectedAt: '2026-08-15T06:00:00.000Z',
    lastUpdatedAt: '2026-08-15T07:00:00.000Z',
    independentSourceCount: 3,
    primarySourceCount: 0,
    contradictionCount: 0,
    keyClaims: [],
    scores: { novelty: 40, velocity: 40, importance: 70 },
    ...overrides,
  };
}

function delta(overrides: Partial<ResearchRunDelta> = {}): ResearchRunDelta {
  return {
    newSources: 0,
    newPrimarySources: 0,
    newDocuments: 0,
    newClaims: 0,
    newContradictions: 0,
    resolvedGaps: 0,
    breakingDevelopment: false,
    ...overrides,
  };
}

async function freshCore(): Promise<{ core: ResearchIntelligenceCore; repository: MemoryStateRepository }> {
  ResearchIntelligenceCore.resetInstance();
  const repository = new MemoryStateRepository();
  const core = ResearchIntelligenceCore.getInstance(repository, [fixtureAdapter]);
  await core.ensureLoaded();
  return { core, repository };
}

const FIXTURE_DEPS = {
  adapters: [fixtureAdapter],
  createdBy: 'test',
  maxQueries: 24,
  maxSources: 40,
  maxDocuments: 40,
};

describe('News Intelligence → Research bridge', () => {
  describe('evaluateResearchTrigger', () => {
    it('P3 events are always filtered unless an explicit hint exists', () => {
      expect(evaluateResearchTrigger(event({ priority: 'P3' })).trigger).toBeNull();
      expect(
        evaluateResearchTrigger(event({ priority: 'P3', triggerHint: 'EDIT_REQUESTED' })).trigger
      ).toBe('EDIT_REQUESTED');
    });

    it('P2 events below every threshold are filtered', () => {
      expect(evaluateResearchTrigger(event({ priority: 'P2' })).trigger).toBeNull();
    });

    it('P2 high velocity triggers HIGH_SIGNAL_VELOCITY', () => {
      const g = evaluateResearchTrigger(event({ priority: 'P2', scores: { novelty: 20, velocity: 75, importance: 50 } }));
      expect(g.trigger).toBe('HIGH_SIGNAL_VELOCITY');
    });

    it('P2 high novelty with independent sources triggers NOVEL_EVENT', () => {
      const g = evaluateResearchTrigger(
        event({ priority: 'P2', scores: { novelty: 80, velocity: 30, importance: 50 }, independentSourceCount: 3 })
      );
      expect(g.trigger).toBe('NOVEL_EVENT');
    });

    it('P2 with a contradiction and a primary source triggers SIGNIFICANT_CLAIM', () => {
      const g = evaluateResearchTrigger(event({ priority: 'P2', contradictionCount: 1, primarySourceCount: 1 }));
      expect(g.trigger).toBe('SIGNIFICANT_CLAIM');
    });

    it('P1 triggers HIGH_IMPORTANCE', () => {
      expect(evaluateResearchTrigger(event({ priority: 'P1' })).trigger).toBe('HIGH_IMPORTANCE');
    });

    it('P1 with an independent primary source triggers BREAKING_DEVELOPMENT', () => {
      const g = evaluateResearchTrigger(event({ priority: 'P1', primarySourceCount: 1, independentSourceCount: 2 }));
      expect(g.trigger).toBe('BREAKING_DEVELOPMENT');
    });

    it('P0 always triggers BREAKING_DEVELOPMENT', () => {
      expect(evaluateResearchTrigger(event({ priority: 'P0' })).trigger).toBe('BREAKING_DEVELOPMENT');
    });

    it('keyword rules fire for court and government events', () => {
      const court: TriggerEvaluation = evaluateResearchTrigger(
        event({ priority: 'P2', title: 'Supreme Court rules on tariff powers' })
      );
      expect(court.trigger).toBe('COURT_DECISION');

      const govt: TriggerEvaluation = evaluateResearchTrigger(
        event({ priority: 'P2', title: 'Ministry issues new notification on steel imports' })
      );
      expect(govt.trigger).toBe('GOVERNMENT_ACTION');
    });

    it('policy keywords take precedence over government keywords', () => {
      const policy: TriggerEvaluation = evaluateResearchTrigger(
        event({ priority: 'P2', title: 'Government announces new trade policy' })
      );
      expect(policy.trigger).toBe('POLICY_CHANGE');
    });

    it('an explicit editor hint takes precedence over everything', () => {
      const g = evaluateResearchTrigger(event({ priority: 'P3', triggerHint: 'EDIT_REQUESTED' }));
      expect(g.trigger).toBe('EDIT_REQUESTED');
      expect(g.rationale.length).toBeGreaterThan(0);
    });
  });

  describe('resolveResearchProject', () => {
    it('resolves an event to an existing project with overlapping entities', async () => {
      const { core } = await freshCore();
      const project = core.createProject({ title: 'India-US trade tariffs', description: 'd', researchQuestion: 'q', createdBy: 'test' });
      project.status = 'ACTIVE';
      const resolved = resolveResearchProject(core, event());
      expect(resolved).toBeDefined();
      expect(resolved!.title).toContain('tariffs');
    });

    it('returns undefined for a disjoint topic', async () => {
      const { core } = await freshCore();
      core.createProject({ title: 'India-US trade tariffs', description: 'd', createdBy: 'test' });
      const unrelated = event({ title: 'Climate change summit in Brazil', entities: ['Brazil', 'climate'] });
      expect(resolveResearchProject(core, unrelated)).toBeUndefined();
    });

    it('does not resolve to completed or archived projects', async () => {
      const { core } = await freshCore();
      const project = core.createProject({ title: 'India-US trade tariffs', description: 'd', createdBy: 'test' });
      project.status = 'COMPLETED';
      expect(resolveResearchProject(core, event())).toBeUndefined();
    });
  });

  describe('classifyResearchChange', () => {
    it('breaking developments classify as BREAKING_DEVELOPMENT', () => {
      expect(classifyResearchChange(delta({ breakingDevelopment: true }))).toBe('BREAKING_DEVELOPMENT');
    });

    it('≥2 contradictions or primary+5 claims classify as MAJOR_CHANGE', () => {
      expect(classifyResearchChange(delta({ newContradictions: 2 }))).toBe('MAJOR_CHANGE');
      expect(classifyResearchChange(delta({ newPrimarySources: 1, newClaims: 6 }))).toBe('MAJOR_CHANGE');
      expect(classifyResearchChange(delta({ resolvedGaps: 1 }))).toBe('MAJOR_CHANGE');
    });

    it('any single material delta classifies as MEANINGFUL_CHANGE', () => {
      expect(classifyResearchChange(delta({ newClaims: 1 }))).toBe('MEANINGFUL_CHANGE');
      expect(classifyResearchChange(delta({ newContradictions: 1 }))).toBe('MEANINGFUL_CHANGE');
      expect(classifyResearchChange(delta({ newPrimarySources: 1 }))).toBe('MEANINGFUL_CHANGE');
    });

    it('sources/documents only classify as MINOR_CHANGE; empty as NO_CHANGE', () => {
      expect(classifyResearchChange(delta({ newSources: 3 }))).toBe('MINOR_CHANGE');
      expect(classifyResearchChange(delta({ newDocuments: 2 }))).toBe('MINOR_CHANGE');
      expect(classifyResearchChange(delta())).toBe('NO_CHANGE');
    });
  });

  describe('buildResearchUpdateAlert', () => {
    const project = {
      id: 'rp_test',
      title: 'India-US trade tariffs',
    };

    it('lists evidence-oriented items for a meaningful delta', () => {
      const alert = buildResearchUpdateAlert(
        project,
        delta({ newPrimarySources: 1, newContradictions: 1, newClaims: 4 }),
        'MEANINGFUL_CHANGE',
        'HIGH_IMPORTANCE'
      );
      expect(alert.level).toBe('MEANINGFUL_CHANGE');
      expect(alert.triggerReason).toBe('HIGH_IMPORTANCE');
      const kinds = alert.items.map((i) => i.kind);
      expect(kinds).toContain('NEW_PRIMARY_SOURCE');
      expect(kinds).toContain('CONTRADICTION');
      expect(kinds).toContain('NEW_CLAIMS');
    });

    it('surfaces a RESEARCH_NOTE when nothing changed', () => {
      const alert = buildResearchUpdateAlert(project, delta(), 'NO_CHANGE');
      expect(alert.items[0].kind).toBe('RESEARCH_NOTE');
    });
  });

  describe('applyNewsEventToResearch (fixture, offline)', () => {
    it('filters events below the researchTrigger gate', async () => {
      const { core } = await freshCore();
      const result = await applyNewsEventToResearch(core, event({ priority: 'P3' }), FIXTURE_DEPS);
      expect(result.filtered).toBe(true);
      expect(core.getProjects()).toHaveLength(0);
    });

    it('refuses to run with zero approved adapters', async () => {
      const { core } = await freshCore();
      const result = await applyNewsEventToResearch(core, event(), { adapters: [], createdBy: 'test' });
      expect(result.filtered).toBe(true);
      expect(core.getProjects()).toHaveLength(0);
    });

    it('creates a project and produces a run + delta + alert for a passing event', async () => {
      const { core } = await freshCore();
      const result = await applyNewsEventToResearch(core, event(), FIXTURE_DEPS);
      if (result.filtered) throw new Error(`expected applied event, filtered: ${result.reason}`);
      expect(result.created).toBe(true);
      expect(core.getProject(result.projectId)).toBeDefined();
      expect(result.run.status).toBe('COMPLETED');
      expect(result.delta.newSources).toBeGreaterThanOrEqual(0);
      expect(result.alert.items.length).toBeGreaterThanOrEqual(1);
      expect(result.alert.projectId).toBe(result.projectId);
    });

    it('appends a follow-up event to the existing project instead of duplicating it', async () => {
      const { core } = await freshCore();
      const first = await applyNewsEventToResearch(core, event(), FIXTURE_DEPS);
      if (first.filtered) throw new Error('expected first event applied');

      const second = await applyNewsEventToResearch(
        core,
        event({ id: 'evt_2', title: 'India-US trade tariffs escalate further' }),
        FIXTURE_DEPS
      );
      if (second.filtered) throw new Error('expected second event applied');

      expect(second.created).toBe(false);
      expect(second.projectId).toBe(first.projectId);
      const tariffProjects = core.getProjects().filter((p) => p.title.toLowerCase().includes('tariff'));
      expect(tariffProjects).toHaveLength(1);
    });
  });

  describe('computeResearchRunDelta', () => {
    it('returns a well-typed delta for a completed fixture run', async () => {
      const { core } = await freshCore();
      const result = await applyNewsEventToResearch(core, event(), FIXTURE_DEPS);
      if (result.filtered) throw new Error('expected applied event');
      const d = computeResearchRunDelta(core, result.run);
      expect(typeof d.newSources).toBe('number');
      expect(typeof d.newPrimarySources).toBe('number');
      expect(typeof d.newDocuments).toBe('number');
      expect(typeof d.newClaims).toBe('number');
      expect(typeof d.newContradictions).toBe('number');
      expect(typeof d.resolvedGaps).toBe('number');
      expect(typeof d.breakingDevelopment).toBe('boolean');
    });
  });

  describe('newsroomSignalToEvent', () => {
    it('maps a NewsroomSignal to the bridge input shape', () => {
      const mapped = newsroomSignalToEvent({
        id: 'sig_1',
        clusterId: 'clu_1',
        title: 'India-US trade tariffs escalate',
        summary: 's',
        firstDetectedAt: '2026-08-15T06:00:00.000Z',
        lastUpdatedAt: '2026-08-15T07:00:00.000Z',
        lifecycleState: 'monitoring',
        priority: 'P2',
        scores: { relevance: 80, importance: 70, novelty: 65, velocity: 70, evidenceStrength: 40, confidence: 60, uncertainty: 30, misinformationRisk: 20, sourceReliability: 80 },
        explanation: {
          priority: 'P2',
          compositeScore: 70,
          threshold: 50,
          triggeredRules: [],
          whyItMatters: '',
          evidenceBasis: [],
          recommendedAction: '',
        },
        observationCount: 4,
        independentSourceCount: 2,
        primarySourceCount: 1,
        keyEntities: ['India', 'United States'],
        keyClaims: ['c1'],
        contradictionIds: ['x1'],
        version: 1,
      });
      expect(mapped.id).toBe('sig_1');
      expect(mapped.priority).toBe('P2');
      expect(mapped.entities).toEqual(['India', 'United States']);
      expect(mapped.independentSourceCount).toBe(2);
      expect(mapped.primarySourceCount).toBe(1);
      expect(mapped.contradictionCount).toBe(1);
      expect(mapped.keyClaims).toEqual(['c1']);
      expect(mapped.scores).toEqual({ novelty: 65, velocity: 70, importance: 70 });
    });
  });

  describe('createNewsroomResearchBridge', () => {
    it('does nothing and never throws when the registry has zero eligible sources', async () => {
      const { core } = await freshCore();
      const empty = new ResearchSourceRegistry([
        {
          id: 'proposed',
          name: 'Proposed',
          publisher: 'P',
          sourceType: 'NEWS',
          adapter: 'rss',
          url: 'https://example.com/feed',
          canonicalDomain: 'example.com',
          authorityClass: 'HIGH_QUALITY_SECONDARY',
          primarySource: false,
          enabled: true,
          topics: [],
          geographies: ['GLOBAL'],
          priority: 'P2',
          refreshPolicy: 'DAILY',
          approvalStatus: 'PROPOSED',
        },
      ]);
      const handler = createNewsroomResearchBridge({ core, registry: empty });
      const signal = {
        id: 'sig_1',
        clusterId: 'clu_1',
        title: 'India-US trade tariffs escalate',
        summary: 's',
        firstDetectedAt: '2026-08-15T06:00:00.000Z',
        lastUpdatedAt: '2026-08-15T07:00:00.000Z',
        lifecycleState: 'monitoring',
        priority: 'P1',
        scores: { relevance: 80, importance: 70, novelty: 65, velocity: 70, evidenceStrength: 40, confidence: 60, uncertainty: 30, misinformationRisk: 20, sourceReliability: 80 },
        explanation: { priority: 'P1', compositeScore: 70, threshold: 50, triggeredRules: [], whyItMatters: '', evidenceBasis: [], recommendedAction: '' },
        observationCount: 4,
        independentSourceCount: 2,
        primarySourceCount: 1,
        keyEntities: ['India', 'United States'],
        keyClaims: ['c1'],
        contradictionIds: ['x1'],
        version: 1,
      };
      await expect(handler(signal)).resolves.toBeUndefined();
      expect(core.getProjects()).toHaveLength(0);
    });
  });
});
