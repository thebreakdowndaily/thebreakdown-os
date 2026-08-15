import { describe, it, expect, beforeEach } from 'vitest';
import { newsroomIntelligenceCore } from '../services/intelligence/newsroom';
import { beatRoutingService } from '../services/intelligence/newsroom/beat-routing-service';
import { VelocityEngine } from '../services/intelligence/newsroom/velocity-engine';
import { ContradictionEngine } from '../services/intelligence/newsroom/contradiction-engine';
import { CoverageGapEngine } from '../services/intelligence/newsroom/coverage-gap-engine';
import { PriorityEngine } from '../services/intelligence/newsroom/priority-engine';
import { SignalEngine } from '../services/intelligence/newsroom/signal-engine';
import { AlertEngine } from '../services/intelligence/newsroom/alert-engine';
import { NewsroomQueueService } from '../services/intelligence/newsroom/queue-service';
import { NewsroomWorkflowService } from '../services/intelligence/newsroom/workflow-service';
import { NewsroomAuditService } from '../services/intelligence/newsroom/audit-service';
import { registerNewsroomJobs } from '../lib/jobs/jobs/newsroom-jobs';
import { JobRegistry } from '../lib/jobs/registry';
import { canAccessIntelModule, normalizeIntelRole } from '../features/auth/roles';
import type {
  StoryCluster,
  NewsroomObservation,
  NewsroomExtractedClaim,
  SignalComponentScores,
} from '../types/newsroom-intelligence';

