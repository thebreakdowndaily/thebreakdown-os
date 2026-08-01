// ── Context-Aware Adaptive Runbook Engine (Phase 21B WP4) ──────────────────────

import { AdaptiveRunbook } from '../../types/resilience';

export class AdaptiveRunbookEngine {
  /**
   * Generates explainable adaptive operational runbooks.
   */
  public static generateRunbooks(): readonly AdaptiveRunbook[] {
    const runbooks: AdaptiveRunbook[] = [
      {
        runbookId: 'rbk-cache-degradation',
        title: 'Search Cache Fallback & Warmup Playbook',
        triggeringCondition: 'SearchCache latency spike > 50ms or cache hit ratio drops below 90%',
        supportingEvidence: Object.freeze(['EVD-PERF-CACHE-01', 'ALRT-LATENCY-SPIKE']),
        prerequisiteChecks: Object.freeze(['Verify Liveness Probe /api/live = 200', 'Check Memory Utilization < 80%']),
        recommendedActions: Object.freeze([
          '1. Trigger Cache Pre-Warming Job via PriorityScheduler',
          '2. Switch SearchCache router to L2 fallback instance',
          '3. Monitor telemetry latency recovery for 5 minutes',
        ]),
        expectedOutcome: 'Search cache hit ratio recovers to 98%+, P95 latency drops < 15ms.',
        escalationCriteria: 'Escalate to Performance Lead if latency remains > 50ms after 10 minutes.',
      },
    ];

    return Object.freeze(runbooks.map((r) => Object.freeze({ ...r })));
  }
}
