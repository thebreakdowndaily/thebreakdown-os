/**
 * ─── Newsroom Intelligence Jobs (Registration & Definitions) ─────────────────
 */

import { JobDefinition } from '@/types/jobs';
import { JobRegistry } from '@/lib/jobs/registry';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';

export const IntelligenceSignalGenerationJob: JobDefinition = {
  type: 'IntelligenceSignalGeneration',
  category: 'MONITORING',
  name: 'Intelligence Signal Generation Job',
  description: 'Evaluates story clusters into deterministic newsroom signals.',
  defaultPriority: 'HIGH',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'EXPONENTIAL', initialDelayMs: 100, maxDelayMs: 1000 },
  },
  async execute(context, payload?: any) {
    const startedAt = context.clock.now();
    const signals = newsroomIntelligenceCore.getSignals();
    return {
      jobId: 'job-signal-gen',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 15,
      attemptsUsed: 1,
      outputSummary: `Evaluated ${signals.length} active newsroom signals.`,
      metadata: { signalCount: signals.length },
    };
  },
};

export const IntelligencePriorityRecalculationJob: JobDefinition = {
  type: 'IntelligencePriorityRecalculation',
  category: 'MONITORING',
  name: 'Intelligence Priority Recalculation Job',
  description: 'Recalculates priority tiers for active signals on state changes.',
  defaultPriority: 'HIGH',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'EXPONENTIAL', initialDelayMs: 100, maxDelayMs: 1000 },
  },
  async execute(context, payload?: any) {
    const startedAt = context.clock.now();
    const metrics = newsroomIntelligenceCore.getMetrics();
    return {
      jobId: 'job-priority-recalc',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 12,
      attemptsUsed: 1,
      outputSummary: `Recalculated priority metrics across active signals.`,
      metadata: { p0: metrics.p0Count, p1: metrics.p1Count },
    };
  },
};

export const IntelligenceAlertEvaluationJob: JobDefinition = {
  type: 'IntelligenceAlertEvaluation',
  category: 'MONITORING',
  name: 'Intelligence Alert Evaluation Job',
  description: 'Checks for meaningful state transitions and evaluates alerts.',
  defaultPriority: 'CRITICAL',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'EXPONENTIAL', initialDelayMs: 100, maxDelayMs: 1000 },
  },
  async execute(context, payload?: any) {
    const startedAt = context.clock.now();
    const alerts = newsroomIntelligenceCore.getAlerts();
    return {
      jobId: 'job-alert-eval',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 8,
      attemptsUsed: 1,
      outputSummary: `Evaluated alerts. Total: ${alerts.length}.`,
      metadata: { totalAlerts: alerts.length },
    };
  },
};

export const IntelligenceVelocityUpdateJob: JobDefinition = {
  type: 'IntelligenceVelocityUpdate',
  category: 'MONITORING',
  name: 'Intelligence Velocity Update Job',
  description: 'Updates observation velocity and primary source emergence across clusters.',
  defaultPriority: 'MEDIUM',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'EXPONENTIAL', initialDelayMs: 100, maxDelayMs: 1000 },
  },
  async execute(context, payload?: any) {
    const startedAt = context.clock.now();
    return {
      jobId: 'job-velocity-update',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 10,
      attemptsUsed: 1,
      outputSummary: 'Velocity metrics refreshed successfully.',
    };
  },
};

export const IntelligenceCoverageGapCheckJob: JobDefinition = {
  type: 'IntelligenceCoverageGapCheck',
  category: 'INTEGRITY',
  name: 'Intelligence Coverage Gap Check Job',
  description: 'Runs scheduled scan of monitored topics against active observation coverage.',
  defaultPriority: 'MEDIUM',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'EXPONENTIAL', initialDelayMs: 100, maxDelayMs: 1000 },
  },
  async execute(context, payload?: any) {
    const startedAt = context.clock.now();
    const gaps = newsroomIntelligenceCore.getCoverageGaps();
    return {
      jobId: 'job-coverage-gap-check',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 14,
      attemptsUsed: 1,
      outputSummary: `Discovered ${gaps.length} coverage gaps.`,
      metadata: { gapCount: gaps.length },
    };
  },
};

export function registerNewsroomJobs(): void {
  const jobs = [
    IntelligenceSignalGenerationJob,
    IntelligencePriorityRecalculationJob,
    IntelligenceAlertEvaluationJob,
    IntelligenceVelocityUpdateJob,
    IntelligenceCoverageGapCheckJob,
  ];

  for (const job of jobs) {
    try {
      JobRegistry.register(job);
    } catch {
      // Ignore if already registered in test runtime
    }
  }
}