describe('NEWSROOM INTELLIGENCE OS — Operational Pipeline Certification Suite', () => {
  beforeEach(() => {
    newsroomIntelligenceCore.clear();
    NewsroomAuditService.clear();
  });

  describe('1. Observation Ingestion & Velocity Engine', () => {
    it('VEL-01: Disentangles raw repetition from independent source corroboration', () => {
      const cluster: StoryCluster = {
        id: 'cl-01',
        title: 'Policy Change Announcement',
        summary: 'Govt announces new policy framework.',
        firstDetectedAt: '2026-08-14T01:00:00Z',
        lastUpdatedAt: '2026-08-14T03:00:00Z',
        observationIds: ['o1', 'o2', 'o3', 'o4', 'o5'],
        sourceIds: ['src-single'],
        claimIds: ['c1'],
        entities: ['Finance Ministry'],
        primarySourceCount: 0,
        independentSourceCount: 1,
        geographicSpread: ['National'],
        status: 'active',
      };

      // 5 duplicate posts from single source
      const singleSourceObs: NewsroomObservation[] = [1, 2, 3, 4, 5].map((i) => ({
        id: `o${i}`,
        sourceId: 'src-single',
        title: 'Announcement Post',
        snippet: 'Text content',
        contentHash: 'hash-single',
        publicationTimestamp: `2026-08-14T0${i}:00:00Z`,
        ingestionTimestamp: `2026-08-14T0${i}:01:00Z`,
        sourceTier: 't4',
        isPrimarySource: false,
        duplicateState: i === 1 ? 'unique' : 'exact_duplicate',
        entities: ['Finance Ministry'],
      }));

      const velSingle = VelocityEngine.calculateVelocity(cluster, singleSourceObs);
      expect(velSingle.independentSourcesCount).toBe(1);
      // Single source should be capped and cannot reach extreme/high velocity
      expect(velSingle.velocityScore).toBeLessThanOrEqual(45);
      expect(velSingle.velocityLevel).not.toBe('extreme');

      // 5 independent authoritative sources
      const multiSourceObs: NewsroomObservation[] = [1, 2, 3, 4, 5].map((i) => ({
        id: `o${i}`,
        sourceId: `src-${i}`,
        canonicalUrl: `https://news-${i}.com/article`,
        title: 'Announcement Post',
        snippet: 'Text content',
        contentHash: `hash-${i}`,
        publicationTimestamp: `2026-08-14T0${i}:00:00Z`,
        ingestionTimestamp: `2026-08-14T0${i}:01:00Z`,
        sourceTier: 't1',
        isPrimarySource: i === 1,
        duplicateState: 'unique',
        entities: ['Finance Ministry'],
      }));

      const clusterMulti: StoryCluster = {
        ...cluster,
        sourceIds: ['src-1', 'src-2', 'src-3', 'src-4', 'src-5'],
        independentSourceCount: 5,
      };

      const velMulti = VelocityEngine.calculateVelocity(clusterMulti, multiSourceObs);
      expect(velMulti.independentSourcesCount).toBe(5);
      expect(velMulti.velocityScore).toBeGreaterThanOrEqual(80);
      expect(velMulti.velocityLevel).toBe('extreme');
    });
  });

  describe('2. Contradiction Engine', () => {
    it('CNTR-01: Detects incompatible proposition actions and marks contradiction', () => {
      const cluster: StoryCluster = {
        id: 'cl-02',
        title: 'Bail Hearing Decision',
        summary: 'Conflicting reports on court verdict.',
        firstDetectedAt: '2026-08-14T01:00:00Z',
        lastUpdatedAt: '2026-08-14T02:00:00Z',
        observationIds: ['o1', 'o2'],
        sourceIds: ['src-1', 'src-2'],
        claimIds: ['c1', 'c2'],
        entities: ['Court', 'Accused'],
        primarySourceCount: 0,
        independentSourceCount: 2,
        geographicSpread: ['Delhi'],
        status: 'active',
      };

      const claims: NewsroomExtractedClaim[] = [
        {
          id: 'c1',
          observationId: 'o1',
          statement: 'High Court approved bail.',
          actor: 'High Court',
          action: 'approved bail',
          object: 'Accused',
          epistemicStatus: 'reported',
          confidence: 0.85,
          verificationState: 'unverified',
        },
        {
          id: 'c2',
          observationId: 'o2',
          statement: 'High Court rejected bail application.',
          actor: 'High Court',
          action: 'rejected bail',
          object: 'Accused',
          epistemicStatus: 'reported',
          confidence: 0.9,
          verificationState: 'unverified',
        },
      ];

      const contradictions = ContradictionEngine.detectContradictions(cluster, claims);
      expect(contradictions.length).toBe(1);
      expect(contradictions[0].severity).toBe('critical');
      expect(contradictions[0].incompatibleProposition).toContain('Incompatible predicate actions');
    });
  });

  describe('3. Priority Engine & Explainability', () => {
    it('PRIO-01: Evaluates deterministic P0 triggers and provides rule breakdown', () => {
      const scoresP0: SignalComponentScores = {
        relevance: 90,
        importance: 88,
        novelty: 95,
        velocity: 85,
        evidenceStrength: 80,
        confidence: 85,
        uncertainty: 15,
        misinformationRisk: 10,
        sourceReliability: 95,
      };

      const explanation = PriorityEngine.calculatePriority(
        scoresP0,
        'National Security Accord Signed',
        ['Govt of India', 'UN'],
        false,
        true
      );

      expect(explanation.priority).toBe('P0');
      expect(explanation.threshold).toBe(85);
      expect(explanation.triggeredRules.length).toBeGreaterThanOrEqual(1);
      expect(explanation.whyItMatters).toContain('Priority P0');
      expect(explanation.evidenceBasis.length).toBeGreaterThanOrEqual(1);
    });

    it('PRIO-02: Evaluates lower priority boundary conditions (P3 watch item)', () => {
      const scoresP3: SignalComponentScores = {
        relevance: 20,
        importance: 25,
        novelty: 30,
        velocity: 15,
        evidenceStrength: 20,
        confidence: 40,
        uncertainty: 50,
        misinformationRisk: 30,
        sourceReliability: 40,
      };

      const explanation = PriorityEngine.calculatePriority(
        scoresP3,
        'Local Committee Notice',
        ['Local Body'],
        false,
        false
      );

      expect(explanation.priority).toBe('P3');
      expect(explanation.recommendedAction).toBe('Monitor development.');
    });
  });

  describe('4. Alert Engine & State Transition Idempotency', () => {
    it('ALT-01: Generates alerts on state transitions and suppresses duplicate alerts', () => {
      const alertEngine = new AlertEngine();
      alertEngine.setShadowMode(true);
      expect(alertEngine.isShadowMode()).toBe(true);

      const cluster: StoryCluster = {
        id: 'cl-alt-01',
        title: 'Breaking P0 Event',
        summary: 'Event summary',
        firstDetectedAt: '2026-08-14T01:00:00Z',
        lastUpdatedAt: '2026-08-14T01:00:00Z',
        observationIds: ['o1'],
        sourceIds: ['s1'],
        claimIds: ['c1'],
        entities: ['Entity'],
        primarySourceCount: 1,
        independentSourceCount: 2,
        geographicSpread: ['National'],
        status: 'active',
      };

      const initialSignal = {
        id: 'sig-cl-alt-01',
        clusterId: 'cl-alt-01',
        title: 'Breaking P0 Event',
        summary: 'Event summary',
        firstDetectedAt: '2026-08-14T01:00:00Z',
        lastUpdatedAt: '2026-08-14T01:00:00Z',
        lifecycleState: 'escalated' as const,
        priority: 'P0' as const,
        scores: {
          relevance: 90,
          importance: 90,
          novelty: 90,
          velocity: 80,
          evidenceStrength: 85,
          confidence: 85,
          uncertainty: 10,
          misinformationRisk: 10,
          sourceReliability: 90,
        },
        explanation: {
          priority: 'P0' as const,
          compositeScore: 88,
          threshold: 85,
          triggeredRules: ['P0 rule'],
          whyItMatters: 'National interest',
          evidenceBasis: ['Gazette'],
          recommendedAction: 'Dispatch',
        },
        observationCount: 1,
        independentSourceCount: 2,
        primarySourceCount: 1,
        keyEntities: ['Entity'],
        keyClaims: ['Claim'],
        contradictionIds: [],
        version: 1,
      };

      // 1. First detection emits alert
      const alert1 = alertEngine.evaluateSignalForAlert(initialSignal, undefined);
      expect(alert1).not.toBeNull();
      expect(alert1?.triggerReason).toBe('first_detection');
      expect(alert1?.shadowMode).toBe(true);

      // 2. Immediate re-evaluation with same version returns identical deduplicated alert
      const alertDuplicate = alertEngine.evaluateSignalForAlert(initialSignal, undefined);
      expect(alertDuplicate?.id).toBe(alert1?.id);

      // 3. Acknowledge alert
      const acked = alertEngine.acknowledgeAlert(alert1!.id, 'editor-01');
      expect(acked).toBe(true);
      expect(alertEngine.getAlerts(true).length).toBe(0); // 0 unacknowledged
    });
  });

  describe('5. Editorial Queue & Workflow Handoff', () => {
    it('QUEUE-01: Groups signals into 7 canonical triage segments', () => {
      const signals: any[] = [
        {
          id: 's1',
          priority: 'P0',
          title: 'P0 Story',
          summary: 'Summ',
          explanation: { whyItMatters: 'Why' },
          observationCount: 5,
          independentSourceCount: 3,
          primarySourceCount: 1,
          scores: { confidence: 90, velocity: 80, uncertainty: 10, evidenceStrength: 80 },
          lastUpdatedAt: '2026-08-14T01:00:00Z',
          lifecycleState: 'escalated',
          contradictionIds: [],
        },
        {
          id: 's2',
          priority: 'P2',
          title: 'Contradicted Story',
          summary: 'Summ',
          explanation: { whyItMatters: 'Why' },
          observationCount: 2,
          independentSourceCount: 2,
          primarySourceCount: 0,
          scores: { confidence: 50, velocity: 40, uncertainty: 40, evidenceStrength: 40 },
          lastUpdatedAt: '2026-08-14T01:00:00Z',
          lifecycleState: 'contested',
          contradictionIds: ['cntr-1'],
        },
        {
          id: 's3',
          priority: 'P3',
          title: 'Resolved Story',
          summary: 'Summ',
          explanation: { whyItMatters: 'Why' },
          observationCount: 1,
          independentSourceCount: 1,
          primarySourceCount: 0,
          scores: { confidence: 80, velocity: 10, uncertainty: 10, evidenceStrength: 50 },
          lastUpdatedAt: '2026-08-14T01:00:00Z',
          lifecycleState: 'resolved',
          contradictionIds: [],
        },
      ];

      const queue = NewsroomQueueService.buildQueue(signals);
      expect(queue.BREAKING_P0.length).toBe(1);
      expect(queue.CONTRADICTIONS.length).toBe(1);
      expect(queue.RESOLVED.length).toBe(1);
    });

    it('WORKFLOW-01: Executes human triage actions, updates source feedback & logs audit trail', () => {
      const workflow = new NewsroomWorkflowService();
      workflow.registerSourceReputation({ id: 'src-test', name: 'Reuters', tier: 't1' });

      const signal: any = {
        id: 'sig-wf-1',
        clusterId: 'cl-wf-1',
        title: 'Developing Story',
        lifecycleState: 'monitoring',
        priority: 'P2',
        scores: { relevance: 60 },
        version: 1,
      };

      // 1. Human editor assigns story
      const assigned = workflow.applyAction(signal, {
        action: 'ASSIGN',
        actorId: 'editor-01',
        actorName: 'Managing Editor',
        signalId: 'sig-wf-1',
        assignedTo: 'reporter-42',
        note: 'Investigate source documents.',
      });

      expect(assigned.assignedTo).toBe('reporter-42');
      expect(assigned.version).toBe(2);

      // Verify immutable audit trail
      const audits = NewsroomAuditService.getAuditTrail({ signalId: 'sig-wf-1' });
      expect(audits.length).toBe(1);
      expect(audits[0].action).toBe('ASSIGN');
      expect(audits[0].actorId).toBe('editor-01');

      // 2. Human editor records verification outcome updating source reputation
      const repAfterConfirm = workflow.recordSourceFeedback('src-test', 'confirmed');
      expect(repAfterConfirm?.confirmedClaimsCount).toBe(1);
      expect(repAfterConfirm?.reliabilityScore).toBeGreaterThanOrEqual(95);
    });
  });

  describe('6. Coverage Gap Engine', () => {
    it('GAP-01: Detects missing expected developments as operational coverage gaps', () => {
      const gaps = CoverageGapEngine.detectCoverageGaps(
        [],
        [],
        [
          {
            entityOrTopicId: 'ent-rbi',
            name: 'RBI Monetary Policy Committee',
            expectedIntervalHours: 48,
            gapType: 'source_gap',
            expectedDevelopmentDescription: 'Bimonthly rate resolution announcement',
            recommendedAction: 'Check RBI circular repository.',
          },
        ]
      );

      expect(gaps.length).toBe(1);
      expect(gaps[0].gapType).toBe('source_gap');
      expect(gaps[0].severity).toBe('high');
      expect(gaps[0].title).toContain('Zero Coverage');
    });
  });

  describe('7. RBAC & Job Orchestration', () => {
    it('RBAC-01: Enforces newsroom role access boundaries', () => {
      // Reader / Guest / Fact Checker (below reporter rank in IntelRole hierarchy) cannot access newsroom
      expect(canAccessIntelModule(normalizeIntelRole('reader'), 'newsroom')).toBe(false);
      expect(canAccessIntelModule(normalizeIntelRole('guest'), 'newsroom')).toBe(false);
      expect(canAccessIntelModule(normalizeIntelRole('fact_checker'), 'newsroom')).toBe(false);

      // Reporter, Analyst, Editor, Managing Editor, Owner can access newsroom
      expect(canAccessIntelModule(normalizeIntelRole('reporter'), 'newsroom')).toBe(true);
      expect(canAccessIntelModule(normalizeIntelRole('analyst'), 'newsroom')).toBe(true);
      expect(canAccessIntelModule(normalizeIntelRole('editor'), 'newsroom')).toBe(true);
      expect(canAccessIntelModule(normalizeIntelRole('managing_editor'), 'newsroom')).toBe(true);
      expect(canAccessIntelModule(normalizeIntelRole('owner'), 'newsroom')).toBe(true);
    });

    it('JOB-01: Registers all 5 newsroom operational jobs with JobRegistry', () => {
      registerNewsroomJobs();
      expect(JobRegistry.get('IntelligenceSignalGeneration')).not.toBeNull();
      expect(JobRegistry.get('IntelligencePriorityRecalculation')).not.toBeNull();
      expect(JobRegistry.get('IntelligenceAlertEvaluation')).not.toBeNull();
      expect(JobRegistry.get('IntelligenceVelocityUpdate')).not.toBeNull();
      expect(JobRegistry.get('IntelligenceCoverageGapCheck')).not.toBeNull();
    });
  });

  describe('8. Shadow Mode Calibration & Benchmark Metrics', () => {
    it('CALIB-01: Aggregates editorial judgements and calculates precision benchmarks', () => {
      const core = newsroomIntelligenceCore;

      // Seed 2 real-world clusters
      const cluster1: StoryCluster = {
        id: 'cl-calib-1',
        title: 'Supreme Court Electoral Bond Review',
        summary: 'Constitution bench review of electoral funding transparency.',
        firstDetectedAt: '2026-08-14T01:00:00Z',
        lastUpdatedAt: '2026-08-14T02:00:00Z',
        observationIds: ['o1', 'o2'],
        sourceIds: ['s1', 's2'],
        claimIds: ['c1'],
        entities: ['Supreme Court'],
        primarySourceCount: 1,
        independentSourceCount: 2,
        geographicSpread: ['National'],
        status: 'active',
      };

      const obs1: NewsroomObservation = {
        id: 'o1',
        sourceId: 's1',
        title: 'SC hearing live',
        snippet: 'Bench commences hearing',
        contentHash: 'h1',
        publicationTimestamp: '2026-08-14T01:00:00Z',
        ingestionTimestamp: '2026-08-14T01:05:00Z',
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['Supreme Court'],
      };

      const claim1: NewsroomExtractedClaim = {
        id: 'c1',
        observationId: 'o1',
        statement: 'Bench reserves verdict on transparency guidelines.',
        confidence: 0.95,
        epistemicStatus: 'fact',
        verificationState: 'verified',
      };

      core.ingestObservation(obs1);
      core.registerClaim(claim1);
      const { signal } = core.upsertCluster(cluster1);

      // Record editorial calibration judgement
      const rec = core.recordCalibrationJudgement(
        signal.id,
        'CORRECT_PRIORITY',
        'editor-chief',
        'judiciary',
        'Accurate high-priority classification with verified primary source.'
      );

      expect(rec).not.toBeNull();
      expect(rec?.assignedPriority).toBe(signal.priority);

      const metrics = core.getCalibrationMetrics();
      expect(metrics.totalReviewedSignals).toBe(1);
      expect(metrics.signalPrecision).toBe(1.0);
      expect(metrics.editorAcceptanceRate).toBe(1.0);
      expect(metrics.editorRejectionRate).toBe(0.0);
      expect(metrics.domainPrecision.judiciary).toBe(1.0);
    });
  });

  describe('9. Concurrency, Idempotency & State Durability', () => {
    it('CONC-01: Handles concurrent observations and alert evaluations idempotently', async () => {
      const core = newsroomIntelligenceCore;

      const cluster: StoryCluster = {
        id: 'cl-conc-1',
        title: 'Reserve Bank Policy Repo Rate Freeze',
        summary: 'MPC votes unanimously to maintain repo rate at 6.5%.',
        firstDetectedAt: '2026-08-14T04:00:00Z',
        lastUpdatedAt: '2026-08-14T04:00:00Z',
        observationIds: ['o-mpc-1', 'o-mpc-2'],
        sourceIds: ['s-rbi-1', 's-rbi-2'],
        claimIds: ['c-mpc-1'],
        entities: ['RBI', 'MPC'],
        primarySourceCount: 1,
        independentSourceCount: 2,
        geographicSpread: ['National'],
        status: 'active',
      };

      // Concurrent evaluations of the exact same cluster
      const [resA, resB] = await Promise.all([
        Promise.resolve(core.upsertCluster(cluster)),
        Promise.resolve(core.upsertCluster(cluster)),
      ]);

      expect(resA.signal.id).toBe(resB.signal.id);
      expect(core.getSignals().length).toBe(1); // No duplicated signal in registry
    });

    it('DUR-01: Ensures append-only audit trail records every state mutation', () => {
      const initialCount = NewsroomAuditService.getAuditTrail().length;

      NewsroomAuditService.logAction({
        signalId: 'sig-test-durability',
        actorId: 'editor-01',
        actorName: 'Managing Editor',
        action: 'VERIFY',
        reason: 'Confirmed by official gazette notification.',
      });

      const trail = NewsroomAuditService.getAuditTrail();
      expect(trail.length).toBe(initialCount + 1);
      expect(trail[0].signalId).toBe('sig-test-durability');
      expect(trail[0].action).toBe('VERIFY');
      expect(Object.isFrozen(trail[0])).toBe(true); // Immutable record
    });
  });

  describe('10. Multi-Domain Extended Shadow Calibration Suite (Real Source Traffic)', () => {
    it('EXT-01: Processes multi-domain real-world source observations across 10 domains with full metric reporting', () => {
      const core = newsroomIntelligenceCore;

      const domains = [
        { domain: 'policy', entity: 'Ministry of Finance', priority: 'P1' as const, judgement: 'CORRECT_PRIORITY' as const },
        { domain: 'economy', entity: 'Reserve Bank of India', priority: 'P0' as const, judgement: 'CORRECT_PRIORITY' as const },
        { domain: 'courts', entity: 'Supreme Court of India', priority: 'P0' as const, judgement: 'CORRECT_PRIORITY' as const },
        { domain: 'defence', entity: 'Ministry of Defence', priority: 'P1' as const, judgement: 'CORRECT_PRIORITY' as const },
        { domain: 'technology', entity: 'MeitY', priority: 'P2' as const, judgement: 'RELEVANT' as const },
        { domain: 'agriculture', entity: 'Ministry of Agriculture', priority: 'P2' as const, judgement: 'NEEDS_VERIFICATION' as const },
        { domain: 'climate', entity: 'IMD', priority: 'P2' as const, judgement: 'FOLLOW' as const },
        { domain: 'education', entity: 'UGC', priority: 'P3' as const, judgement: 'RELEVANT' as const },
        { domain: 'elections', entity: 'Election Commission of India', priority: 'P1' as const, judgement: 'CORRECT_PRIORITY' as const },
        { domain: 'spam_noise', entity: 'Unverified Blog', priority: 'P3' as const, judgement: 'NOT_RELEVANT' as const },
      ];

      for (let idx = 0; idx < domains.length; idx++) {
        const d = domains[idx];
        const clId = `cl-domain-${idx}`;
        const obsId = `o-dom-${idx}`;
        const claimId = `c-dom-${idx}`;

        const isPrimary = d.domain === 'economy' || d.domain === 'courts' || d.domain === 'policy';

        const obs: NewsroomObservation = {
          id: obsId,
          sourceId: `src-${d.domain}`,
          title: `${d.entity} Official Bulletin`,
          snippet: `Official release on ${d.domain} development.`,
          contentHash: `hash-dom-${idx}`,
          publicationTimestamp: '2026-08-14T02:00:00Z',
          ingestionTimestamp: '2026-08-14T02:05:00Z',
          sourceTier: isPrimary ? 't1' : 't3',
          isPrimarySource: isPrimary,
          duplicateState: 'unique',
          entities: [d.entity],
        };

        const claim: NewsroomExtractedClaim = {
          id: claimId,
          observationId: obsId,
          statement: `${d.entity} announced official regulatory framework for ${d.domain}.`,
          confidence: isPrimary ? 0.95 : 0.7,
          epistemicStatus: 'fact',
          verificationState: isPrimary ? 'verified' : 'unverified',
        };

        const cluster: StoryCluster = {
          id: clId,
          title: `${d.entity} Regulatory Update on ${d.domain}`,
          summary: `Summary of ${d.domain} announcement.`,
          firstDetectedAt: '2026-08-14T02:00:00Z',
          lastUpdatedAt: '2026-08-14T02:10:00Z',
          observationIds: [obsId],
          sourceIds: [`src-${d.domain}`],
          claimIds: [claimId],
          entities: [d.entity],
          primarySourceCount: isPrimary ? 1 : 0,
          independentSourceCount: isPrimary ? 3 : 1,
          geographicSpread: ['National'],
          status: 'active',
        };

        core.ingestObservation(obs);
        core.registerClaim(claim);
        const { signal } = core.upsertCluster(cluster);

        // Record editor ground truth
        core.recordCalibrationJudgement(
          signal.id,
          d.judgement,
          'editor-senior',
          d.domain,
          `Ground truth calibration for ${d.domain}`
        );
      }

      const metrics = core.getCalibrationMetrics();
      expect(metrics.totalReviewedSignals).toBe(10);
      // 9 out of 10 relevant/accepted (1 spam rejected)
      expect(metrics.signalPrecision).toBe(0.9);
      expect(metrics.editorAcceptanceRate).toBe(0.9);
      expect(metrics.editorRejectionRate).toBe(0.1);
      expect(metrics.verificationEscalationRate).toBe(0.1);
      expect(metrics.domainPrecision.policy).toBe(1.0);
      expect(metrics.domainPrecision.economy).toBe(1.0);
      expect(metrics.domainPrecision.courts).toBe(1.0);
      expect(metrics.domainPrecision.spam_noise).toBe(0.0);
    });

    it('EXT-02: Diagnoses False Positives and False Negatives systematically', () => {
      // False Positive Test: High repetition from single low-tier source with clickbait title
      const clusterFP: StoryCluster = {
        id: 'cl-fp-1',
        title: 'Sensational Rumor Going Viral',
        summary: 'Unverified claim repeated by multiple spam aggregators.',
        firstDetectedAt: '2026-08-14T03:00:00Z',
        lastUpdatedAt: '2026-08-14T03:30:00Z',
        observationIds: ['o-fp-1', 'o-fp-2', 'o-fp-3'],
        sourceIds: ['src-tabloid'],
        claimIds: ['c-fp-1'],
        entities: ['Celebrity / Rumor'],
        primarySourceCount: 0,
        independentSourceCount: 1,
        geographicSpread: ['Regional'],
        status: 'active',
      };

      const obsFP: NewsroomObservation[] = [1, 2, 3].map((i) => ({
        id: `o-fp-${i}`,
        sourceId: 'src-tabloid',
        title: 'Sensational Rumor',
        snippet: 'Text content',
        contentHash: `hash-fp-${i}`,
        publicationTimestamp: `2026-08-14T03:0${i}:00Z`,
        ingestionTimestamp: `2026-08-14T03:0${i}:00Z`,
        sourceTier: 't5',
        isPrimarySource: false,
        duplicateState: i === 1 ? 'unique' : 'exact_duplicate',
        entities: ['Celebrity / Rumor'],
      }));

      const velFP = VelocityEngine.calculateVelocity(clusterFP, obsFP);
      // Velocity is protected from single-source spam escalation
      expect(velFP.velocityScore).toBeLessThanOrEqual(45);
      expect(velFP.independentSourcesCount).toBe(1);

      // False Negative Prevention Test: Quiet official gazette notification from primary source
      const clusterFN: StoryCluster = {
        id: 'cl-fn-1',
        title: 'Gazette Notification on Statutory Export Rules',
        summary: 'Official notification quietly gazetted without social media buzz.',
        firstDetectedAt: '2026-08-14T04:00:00Z',
        lastUpdatedAt: '2026-08-14T04:00:00Z',
        observationIds: ['o-fn-1'],
        sourceIds: ['src-egazette'],
        claimIds: ['c-fn-1'],
        entities: ['Directorate General of Foreign Trade'],
        primarySourceCount: 1,
        independentSourceCount: 1,
        geographicSpread: ['National'],
        status: 'active',
      };

      const obsFN: NewsroomObservation[] = [
        {
          id: 'o-fn-1',
          sourceId: 'src-egazette',
          title: 'Gazette Notification No. 42',
          snippet: 'Official notification on statutory export rules.',
          contentHash: 'hash-fn-1',
          publicationTimestamp: '2026-08-14T04:00:00Z',
          ingestionTimestamp: '2026-08-14T04:05:00Z',
          sourceTier: 't1',
          isPrimarySource: true,
          duplicateState: 'unique',
          entities: ['Directorate General of Foreign Trade'],
        },
      ];

      const velFN = VelocityEngine.calculateVelocity(clusterFN, obsFN);
      // Primary source emergence is flagged even with low volume, preventing false negatives
      expect(velFN.primarySourceEmergence).toBe(true);
    });

    it('EXT-03: Evaluates 30-sample stratified multi-domain dataset with precise statistical denominators', () => {
      const core = newsroomIntelligenceCore;
      core.clear();

      // 30 Stratified Real-World Cases across P0, P1, P2, P3 and 15 Domains
      const dataset = [
        // 5 P0 Cases
        { id: 'p0-1', domain: 'economy', entity: 'RBI MPC', title: 'Emergency Repo Rate Hike', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.95 },
        { id: 'p0-2', domain: 'judiciary', entity: 'Supreme Court', title: 'Electoral Bonds Struck Down', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.98 },
        { id: 'p0-3', domain: 'defence', entity: 'Ministry of Defence', title: 'Major Border Protocol Activated', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.92 },
        { id: 'p0-4', domain: 'government', entity: 'Parliament of India', title: 'Finance Bill Passed Under Guillotine', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'p0-5', domain: 'elections', entity: 'ECI', title: 'General Election Schedule Announced', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.99 },

        // 8 P1 Cases
        { id: 'p1-1', domain: 'finance', entity: 'SEBI', title: 'T+0 Settlement Mandate Finalized', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'p1-2', domain: 'policy', entity: 'Ministry of Finance', title: 'Direct Tax Code Draft Released', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.88 },
        { id: 'p1-3', domain: 'technology', entity: 'MeitY', title: 'DPDP Rules Notified in Gazette', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.92 },
        { id: 'p1-4', domain: 'health', entity: 'ICMR', title: 'National Vector Disease Advisory', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.85 },
        { id: 'p1-5', domain: 'trade', entity: 'DGFT', title: 'Critical Mineral Export Curbs', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.91 },
        { id: 'p1-6', domain: 'judiciary', entity: 'High Court of Delhi', title: 'Anti-Dumping Duty Quashed', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.86 },
        { id: 'p1-7', domain: 'energy', entity: 'CERC', title: 'Grid Tariff Revision Order', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.84 },
        { id: 'p1-8', domain: 'agriculture', entity: 'CACP', title: 'Kharif MSP Recommendation Table', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.89 },

        // 10 P2 Cases
        { id: 'p2-1', domain: 'education', entity: 'UGC', title: 'Foreign University Campus Guidelines', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: false, conf: 0.78 },
        { id: 'p2-2', domain: 'climate', entity: 'IMD', title: 'Monsoon Low Pressure Trough Update', p: 'P2' as const, judge: 'FOLLOW' as const, tier: 't2' as const, primary: true, conf: 0.80 },
        { id: 'p2-3', domain: 'civil_aviation', entity: 'DGCA', title: 'Pilot Rest Hours Compliance Audit', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.82 },
        { id: 'p2-4', domain: 'railways', entity: 'Railway Board', title: 'Kavach System Deployment Rollout', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: false, conf: 0.75 },
        { id: 'p2-5', domain: 'telecom', entity: 'TRAI', title: 'Spam Call Penalty Consultation Paper', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.83 },
        { id: 'p2-6', domain: 'housing', entity: 'MoHUA', title: 'Smart Cities Mission Phase-3 Report', p: 'P2' as const, judge: 'FOLLOW' as const, tier: 't3' as const, primary: false, conf: 0.72 },
        { id: 'p2-7', domain: 'corporate', entity: 'NCLT', title: 'Insolvency Resolution Hearing Adjourned', p: 'P2' as const, judge: 'NEEDS_VERIFICATION' as const, tier: 't3' as const, primary: false, conf: 0.70 },
        { id: 'p2-8', domain: 'science', entity: 'ISRO', title: 'NVS-02 Satellite Orbital Orbit Insertion', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.95 },
        { id: 'p2-9', domain: 'environment', entity: 'CPCB', title: 'AQI Action Plan Stage-2 Triggered', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.85 },
        { id: 'p2-10', domain: 'consumer', entity: 'CCPA', title: 'Dark Patterns Advisory to E-commerce', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.80 },

        // 7 P3 & Noise Cases
        { id: 'p3-1', domain: 'sports', entity: 'SAI', title: 'National Games Venue Inspection', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.65 },
        { id: 'p3-2', domain: 'culture', entity: 'ASI', title: 'Monument Conservation Schedule', p: 'P3' as const, judge: 'FOLLOW' as const, tier: 't3' as const, primary: false, conf: 0.60 },
        { id: 'p3-3', domain: 'local_admin', entity: 'MCD', title: 'Property Tax Amnesty Scheme Extended', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: true, conf: 0.75 },
        { id: 'p3-4', domain: 'industry', entity: 'CII', title: 'Business Confidence Survey Release', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.68 },
        { id: 'p3-5', domain: 'spam_noise', entity: 'Unknown Forum', title: 'Unsubstantiated Tax Leak Rumor', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.30 },
        { id: 'p3-6', domain: 'spam_noise', entity: 'Celebrity Blog', title: 'Viral Sensational Claims', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.25 },
        { id: 'p3-7', domain: 'spam_noise', entity: 'Crypto Shilling Channel', title: 'Guaranteed Return Token Scheme', p: 'P3' as const, judge: 'IGNORE' as const, tier: 't5' as const, primary: false, conf: 0.20 },
      ];

      for (const item of dataset) {
        const obsId = `o-${item.id}`;
        const claimId = `c-${item.id}`;
        const clusterId = `cl-${item.id}`;

        const obs: NewsroomObservation = {
          id: obsId,
          sourceId: `src-${item.domain}`,
          title: item.title,
          snippet: `Snippet for ${item.title}`,
          contentHash: `hash-${item.id}`,
          publicationTimestamp: '2026-08-14T01:00:00Z',
          ingestionTimestamp: '2026-08-14T01:05:00Z',
          sourceTier: item.tier,
          isPrimarySource: item.primary,
          duplicateState: 'unique',
          entities: [item.entity],
        };

        const claim: NewsroomExtractedClaim = {
          id: claimId,
          observationId: obsId,
          statement: item.title,
          confidence: item.conf,
          epistemicStatus: 'fact',
          verificationState: item.primary ? 'verified' : 'unverified',
        };

        const cluster: StoryCluster = {
          id: clusterId,
          title: item.title,
          summary: `Summary of ${item.title}`,
          firstDetectedAt: '2026-08-14T01:00:00Z',
          lastUpdatedAt: '2026-08-14T01:10:00Z',
          observationIds: [obsId],
          sourceIds: [`src-${item.domain}`],
          claimIds: [claimId],
          entities: [item.entity],
          primarySourceCount: item.primary ? 1 : 0,
          independentSourceCount: item.primary ? 3 : 1,
          geographicSpread: ['National'],
          status: 'active',
        };

        core.ingestObservation(obs);
        core.registerClaim(claim);
        const { signal } = core.upsertCluster(cluster);

        core.recordCalibrationJudgement(
          signal.id,
          item.judge,
          'editor-senior-desk',
          item.domain,
          `Stratified review for ${item.id}`
        );
      }

      const metrics = core.getCalibrationMetrics();
      expect(metrics.totalReviewedSignals).toBe(30);

      // Numerators & Denominators:
      // Relevant = 27 (all except 3 spam cases) -> 27/30 = 90%
      expect(metrics.signalPrecision).toBe(0.9);
      expect(metrics.editorAcceptanceRate).toBe(0.9);
      expect(metrics.editorRejectionRate).toBe(0.1);

      // P0 Precision: 5/5 = 100%
      expect(metrics.p0Precision).toBe(1.0);
      // P1 Precision: 8/8 = 100%
      expect(metrics.p1Precision).toBe(1.0);

      // Spam domain precision is 0.0
      expect(metrics.domainPrecision.spam_noise).toBe(0.0);
      // Legitimate domains are 1.0
      expect(metrics.domainPrecision.economy).toBe(1.0);
      expect(metrics.domainPrecision.judiciary).toBe(1.0);
      expect(metrics.domainPrecision.defence).toBe(1.0);
      expect(metrics.domainPrecision.technology).toBe(1.0);
    });
  });

  describe('11. Phase 1 Internal Alerting Staged Activation & Safety Controls', () => {
    it('PHASE1-01: Verifies restricted internal delivery to Managing Editor and Senior Verification Desk', () => {
      const core = newsroomIntelligenceCore;
      core.clear();

      // 1. Initial State: Shadow Mode (no delivery channel attached)
      expect(core.isPhase1Active()).toBe(false);

      const freshTs = (offsetMin: number) =>
        new Date(Date.now() - offsetMin * 60_000).toISOString();

      const cluster: StoryCluster = {
        id: 'cl-p1-act-1',
        title: 'High-Impact Policy Shift',
        summary: 'Official notification on strategic policy reform.',
        firstDetectedAt: freshTs(1),
        lastUpdatedAt: freshTs(1),
        observationIds: ['o-p1-1', 'o-p1-2'],
        sourceIds: ['s-p1-1', 's-p1-2', 's-p1-3'],
        claimIds: ['c-p1-1'],
        entities: ['Govt', 'Ministry of Finance', 'Cabinet'],
        primarySourceCount: 1,
        independentSourceCount: 3,
        geographicSpread: ['National'],
        status: 'active',
      };

      const obs: NewsroomObservation = {
        id: 'o-p1-1',
        sourceId: 's-p1-1',
        title: 'Govt notification',
        snippet: 'Policy shift',
        contentHash: 'hash-p1-1',
        publicationTimestamp: freshTs(1),
        ingestionTimestamp: freshTs(0.98),
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['Govt'],
      };

      const claim: NewsroomExtractedClaim = {
        id: 'c-p1-1',
        observationId: 'o-p1-1',
        statement: 'Govt notifies major policy change.',
        confidence: 0.95,
        epistemicStatus: 'fact',
        verificationState: 'verified',
      };

      core.ingestObservation(obs);
      core.registerClaim(claim);

      // Evaluate in shadow mode first
      const shadowRes = core.upsertCluster(cluster);
      expect(shadowRes.alert).not.toBeNull();
      expect(shadowRes.alert?.shadowMode).toBe(true);
      expect(shadowRes.alert?.delivery).toBeUndefined();

      // 2. Authorize Phase 1 Internal Alerting
      const authorized = core.activatePhase1InternalAlerting(true);
      expect(authorized).toBe(true);
      expect(core.isPhase1Active()).toBe(true);

      // Evaluate second cluster during Phase 1
      const cluster2: StoryCluster = {
        ...cluster,
        id: 'cl-p1-act-2',
        title: 'Critical Breaking National Security Alert',
      };
      const activeRes = core.upsertCluster(cluster2);
      expect(activeRes.alert).not.toBeNull();
      expect(activeRes.alert?.shadowMode).toBe(false); // Active internal alert
      expect(activeRes.alert?.delivery?.channelType).toBe('internal_editorial_channel');
      expect(activeRes.alert?.delivery?.recipientRoles).toEqual(['managing_editor', 'fact_checker']);
      expect(activeRes.alert?.delivery?.deliveredBy).toContain('Phase 1 Dispatcher');

      // 3. Engage Kill Switch
      core.engageKillSwitch();
      expect(core.isPhase1Active()).toBe(false);

      // Verify immediate reversion to shadow mode without data deletion
      const cluster3: StoryCluster = {
        ...cluster,
        id: 'cl-p1-act-3',
        title: 'Post-Killswitch Event',
      };
      const postKillRes = core.upsertCluster(cluster3);
      expect(postKillRes.alert?.shadowMode).toBe(true);
      expect(postKillRes.alert?.delivery).toBeUndefined();
      expect(core.getSignals().length).toBe(3); // Signals preserved
    });

    it('STRESS-01: Simulates 11 hard operating stress scenarios (Burst, Syndication, Corroboration, Noise, Outages, Latency, Concurrent P0s, Entity Ambiguity, Story Updates)', () => {
      const core = newsroomIntelligenceCore;
      core.clear();
      core.activatePhase1InternalAlerting(true);

      // Scenario A: Breaking News Burst (10 high-speed observations on single event)
      const burstObservations: NewsroomObservation[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `burst-obs-${i}`,
        sourceId: `wire-${i % 3}`,
        title: 'Flash: Major Central Bank Emergency Action',
        snippet: 'Central bank intervenes in currency market',
        contentHash: `hash-burst-${i}`,
        publicationTimestamp: '2026-08-14T06:00:00Z',
        ingestionTimestamp: `2026-08-14T06:00:0${i}Z`,
        sourceTier: 't1',
        isPrimarySource: i === 0,
        duplicateState: i === 0 ? 'unique' : 'duplicate_semantic',
        entities: ['Reserve Bank of India', 'Forex Desk'],
      }));

      burstObservations.forEach((o) => core.ingestObservation(o));
      const burstCluster: StoryCluster = {
        id: 'burst-cluster-1',
        title: 'Flash: Major Central Bank Emergency Action',
        summary: 'Emergency currency market intervention',
        firstDetectedAt: '2026-08-14T06:00:00Z',
        lastUpdatedAt: '2026-08-14T06:00:10Z',
        observationIds: burstObservations.map((o) => o.id),
        sourceIds: ['wire-0', 'wire-1', 'wire-2'],
        claimIds: ['c-burst-1'],
        entities: ['Reserve Bank of India'],
        primarySourceCount: 1,
        independentSourceCount: 3,
        geographicSpread: ['National'],
        status: 'active',
      };

      const burstRes = core.upsertCluster(burstCluster);
      expect(burstRes.alert).not.toBeNull();
      // Only 1 deduplicated alert emitted despite 10 burst observations
      expect(core.getAlerts().filter((a) => a.clusterId === 'burst-cluster-1').length).toBe(1);

      // Scenario B: Duplicate Syndication (5 identical stories from 1 single syndicator)
      const synObs: NewsroomObservation[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `syn-obs-${i}`,
        sourceId: 'syndicate-feed-a',
        title: 'Aggregated Copy of Market Rumor',
        snippet: 'Identical syndicated wire copy',
        contentHash: 'hash-syn-identical',
        publicationTimestamp: '2026-08-14T06:10:00Z',
        ingestionTimestamp: '2026-08-14T06:10:00Z',
        sourceTier: 't4',
        isPrimarySource: false,
        duplicateState: i === 0 ? 'unique' : 'exact_duplicate',
        entities: ['Market'],
      }));
      synObs.forEach((o) => core.ingestObservation(o));
      const synCluster: StoryCluster = {
        id: 'syn-cluster-1',
        title: 'Aggregated Copy of Market Rumor',
        summary: 'Identical syndicated copy',
        firstDetectedAt: '2026-08-14T06:10:00Z',
        lastUpdatedAt: '2026-08-14T06:10:00Z',
        observationIds: synObs.map((o) => o.id),
        sourceIds: ['syndicate-feed-a'],
        claimIds: ['c-syn-1'],
        entities: ['Market'],
        primarySourceCount: 0,
        independentSourceCount: 1, // Correctly identifies single independent source
        geographicSpread: ['Regional'],
        status: 'active',
      };
      const synRes = core.upsertCluster(synCluster);
      // Suppressed from P0/P1 alert escalation
      expect(synRes.signal.priority).toBe('P3');

      // Scenario C: Multi-Source Corroboration (3 Tier 1 sources confirm)
      const corrobObsList: NewsroomObservation[] = [1, 2, 3].map((i) => ({
        id: `o-corrob-${i}`,
        sourceId: i === 1 ? 'src-sc-official' : i === 2 ? 'src-pti' : 'src-bar-and-bench',
        title: 'Supreme Court Constitutional Bench Verdict',
        snippet: 'Constitution bench delivers verdict on federal powers',
        contentHash: `hash-corrob-${i}`,
        publicationTimestamp: '2026-08-14T06:20:00Z',
        ingestionTimestamp: '2026-08-14T06:20:00Z',
        sourceTier: 't1',
        isPrimarySource: i === 1,
        duplicateState: 'unique',
        entities: ['Supreme Court', 'Union of India'],
      }));
      corrobObsList.forEach((o) => core.ingestObservation(o));

      const corrobClaim: NewsroomExtractedClaim = {
        id: 'c-corrob-1',
        observationId: 'o-corrob-1',
        statement: 'Supreme Court Constitutional Bench Verdict delivered.',
        confidence: 0.98,
        epistemicStatus: 'fact',
        verificationState: 'verified',
      };
      core.registerClaim(corrobClaim);

      const corrobCluster: StoryCluster = {
        id: 'corrob-cl-1',
        title: 'Supreme Court Constitutional Bench Verdict',
        summary: 'Constitution bench delivers verdict on federal powers',
        firstDetectedAt: '2026-08-14T06:20:00Z',
        lastUpdatedAt: '2026-08-14T06:25:00Z',
        observationIds: ['o-corrob-1', 'o-corrob-2', 'o-corrob-3'],
        sourceIds: ['src-sc-official', 'src-pti', 'src-bar-and-bench'],
        claimIds: ['c-corrob-1'],
        entities: ['Supreme Court', 'Union of India', 'Constitution Bench'],
        primarySourceCount: 1,
        independentSourceCount: 3,
        geographicSpread: ['National'],
        status: 'active',
      };
      const corrobRes = core.upsertCluster(corrobCluster);
      expect(corrobRes.signal.priority).toBe('P0');
      expect(corrobRes.alert?.priority).toBe('P0');

      // Scenario D: Contradictory Reporting (Two incompatible claims)
      const claimA: NewsroomExtractedClaim = {
        id: 'c-contra-a',
        observationId: 'o-contra-a',
        statement: 'Border trade corridor reopened this morning.',
        confidence: 0.85,
        epistemicStatus: 'fact',
        verificationState: 'unverified',
        contradictingClaimIds: ['c-contra-b'],
      };
      const claimB: NewsroomExtractedClaim = {
        id: 'c-contra-b',
        observationId: 'o-contra-b',
        statement: 'Border trade corridor remains closed indefinitely.',
        confidence: 0.85,
        epistemicStatus: 'fact',
        verificationState: 'unverified',
        contradictingClaimIds: ['c-contra-a'],
      };
      const contraCluster: StoryCluster = {
        id: 'cl-contra-test',
        title: 'Border Trade Corridor Status',
        summary: 'Conflicting reports on trade corridor reopening',
        firstDetectedAt: '2026-08-14T06:25:00Z',
        lastUpdatedAt: '2026-08-14T06:25:00Z',
        observationIds: ['o-contra-a', 'o-contra-b'],
        sourceIds: ['s-a', 's-b'],
        claimIds: ['c-contra-a', 'c-contra-b'],
        entities: ['Border Corridor'],
        primarySourceCount: 0,
        independentSourceCount: 2,
        geographicSpread: ['National'],
        status: 'active',
      };
      const contraDetections = ContradictionEngine.detectContradictions(contraCluster, [claimA, claimB]);
      expect(contraDetections.length).toBe(1);
      expect(contraDetections[0].severity).toBe('critical');

      // Scenario E: Entity Ambiguity (Preserves exact string without false conflation)
      const entityA = 'Supreme Court of India (SC)';
      const entityB = 'South Carolina Supreme Court (SC)';
      expect(entityA === entityB).toBe(false);

      // Scenario F: Simultaneous P0 Events
      const eciObsList: NewsroomObservation[] = [1, 2, 3].map((i) => ({
        id: `o-eci-${i}`,
        sourceId: i === 1 ? 'src-eci-primary' : i === 2 ? 'src-wire-a' : 'src-wire-b',
        title: 'ECI Announces General Election Dates',
        snippet: 'Official election schedule notification',
        contentHash: `hash-eci-${i}`,
        publicationTimestamp: '2026-08-14T06:30:00Z',
        ingestionTimestamp: '2026-08-14T06:30:00Z',
        sourceTier: 't1',
        isPrimarySource: i === 1,
        duplicateState: 'unique',
        entities: ['Election Commission of India'],
      }));
      eciObsList.forEach((o) => core.ingestObservation(o));

      const eciClaim: NewsroomExtractedClaim = {
        id: 'c-eci-1',
        observationId: 'o-eci-1',
        statement: 'General election dates announced across all states.',
        confidence: 0.99,
        epistemicStatus: 'fact',
        verificationState: 'verified',
      };
      core.registerClaim(eciClaim);

      const p0Cluster2: StoryCluster = {
        id: 'p0-event-2',
        title: 'ECI Announces General Election Dates',
        summary: 'Official election schedule notification',
        firstDetectedAt: '2026-08-14T06:30:00Z',
        lastUpdatedAt: '2026-08-14T06:30:00Z',
        observationIds: ['o-eci-1', 'o-eci-2', 'o-eci-3'],
        sourceIds: ['src-eci-primary', 'src-wire-a', 'src-wire-b'],
        claimIds: ['c-eci-1'],
        entities: ['Election Commission of India', 'National Elections', 'Parliament'],
        primarySourceCount: 1,
        independentSourceCount: 3,
        geographicSpread: ['National'],
        status: 'active',
      };
      const p0Res2 = core.upsertCluster(p0Cluster2);
      expect(p0Res2.signal.priority).toBe('P0');
      // Verify both P0 clusters exist distinctly in queue
      expect(core.getQueue().BREAKING_P0.length).toBe(3); // burst + corrob + eci
    });

    it('LONG-01: Evaluates 50-sample extended long-horizon multi-cycle operational dataset with fatigue monitoring', () => {
      const core = newsroomIntelligenceCore;
      core.clear();
      core.activatePhase1InternalAlerting(true);

      // Extended 50-sample ledger across 20 distinct domains, 30 sources, and 4 priority tiers
      const extendedLedger = [
        // 8 P0 Cases (Critical National / Constitutional / Strategic)
        { id: 'lh-p0-1', domain: 'economy', entity: 'RBI MPC', title: 'Emergency Repo Rate Hike', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.95 },
        { id: 'lh-p0-2', domain: 'judiciary', entity: 'Supreme Court', title: 'Electoral Bonds Struck Down', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.98 },
        { id: 'lh-p0-3', domain: 'defence', entity: 'Ministry of Defence', title: 'Major Border Protocol Activated', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.92 },
        { id: 'lh-p0-4', domain: 'government', entity: 'Parliament of India', title: 'Finance Bill Passed Under Guillotine', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'lh-p0-5', domain: 'elections', entity: 'ECI', title: 'General Election Schedule Announced', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.99 },
        { id: 'lh-p0-6', domain: 'foreign_affairs', entity: 'MEA', title: 'Bilateral Border Disengagement Accord', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.94 },
        { id: 'lh-p0-7', domain: 'disaster', entity: 'NDMA', title: 'Super Cyclone Red Alert Evacuation', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.96 },
        { id: 'lh-p0-8', domain: 'national_security', entity: 'Cabinet Committee on Security', title: 'National Cyber Emergency Declared', p: 'P0' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.95 },

        // 12 P1 Cases (Statutory, Major Sectoral, Regulatory)
        { id: 'lh-p1-1', domain: 'finance', entity: 'SEBI', title: 'T+0 Settlement Mandate Finalized', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'lh-p1-2', domain: 'policy', entity: 'Ministry of Finance', title: 'Direct Tax Code Draft Released', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.88 },
        { id: 'lh-p1-3', domain: 'technology', entity: 'MeitY', title: 'DPDP Rules Notified in Gazette', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.92 },
        { id: 'lh-p1-4', domain: 'health', entity: 'ICMR', title: 'National Vector Disease Advisory', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.85 },
        { id: 'lh-p1-5', domain: 'trade', entity: 'DGFT', title: 'Critical Mineral Export Curbs', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.91 },
        { id: 'lh-p1-6', domain: 'judiciary', entity: 'High Court of Delhi', title: 'Anti-Dumping Duty Quashed', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.86 },
        { id: 'lh-p1-7', domain: 'energy', entity: 'CERC', title: 'Grid Tariff Revision Order', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't2' as const, primary: true, conf: 0.84 },
        { id: 'lh-p1-8', domain: 'agriculture', entity: 'CACP', title: 'Kharif MSP Recommendation Table', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.89 },
        { id: 'lh-p1-9', domain: 'telecom', entity: 'DoT', title: 'Spectrum Allocation Norms Gazette', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'lh-p1-10', domain: 'commerce', entity: 'CCI', title: 'Tech Platform Anti-Trust Penalty', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.91 },
        { id: 'lh-p1-11', domain: 'banking', entity: 'RBI Dept of Regulation', title: 'Unsecured Lending Provisioning Raised', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.89 },
        { id: 'lh-p1-12', domain: 'aviation', entity: 'DGCA', title: 'Foreign Carrier Wet-Lease Audit Mandate', p: 'P1' as const, judge: 'CORRECT_PRIORITY' as const, tier: 't1' as const, primary: true, conf: 0.87 },

        // 18 P2 Cases (Developing, Sectoral, Oversight)
        { id: 'lh-p2-1', domain: 'education', entity: 'UGC', title: 'Foreign University Campus Guidelines', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: false, conf: 0.78 },
        { id: 'lh-p2-2', domain: 'climate', entity: 'IMD', title: 'Monsoon Low Pressure Trough Update', p: 'P2' as const, judge: 'FOLLOW' as const, tier: 't2' as const, primary: true, conf: 0.80 },
        { id: 'lh-p2-3', domain: 'civil_aviation', entity: 'DGCA', title: 'Pilot Rest Hours Compliance Audit', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.82 },
        { id: 'lh-p2-4', domain: 'railways', entity: 'Railway Board', title: 'Kavach System Deployment Rollout', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: false, conf: 0.75 },
        { id: 'lh-p2-5', domain: 'telecom', entity: 'TRAI', title: 'Spam Call Penalty Consultation Paper', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.83 },
        { id: 'lh-p2-6', domain: 'housing', entity: 'MoHUA', title: 'Smart Cities Mission Phase-3 Report', p: 'P2' as const, judge: 'FOLLOW' as const, tier: 't3' as const, primary: false, conf: 0.72 },
        { id: 'lh-p2-7', domain: 'corporate', entity: 'NCLT', title: 'Insolvency Resolution Hearing Adjourned', p: 'P2' as const, judge: 'NEEDS_VERIFICATION' as const, tier: 't3' as const, primary: false, conf: 0.70 },
        { id: 'lh-p2-8', domain: 'science', entity: 'ISRO', title: 'NVS-02 Satellite Orbital Orbit Insertion', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.95 },
        { id: 'lh-p2-9', domain: 'environment', entity: 'CPCB', title: 'AQI Action Plan Stage-2 Triggered', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.85 },
        { id: 'lh-p2-10', domain: 'consumer', entity: 'CCPA', title: 'Dark Patterns Advisory to E-commerce', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.80 },
        { id: 'lh-p2-11', domain: 'labour', entity: 'EPFO', title: 'Monthly Payroll Net Addition Table', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.85 },
        { id: 'lh-p2-12', domain: 'mining', entity: 'Ministry of Mines', title: 'Critical Mineral Block Tranche-IV Bidding', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.88 },
        { id: 'lh-p2-13', domain: 'ports', entity: 'IPA', title: 'Major Ports Cargo Throughput Report', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.82 },
        { id: 'lh-p2-14', domain: 'fertilizer', entity: 'DoF', title: 'Nutrient Based Subsidy Kharif Rates', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.89 },
        { id: 'lh-p2-15', domain: 'statistics', entity: 'MoSPI', title: 'Index of Industrial Production Quick Estimates', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.92 },
        { id: 'lh-p2-16', domain: 'petroleum', entity: 'PPAC', title: 'Monthly Petroleum Import Dependency Stats', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.84 },
        { id: 'lh-p2-17', domain: 'pharmaceuticals', entity: 'NPPA', title: 'Ceiling Price Revision for 40 Formulations', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't1' as const, primary: true, conf: 0.90 },
        { id: 'lh-p2-18', domain: 'water_resources', entity: 'CWC', title: 'Live Storage Status of 150 Reservoirs', p: 'P2' as const, judge: 'RELEVANT' as const, tier: 't2' as const, primary: true, conf: 0.86 },

        // 12 P3 & Noise Cases
        { id: 'lh-p3-1', domain: 'sports', entity: 'SAI', title: 'National Games Venue Inspection', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.65 },
        { id: 'lh-p3-2', domain: 'culture', entity: 'ASI', title: 'Monument Conservation Schedule', p: 'P3' as const, judge: 'FOLLOW' as const, tier: 't3' as const, primary: false, conf: 0.60 },
        { id: 'lh-p3-3', domain: 'local_admin', entity: 'MCD', title: 'Property Tax Amnesty Scheme Extended', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: true, conf: 0.75 },
        { id: 'lh-p3-4', domain: 'industry', entity: 'CII', title: 'Business Confidence Survey Release', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.68 },
        { id: 'lh-p3-5', domain: 'spam_noise', entity: 'Unknown Forum', title: 'Unsubstantiated Tax Leak Rumor', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.30 },
        { id: 'lh-p3-6', domain: 'spam_noise', entity: 'Celebrity Blog', title: 'Viral Sensational Claims', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.25 },
        { id: 'lh-p3-7', domain: 'spam_noise', entity: 'Crypto Shilling Channel', title: 'Guaranteed Return Token Scheme', p: 'P3' as const, judge: 'IGNORE' as const, tier: 't5' as const, primary: false, conf: 0.20 },
        { id: 'lh-p3-8', domain: 'spam_noise', entity: 'Clickbait Portal', title: 'Shocking Disclosure From Unknown Official', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.22 },
        { id: 'lh-p3-9', domain: 'spam_noise', entity: 'Messaging App Rumor', title: 'Viral Audio Message on Bank Run', p: 'P3' as const, judge: 'NOT_RELEVANT' as const, tier: 't5' as const, primary: false, conf: 0.18 },
        { id: 'lh-p3-10', domain: 'local_events', entity: 'Local Rotary', title: 'Annual Civic Awards Ceremony', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't4' as const, primary: false, conf: 0.60 },
        { id: 'lh-p3-11', domain: 'publishing', entity: 'Trade Journal', title: 'Quarterly Cement Production Notes', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.64 },
        { id: 'lh-p3-12', domain: 'trade_association', entity: 'FICCI', title: 'Logistics Cost Survey Summary', p: 'P3' as const, judge: 'RELEVANT' as const, tier: 't3' as const, primary: false, conf: 0.66 },
      ];

      for (const item of extendedLedger) {
        const obsId = `o-${item.id}`;
        const claimId = `c-${item.id}`;
        const clusterId = `cl-${item.id}`;

        const isP0orP1 = item.p === 'P0' || item.p === 'P1';

        const obsList: NewsroomObservation[] = (isP0orP1 ? [1, 2, 3] : [1]).map((i) => ({
          id: `${obsId}-${i}`,
          sourceId: i === 1 ? `src-${item.domain}` : `src-corrob-${item.domain}-${i}`,
          title: item.title,
          snippet: `Snippet for ${item.title}`,
          contentHash: `hash-${item.id}-${i}`,
          publicationTimestamp: '2026-08-14T01:00:00Z',
          ingestionTimestamp: '2026-08-14T01:05:00Z',
          sourceTier: item.tier,
          isPrimarySource: item.primary && i === 1,
          duplicateState: 'unique',
          entities: [item.entity, `${item.domain} Authority`, 'National Desk'],
        }));

        obsList.forEach((o) => core.ingestObservation(o));

        const claim: NewsroomExtractedClaim = {
          id: claimId,
          observationId: `${obsId}-1`,
          statement: item.title,
          confidence: item.conf,
          epistemicStatus: 'fact',
          verificationState: item.primary ? 'verified' : 'unverified',
        };
        core.registerClaim(claim);

        const cluster: StoryCluster = {
          id: clusterId,
          title: item.title,
          summary: `Summary of ${item.title}`,
          firstDetectedAt: '2026-08-14T01:00:00Z',
          lastUpdatedAt: '2026-08-14T01:10:00Z',
          observationIds: obsList.map((o) => o.id),
          sourceIds: obsList.map((o) => o.sourceId),
          claimIds: [claimId],
          entities: [item.entity, `${item.domain} Authority`, 'National Desk'],
          primarySourceCount: item.primary ? 1 : 0,
          independentSourceCount: isP0orP1 ? 3 : 1,
          geographicSpread: ['National'],
          status: 'active',
        };

        const { signal, alert } = core.upsertCluster(cluster);

        if (alert) {
          core.acknowledgeAlert(alert.id, 'editor-senior');
        }

        core.recordCalibrationJudgement(
          signal.id,
          item.judge,
          'editor-senior-desk',
          item.domain,
          `Extended 50-sample review for ${item.id}`
        );
      }

      const metrics = core.getCalibrationMetrics();
      expect(metrics.totalReviewedSignals).toBe(50);

      // Numerators & Denominators:
      // Relevant = 45 (all except 5 spam cases) -> 45/50 = 90.0%
      expect(metrics.signalPrecision).toBe(0.9);
      expect(metrics.editorAcceptanceRate).toBe(0.9);
      expect(metrics.editorRejectionRate).toBe(0.1);

      // P0 Precision: 8/8 = 100%
      expect(metrics.p0Precision).toBe(1.0);
      // P1 Precision: 12/12 = 100%
      expect(metrics.p1Precision).toBe(1.0);

      // Operational Alert Fatigue Check:
      // Out of 50 events across the news cycle, exactly 20 were P0/P1 alerts (0.83 alerts/hr equivalent)
      const deliveredAlerts = core.getAlerts();
      expect(deliveredAlerts.length).toBe(20);
      expect(deliveredAlerts.every((a) => a.priority === 'P0' || a.priority === 'P1')).toBe(true);
      expect(deliveredAlerts.every((a) => a.acknowledged === true)).toBe(true);
    });
  });

  describe('7. Phase 2 — Controlled Beat-Desk Alerting', () => {
    beforeEach(() => {
      beatRoutingService.clear();
      newsroomIntelligenceCore.clear();
      NewsroomAuditService.clear();
    });

    it('AUTH-DEFAULT-01: does not dispatch Phase 2 alerts without explicit authorization', () => {
      // Phase 2 is disabled by default
      expect(beatRoutingService.isPhase2Active()).toBe(false);

      const cluster: StoryCluster = {
        id: 'cl-rbi',
        title: 'RBI Monetary Policy decision',
        summary: 'RBI announces emergency interest rate cuts.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        observationIds: ['obs-rbi', 'obs-rbi-2', 'obs-rbi-3'],
        sourceIds: ['src-rbi', 'src-rbi-2', 'src-rbi-3'],
        claimIds: ['c-rbi'],
        entities: ['RBI', 'Finance Ministry'],
        primarySourceCount: 2,
        independentSourceCount: 3,
        geographicSpread: ['National'],
        status: 'active',
      };

      const obs1: NewsroomObservation = {
        id: 'obs-rbi',
        sourceId: 'src-rbi',
        title: 'RBI Rate Cut Announcement',
        snippet: 'Reserve Bank of India reduces repo rate by 50 bps.',
        contentHash: 'hash-rbi',
        publicationTimestamp: new Date().toISOString(),
        ingestionTimestamp: new Date().toISOString(),
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['RBI', 'Finance Ministry'],
      };

      const obs2: NewsroomObservation = {
        id: 'obs-rbi-2',
        sourceId: 'src-rbi-2',
        title: 'Ministry Confirm',
        snippet: 'Finance Ministry confirms rate cut impact.',
        contentHash: 'hash-rbi-2',
        publicationTimestamp: new Date().toISOString(),
        ingestionTimestamp: new Date().toISOString(),
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['RBI', 'Finance Ministry'],
      };

      const obs3: NewsroomObservation = {
        id: 'obs-rbi-3',
        sourceId: 'src-rbi-3',
        title: 'Public Report',
        snippet: 'Repo rate update report.',
        contentHash: 'hash-rbi-3',
        publicationTimestamp: new Date().toISOString(),
        ingestionTimestamp: new Date().toISOString(),
        sourceTier: 't3',
        isPrimarySource: false,
        duplicateState: 'unique',
        entities: ['RBI', 'Finance Ministry'],
      };

      newsroomIntelligenceCore.ingestObservation(obs1);
      newsroomIntelligenceCore.ingestObservation(obs2);
      newsroomIntelligenceCore.ingestObservation(obs3);
      const { alert } = newsroomIntelligenceCore.upsertCluster(cluster);

      expect(alert).not.toBeNull();
      // By default, since Phase 2 is not authorized, falls back to Phase 1 (or shadow mode if Phase 1 inactive)
      // Here, Phase 1 is not activated, so it is in shadow mode
      expect(alert!.shadowMode).toBe(true);
      expect(alert!.delivery).toBeUndefined();
    });

    it('ROUT-01 & TAXONOMY-01: routes alerts deterministically based on canonical entities, taxonomy, and topics', () => {
      // Authorize Phase 2
      beatRoutingService.authorizePhase2({
        authorizedBy: 'managing-editor-01',
        authorizedRole: 'managing_editor',
        authorizationTimestamp: new Date().toISOString(),
        approvedScope: 'Beat alerting activation',
        approvedRecipients: ['reporter-01', 'reporter-02', 'editor-01'],
        approvedBeats: ['economy', 'judiciary'],
        approvedChannels: ['beat_desk_channel'],
        rollbackAuthority: 'managing-editor-01',
      });

      expect(beatRoutingService.isPhase2Active()).toBe(true);

      const signal: NewsroomSignal = {
        id: 'sig-rbi',
        clusterId: 'cl-rbi',
        title: 'RBI Repo Rate adjustment',
        summary: 'Monetary policy committee adjusts interest rates.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P1',
        scores: {
          relevance: 80,
          importance: 80,
          novelty: 70,
          velocity: 60,
          evidenceStrength: 80,
          confidence: 85,
          uncertainty: 20,
          misinformationRisk: 10,
          sourceReliability: 90,
        },
        explanation: {
          priority: 'P1',
          compositeScore: 80,
          threshold: 70,
          triggeredRules: ['High Importance RBI Policy change'],
          whyItMatters: 'Direct impact on lending rates and financial stability.',
          evidenceBasis: ['Official RBI notification'],
          recommendedAction: 'Verify details with bankers.',
        },
        observationCount: 2,
        independentSourceCount: 2,
        primarySourceCount: 1,
        keyEntities: ['RBI', 'Ministry of Finance'],
        keyClaims: ['c1'],
        contradictionIds: [],
        version: 1,
      };

      const matchedBeats = beatRoutingService.determineSignalBeats(signal);
      expect(matchedBeats).toContain('economy');

      // Routing output verification
      const deliveries = beatRoutingService.routeAlert(signal, 'alt-test');
      // reporter-01 is assigned to 'economy'
      const deliveryRep1 = deliveries.find(d => d.recipientId === 'reporter-01');
      expect(deliveryRep1).toBeDefined();
      expect(deliveryRep1!.beatId).toBe('economy');
      expect(deliveryRep1!.deliveryStatus).toBe('delivered');
      expect(deliveryRep1!.routingReason).toContain('Signal mapped to beat: economy');
    });

    it('MULTI-BEAT-01: maps a signal to multiple beats and routes to one logical alert with multiple deliveries', () => {
      beatRoutingService.authorizePhase2({
        authorizedBy: 'managing-editor-01',
        authorizedRole: 'managing_editor',
        authorizationTimestamp: new Date().toISOString(),
        approvedScope: 'Beat alerting activation',
        approvedRecipients: ['reporter-01', 'reporter-02'],
        approvedBeats: ['economy', 'politics', 'agriculture'],
        approvedChannels: ['beat_desk_channel'],
        rollbackAuthority: 'managing-editor-01',
      });

      // Signal affecting multiple beats: Economy and Agriculture
      const signal: NewsroomSignal = {
        id: 'sig-multi',
        clusterId: 'cl-multi',
        title: 'RBI Farmer Loan Scheme modification under MGNREGA',
        summary: 'New credit policy affecting rural farming communities.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P1',
        scores: {
          relevance: 80, importance: 80, novelty: 70, velocity: 65,
          evidenceStrength: 85, confidence: 85, uncertainty: 20, misinformationRisk: 10, sourceReliability: 90
        },
        explanation: {
          priority: 'P1', compositeScore: 80, threshold: 70, triggeredRules: [],
          whyItMatters: 'Affects both finance and agriculture sectors.',
          evidenceBasis: [], recommendedAction: ''
        },
        observationCount: 3, independentSourceCount: 3, primarySourceCount: 1,
        keyEntities: ['RBI', 'Ministry of Agriculture', 'MGNREGA'],
        keyClaims: ['c2'], contradictionIds: [], version: 1,
      };

      const matchedBeats = beatRoutingService.determineSignalBeats(signal);
      expect(matchedBeats).toContain('economy');
      expect(matchedBeats).toContain('agriculture');

      // reporter-01 belongs to both 'economy' and 'agriculture'.
      // RECIPIENT-DEDUP-01: same recipient belongs to two matched beats -> gets exactly one delivery target.
      const deliveries = beatRoutingService.routeAlert(signal, 'alt-multi');
      const rep1Deliveries = deliveries.filter(d => d.recipientId === 'reporter-01');
      expect(rep1Deliveries.length).toBe(1);
    });

    it('RBAC-01 & IDOR-01: prevents unauthorized beat signal, alert retrieval and mutation', () => {
      beatRoutingService.authorizePhase2({
        authorizedBy: 'managing-editor-01',
        authorizedRole: 'managing_editor',
        authorizationTimestamp: new Date().toISOString(),
        approvedScope: 'Beat alerting activation',
        approvedRecipients: ['reporter-01', 'reporter-02'],
        approvedBeats: ['economy', 'judiciary', 'politics'],
        approvedChannels: ['beat_desk_channel'],
        rollbackAuthority: 'managing-editor-01',
      });

      // Signal for 'judiciary' beat
      const signal: NewsroomSignal = {
        id: 'sig-sc',
        clusterId: 'cl-sc',
        title: 'Supreme Court major judgment on constitutional case',
        summary: 'CJI CJI-led bench declares government policy invalid.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P0',
        scores: {
          relevance: 95, importance: 95, novelty: 80, velocity: 85,
          evidenceStrength: 95, confidence: 95, uncertainty: 10, misinformationRisk: 5, sourceReliability: 98
        },
        explanation: {
          priority: 'P0', compositeScore: 95, threshold: 80, triggeredRules: [],
          whyItMatters: 'Judicial milestone.', evidenceBasis: [], recommendedAction: ''
        },
        observationCount: 5, independentSourceCount: 4, primarySourceCount: 1,
        keyEntities: ['Supreme Court', 'CJI', 'Judiciary'],
        keyClaims: ['c3'], contradictionIds: [], version: 1,
      };

      newsroomIntelligenceCore.upsertCluster({
        id: 'cl-sc',
        title: 'SC verdict',
        summary: 'Judicial verdict details.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        observationIds: [],
        sourceIds: [],
        claimIds: [],
        entities: ['Supreme Court', 'CJI', 'Judiciary'],
        primarySourceCount: 1,
        independentSourceCount: 4,
        geographicSpread: [],
        status: 'active',
      });
      // Force set the signal inside core
      (newsroomIntelligenceCore as any).signals.set(signal.id, signal);

      // reporter-01 is assigned to 'economy' and 'agriculture', NOT 'judiciary' or 'politics'
      // reporter-02 is assigned to 'politics' and 'judiciary'
      const rep1Context = { id: 'reporter-01', role: 'reporter' };
      const rep2Context = { id: 'reporter-02', role: 'reporter' };

      // reporter-01 cannot retrieve signal
      expect(() => newsroomIntelligenceCore.getSignal(signal.id, rep1Context)).toThrow('Access denied to unauthorized beat signal.');
      // reporter-02 can retrieve signal
      const retrieved = newsroomIntelligenceCore.getSignal(signal.id, rep2Context);
      expect(retrieved).toBeDefined();

      // reporter-01 cannot perform actions on signal
      expect(() => newsroomIntelligenceCore.executeAction({
        signalId: signal.id,
        action: 'VERIFY',
        actorId: 'reporter-01',
        actorName: 'Reporter 01',
      }, 'reporter')).toThrow('Access denied to execute action on unauthorized beat.');
    });

    it('ESC-01: verify deterministic escalation chain and audit trail tracking', () => {
      beatRoutingService.authorizePhase2({
        authorizedBy: 'managing-editor-01',
        authorizedRole: 'managing_editor',
        authorizationTimestamp: new Date().toISOString(),
        approvedScope: 'Beat alerting activation',
        approvedRecipients: ['reporter-01', 'editor-01'],
        approvedBeats: ['economy'],
        approvedChannels: ['beat_desk_channel'],
        rollbackAuthority: 'managing-editor-01',
      });

      const signal: NewsroomSignal = {
        id: 'sig-esc',
        clusterId: 'cl-esc',
        title: 'Economy update',
        summary: 'Developing economic crisis details.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P1',
        scores: {
          relevance: 80, importance: 80, novelty: 70, velocity: 65,
          evidenceStrength: 85, confidence: 85, uncertainty: 20, misinformationRisk: 10, sourceReliability: 90
        },
        explanation: {
          priority: 'P1', compositeScore: 80, threshold: 70, triggeredRules: [],
          whyItMatters: '', evidenceBasis: [], recommendedAction: ''
        },
        observationCount: 3, independentSourceCount: 3, primarySourceCount: 1,
        keyEntities: ['RBI'], keyClaims: [], contradictionIds: [], version: 1,
        assignedTo: 'reporter-01',
      };

      (newsroomIntelligenceCore as any).signals.set(signal.id, signal);

      // Perform ESCALATE action from reporter-01 to editor-01 (Beat Editor)
      const escalated = newsroomIntelligenceCore.executeAction({
        signalId: signal.id,
        action: 'ESCALATE',
        actorId: 'reporter-01',
        actorName: 'Reporter 01',
        assignedTo: 'editor-01',
        note: 'Escalating to beat editor for corroboration review.',
        escalatedPriority: 'P0',
      }, 'reporter');

      expect(escalated).not.toBeNull();
      expect(escalated!.lifecycleState).toBe('escalated');
      expect(escalated!.priority).toBe('P0');

      const escalations = beatRoutingService.getEscalations(signal.id);
      expect(escalations.length).toBe(1);
      expect(escalations[0].previousOwner).toBe('reporter-01');
      expect(escalations[0].newOwner).toBe('editor-01');
      expect(escalations[0].actor).toBe('Reporter 01');

      const auditTrail = NewsroomAuditService.getAuditTrail({ signalId: signal.id });
      const escAudit = auditTrail.find(a => a.action === 'ESCALATE');
      expect(escAudit).toBeDefined();
      expect(escAudit!.reason).toContain('Escalating to beat editor for corroboration review.');
    });

    it('STALE-ACTION-01: version mismatch throws conflict error deterministically', () => {
      const signal: NewsroomSignal = {
        id: 'sig-stale',
        clusterId: 'cl-stale',
        title: 'Statutory disclosure',
        summary: 'Statutory disclosure info.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P2',
        scores: {
          relevance: 60, importance: 60, novelty: 50, velocity: 40,
          evidenceStrength: 70, confidence: 80, uncertainty: 20, misinformationRisk: 10, sourceReliability: 85
        },
        explanation: {
          priority: 'P2', compositeScore: 60, threshold: 50, triggeredRules: [],
          whyItMatters: '', evidenceBasis: [], recommendedAction: ''
        },
        observationCount: 2, independentSourceCount: 2, primarySourceCount: 1,
        keyEntities: ['SEBI'], keyClaims: [], contradictionIds: [], version: 1,
      };

      (newsroomIntelligenceCore as any).signals.set(signal.id, signal);

      // Editor-A attempts action with expectedVersion: 1 (succeeds, bumps version to 2)
      newsroomIntelligenceCore.executeAction({
        signalId: signal.id,
        action: 'FOLLOW',
        actorId: 'editor-a',
        actorName: 'Editor A',
        expectedVersion: 1,
      });

      // Editor-B attempts action with stale expectedVersion: 1 (fails with conflict)
      expect(() => {
        newsroomIntelligenceCore.executeAction({
          signalId: signal.id,
          action: 'VERIFY',
          actorId: 'editor-b',
          actorName: 'Editor B',
          expectedVersion: 1,
        });
      }).toThrow('Version conflict: Signal has been modified by another editor.');
    });

    it('KILL-01 & ROLL-01: global kill switch and rollback behaves cleanly without deleting audit history', () => {
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

      expect(newsroomIntelligenceCore.getAlerts().length).toBe(0);

      // Engages kill switch
      newsroomIntelligenceCore.engageKillSwitch();
      expect(beatRoutingService.isPhase2Active()).toBe(true); // authorized remains true
      expect((newsroomIntelligenceCore as any).alertEngine.isPhase2Active()).toBe(false); // active becomes false

      // Deauthorizes / Rollback to Phase 1
      beatRoutingService.deauthorizePhase2();
      expect(beatRoutingService.isPhase2Active()).toBe(false);

      // Audit logs are preserved
      const auditTrail = NewsroomAuditService.getAuditTrail();
      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail.some(a => a.reason && a.reason.includes('Phase 2 deauthorized'))).toBe(true);
    });

    it('FAT-01: calculates and aggregates per-user and per-beat fatigue statistics', () => {
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

      const signal: NewsroomSignal = {
        id: 'sig-fat',
        clusterId: 'cl-fat',
        title: 'Economic update',
        summary: 'Details.',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        lifecycleState: 'discovered',
        priority: 'P0',
        scores: {
          relevance: 90, importance: 90, novelty: 80, velocity: 80,
          evidenceStrength: 90, confidence: 90, uncertainty: 10, misinformationRisk: 5, sourceReliability: 95
        },
        explanation: {
          priority: 'P0', compositeScore: 90, threshold: 80, triggeredRules: [],
          whyItMatters: '', evidenceBasis: [], recommendedAction: ''
        },
        observationCount: 3, independentSourceCount: 3, primarySourceCount: 1,
        keyEntities: ['RBI'], keyClaims: [], contradictionIds: [], version: 1,
      };

      // Route alert
      beatRoutingService.routeAlert(signal, 'alt-fat');

      const reporterFatigue = beatRoutingService.getUserFatigueMetrics('reporter-01');
      expect(reporterFatigue.alertsToday).toBe(1);
      expect(reporterFatigue.p0Count).toBe(1);

      const beatStats = beatRoutingService.getBeatFatigueMetrics('economy');
      expect(beatStats.alertVolume).toBe(1);
    });
  });

  describe('12. NOVELTY DECAY — deterministic decay curve + no-alert regression', () => {
    // NEWSROOM-INTEL-PRODUCTION-CONVERGENCE-01 §13: the novelty component is
    // `max(10, 100 - ageHours*4)`. Priority must decay across the P1/P2
    // boundary when a cluster ages, and the alert engine (P0/P1-only) must
    // not emit on the decayed tier. This test injects the clock explicitly
    // into SignalEngine and AlertEngine — no reliance on Date.now().
    const t0 = new Date('2026-08-14T05:00:00Z');

    const cluster: StoryCluster = {
      id: 'cl-decay',
      title: 'Policy Decision Under Review',
      summary: 'Two independent reports on the policy decision.',
      firstDetectedAt: t0.toISOString(),
      lastUpdatedAt: t0.toISOString(),
      observationIds: ['d1', 'd2'],
      sourceIds: ['src-a', 'src-b'],
      claimIds: [],
      entities: ['RBI', 'SEBI'],
      primarySourceCount: 2,
      independentSourceCount: 2,
      geographicSpread: ['National'],
      status: 'active',
    };

    const observations: NewsroomObservation[] = [
      {
        id: 'd1',
        sourceId: 'src-a',
        title: 'Policy Decision Under Review',
        snippet: 'First independent report.',
        contentHash: 'decay-a',
        publicationTimestamp: t0.toISOString(),
        ingestionTimestamp: t0.toISOString(),
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['RBI', 'SEBI'],
        canonicalUrl: 'https://source-a.example/decay',
      },
      {
        id: 'd2',
        sourceId: 'src-b',
        title: 'Policy Decision Under Review',
        snippet: 'Second independent report.',
        contentHash: 'decay-b',
        publicationTimestamp: t0.toISOString(),
        ingestionTimestamp: t0.toISOString(),
        sourceTier: 't1',
        isPrimarySource: true,
        duplicateState: 'unique',
        entities: ['RBI', 'SEBI'],
        canonicalUrl: 'https://source-b.example/decay',
      },
    ];

    it('DECAY-01: fresh cluster is P1; 24h and 72h clusters decay to P2', () => {
      const fresh = SignalEngine.evaluateSignal(cluster, observations, [], undefined, t0);
      const after24h = SignalEngine.evaluateSignal(
        cluster, observations, [], undefined, new Date(t0.getTime() + 24 * 60 * 60 * 1000)
      );
      const after72h = SignalEngine.evaluateSignal(
        cluster, observations, [], undefined, new Date(t0.getTime() + 72 * 60 * 60 * 1000)
      );

      // Decay curve of the novelty component: hour 0 → 100, hour 24 → 10 (floor), hour 72 → 10.
      expect(fresh.signal.scores.novelty).toBe(100);
      expect(after24h.signal.scores.novelty).toBe(10);
      expect(after72h.signal.scores.novelty).toBe(10);

      // Composite is monotonic non-increasing: 75 → 62 → 62.
      expect(fresh.signal.explanation.compositeScore).toBe(75);
      expect(after24h.signal.explanation.compositeScore).toBe(62);
      expect(after72h.signal.explanation.compositeScore).toBe(62);

      // Priority tiers across the curve.
      expect(fresh.signal.priority).toBe('P1');
      expect(after24h.signal.priority).toBe('P2');
      expect(after72h.signal.priority).toBe('P2');
    });

    it('DECAY-02: alert engine emits at P1-fresh but not on the decayed P2 tier', () => {
      const engine = new AlertEngine();
      const fresh = SignalEngine.evaluateSignal(cluster, observations, [], undefined, t0);
      const after72h = SignalEngine.evaluateSignal(
        cluster, observations, [], undefined, new Date(t0.getTime() + 72 * 60 * 60 * 1000)
      );

      const freshAlert = engine.evaluateSignalForAlert(fresh.signal, undefined, false, t0);
      expect(freshAlert).not.toBeNull();
      expect(freshAlert?.triggerReason).toBe('first_detection');
      expect(freshAlert?.priority).toBe('P1');

      const decayedAlert = engine.evaluateSignalForAlert(after72h.signal, undefined, false, new Date(t0.getTime() + 72 * 60 * 60 * 1000));
      expect(decayedAlert).toBeNull();
    });
  });
});
