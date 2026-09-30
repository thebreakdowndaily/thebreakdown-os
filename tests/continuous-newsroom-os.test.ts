/**
 * ─── Continuous Newsroom Operating System Test Suite ──────────────────────────
 *
 * Governing document: AGENTS.md (Phase 11 Continuous Newsroom OS)
 *
 * Verifies:
 * 1. 7 Canonical Source Health States & Transitions
 * 2. Deterministic SNR Mathematical Formula & Priority Tiers
 * 3. Anti-Fatigue Noise Suppression & Alert Deduplication
 * 4. Cross-Surface Consistency Reconciliation Engine
 * 5. Production Heartbeat Evaluation
 * 6. Kill Switch & Emergency Operational Controls
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RadarSourceHealthMonitor } from '@/services/radar/source-health';
import { NewsroomTriageEngine } from '@/services/intelligence/newsroom/triage-engine';
import { ReconciliationEngine } from '@/services/monitoring/reconciliation-engine';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';

describe('Continuous Newsroom Operating System — Core Primitives', () => {
  describe('1. 7 Canonical Source Health States', () => {
    let monitor: RadarSourceHealthMonitor;

    beforeEach(() => {
      monitor = new RadarSourceHealthMonitor();
    });

    it('should initialize source with unknown health status', () => {
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('unknown');
      expect(health.scheduleState).toBe('READY');
      expect(health.consecutiveFailures).toBe(0);
    });

    it('should mark source healthy upon successful fetch', () => {
      monitor.recordSuccess('src-test-1', 250, 60);
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('healthy');
      expect(health.scheduleState).toBe('SUCCEEDED');
      expect(health.lastHttpStatus).toBe(200);
      expect(health.consecutiveFailures).toBe(0);
    });

    it('should mark source degraded on first failure and failing on 3+ failures', () => {
      monitor.recordFailure('src-test-1', 500, 'Internal Server Error');
      expect(monitor.getHealth('src-test-1').status).toBe('degraded');
      expect(monitor.getHealth('src-test-1').consecutiveFailures).toBe(1);

      monitor.recordFailure('src-test-1', 502, 'Bad Gateway');
      expect(monitor.getHealth('src-test-1').status).toBe('degraded');
      expect(monitor.getHealth('src-test-1').consecutiveFailures).toBe(2);

      monitor.recordFailure('src-test-1', 503, 'Service Unavailable');
      expect(monitor.getHealth('src-test-1').status).toBe('failing');
      expect(monitor.getHealth('src-test-1').consecutiveFailures).toBe(3);
    });

    it('should transition to changed status upon upstream content modification', () => {
      monitor.recordChange('src-test-1');
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('changed');
      expect(health.totalChanges).toBe(1);
      expect(health.lastChangedAt).toBeDefined();
    });

    it('should transition to stale status', () => {
      monitor.markStale('src-test-1');
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('stale');
      expect(health.scheduleState).toBe('STALE');
    });

    it('should transition to unavailable status with reason', () => {
      monitor.markUnavailable('src-test-1', 'HTTP 404 Not Found permanently');
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('unavailable');
      expect(health.scheduleState).toBe('DISABLED');
      expect(health.lastError).toContain('HTTP 404');
    });

    it('should transition to disputed status', () => {
      monitor.markDisputed('src-test-1', 'Editorial audit flagged potential fabrication');
      const health = monitor.getHealth('src-test-1');
      expect(health.status).toBe('disputed');
      expect(health.lastError).toContain('Editorial audit');
    });
  });

  describe('2. Deterministic Signal-to-Noise Ratio (SNR) Triage Engine', () => {
    let triage: NewsroomTriageEngine;

    beforeEach(() => {
      triage = new NewsroomTriageEngine(60);
    });

    it('should calculate exact mathematical SNR with formula', () => {
      // (Salience * Authority * Confidence) / (Frequency * Load)
      // (0.90 * 1.00 * 0.95) / (1.0 * 1.0) = 0.855 / 1.0 = 0.855
      const result = triage.calculateSNR({
        evidenceSalience: 0.9,
        sourceAuthority: 1.0,
        confidence: 0.95,
        updateFrequency: 1.0,
        cognitiveLoad: 1.0,
      });

      expect(result.snr).toBe(0.855);
      expect(result.numerator).toBeCloseTo(0.855, 3);
      expect(result.denominator).toBe(1.0);
    });

    it('should penalize high-frequency and high-load noisy inputs', () => {
      // (0.90 * 1.00 * 0.95) / (2.0 * 2.0) = 0.855 / 4.0 = 0.2138
      const result = triage.calculateSNR({
        evidenceSalience: 0.9,
        sourceAuthority: 1.0,
        confidence: 0.95,
        updateFrequency: 2.0,
        cognitiveLoad: 2.0,
      });

      expect(result.snr).toBeLessThan(0.25);
      expect(result.denominator).toBe(4.0);
    });

    it('should classify signals into critical tier (SNR >= 0.85)', () => {
      const mockSignal: NewsroomSignal = {
        id: 'sig-crit-1',
        title: 'Supreme Court Strikes Down Electoral Law in Unanimous Verdict',
        clusterId: 'cluster-crit-1',
        version: 1,
        priority: 'P0',
        lifecycleState: 'investigating',
        scores: {
          importance: 95,
          evidenceStrength: 95,
          velocity: 90,
          relevance: 95,
          sourceReliability: 95,
          novelty: 80,
          uncertainty: 5,
          misinformationRisk: 5,
          confidence: 95,
        },
        primarySourceCount: 2,
        contradictionIds: [],
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        explanation: {
          priority: 'P0',
          compositeScore: 95,
          threshold: 85,
          triggeredRules: [],
          whyItMatters: 'National constitutional precedent',
          evidenceBasis: [],
          recommendedAction: 'Immediate dispatch',
        },
      };

      const assessment = triage.triageSignal(mockSignal);
      expect(assessment.snr).toBeGreaterThanOrEqual(0.85);
      expect(assessment.tier).toBe('critical');
      expect(assessment.mappedPriority).toBe('P0');
      expect(assessment.action).toBe('immediate_dispatch');
      expect(assessment.suppressNotification).toBe(false);
    });

    it('should classify low SNR signals and route them to background digest', () => {
      const mockSignal: NewsroomSignal = {
        id: 'sig-low-1',
        title: 'Minor Local Road Paving Announced in District Sub-div',
        clusterId: 'cluster-low-1',
        version: 1,
        priority: 'P3',
        lifecycleState: 'monitoring',
        scores: {
          importance: 25,
          evidenceStrength: 30,
          velocity: 15,
          relevance: 20,
          sourceReliability: 50,
          novelty: 10,
          uncertainty: 20,
          misinformationRisk: 10,
          confidence: 60,
        },
        primarySourceCount: 0,
        contradictionIds: [],
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        explanation: {
          priority: 'P3',
          compositeScore: 25,
          threshold: 0,
          triggeredRules: [],
          whyItMatters: 'Hyperlocal routine event',
          evidenceBasis: [],
          recommendedAction: 'Monitor development',
        },
      };

      const assessment = triage.triageSignal(mockSignal);
      expect(assessment.snr).toBeLessThan(0.4);
      expect(assessment.tier).toBe('low');
      expect(assessment.mappedPriority).toBe('P3');
      expect(assessment.action).toBe('noise_suppressed');
      expect(assessment.suppressNotification).toBe(true);
    });

    it('should suppress repeated notifications within alert window if salience delta is small', () => {
      const mockSignal: NewsroomSignal = {
        id: 'sig-repeat-1',
        title: 'Developing Policy Discussion in Parliamentary Committee',
        clusterId: 'cluster-repeat-1',
        version: 1,
        priority: 'P1',
        lifecycleState: 'investigating',
        scores: {
          importance: 75,
          evidenceStrength: 75,
          velocity: 70,
          relevance: 80,
          sourceReliability: 85,
          novelty: 60,
          uncertainty: 10,
          misinformationRisk: 5,
          confidence: 85,
        },
        primarySourceCount: 1,
        contradictionIds: [],
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        explanation: {
          priority: 'P1',
          compositeScore: 75,
          threshold: 70,
          triggeredRules: [],
          whyItMatters: 'Policy shift',
          evidenceBasis: [],
          recommendedAction: 'Priority coverage',
        },
      };

      const firstAssessment = triage.triageSignal(mockSignal);
      expect(firstAssessment.suppressNotification).toBe(false);

      // Second signal arrives 10 minutes later with identical or slightly incremented salience
      const secondSignal: NewsroomSignal = {
        ...mockSignal,
        scores: {
          ...mockSignal.scores,
          evidenceStrength: 78, // Only delta +0.03
        },
      };

      const secondAssessment = triage.triageSignal(secondSignal);
      expect(secondAssessment.suppressNotification).toBe(true);
      expect(secondAssessment.suppressionReason).toContain('Noise suppression');
    });
  });

  describe('3. Public Consistency Reconciliation Engine', () => {
    it('should audit canonical cross-surface consistency without errors', async () => {
      const engine = ReconciliationEngine.getInstance();
      const report = await engine.auditReconciliation();

      expect(report.totalEntitiesAudited).toBeGreaterThan(0);
      expect(report.overallHealthScore).toBeGreaterThanOrEqual(90);
      expect(report.surfaces.sitemap).toBeDefined();
      expect(report.surfaces.metadata).toBeDefined();
      expect(report.surfaces.json_ld).toBeDefined();
      expect(report.surfaces.search_index).toBeDefined();
      expect(report.surfaces.feed).toBeDefined();
    });

    it('should generate a production heartbeat with healthy status', async () => {
      const engine = ReconciliationEngine.getInstance();
      const heartbeat = await engine.generateProductionHeartbeat();

      expect(heartbeat.status).toBe('HEALTHY');
      expect(heartbeat.score).toBeGreaterThanOrEqual(90);
      expect(heartbeat.checks.sitemapParity).toBe(true);
      expect(heartbeat.checks.metadataParity).toBe(true);
      expect(heartbeat.checks.structuredDataParity).toBe(true);
      expect(heartbeat.checks.searchIndexFresh).toBe(true);
    });
  });

  describe('4. Operational Kill Switch & Emergency Mode', () => {
    it('should immediately halt alerting when emergency kill switch is engaged', () => {
      const core = NewsroomIntelligenceCore.getInstance();
      core.activatePhase1InternalAlerting(true);
      expect(core.isPhase1Active()).toBe(true);

      // Engage kill switch
      core.engageKillSwitch();
      expect(core.isPhase1Active()).toBe(false);
    });
  });
});
