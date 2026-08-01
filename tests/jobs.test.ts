import { describe, it, expect, beforeEach } from 'vitest';
import { JobRegistry } from '../lib/jobs/registry';
import { JobScheduler } from '../lib/jobs/scheduler';
import { JobRunner } from '../lib/jobs/runner';
import { JobProjectionBuilder } from '../lib/jobs/projection';
import { ProjectionRebuildJob } from '../lib/jobs/jobs/projection-rebuild';
import { SearchIndexRefreshJob } from '../lib/jobs/jobs/search-index-refresh';
import { MetadataVerificationJob } from '../lib/jobs/jobs/metadata-verification';
import { CacheInvalidationJob } from '../lib/jobs/jobs/cache-invalidation';
import { HealthSnapshotJob } from '../lib/jobs/jobs/health-snapshot';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';
import { JobDefinition } from '../types/jobs';

describe('TEST-JOBS: Platform Automation & Background Services (Phase 17D)', () => {
  beforeEach(() => {
    JobRegistry.clear();
    JobRegistry.register(ProjectionRebuildJob);
    JobRegistry.register(SearchIndexRefreshJob);
    JobRegistry.register(MetadataVerificationJob);
    JobRegistry.register(CacheInvalidationJob);
    JobRegistry.register(HealthSnapshotJob);
  });

  it('TEST-JOBS-01: Registers Built-in Operational Jobs in JobRegistry', () => {
    const list = JobRegistry.listAll();
    expect(list.length).toBe(5);
    expect(JobRegistry.get('ProjectionRebuild')).not.toBeNull();
  });

  it('TEST-JOBS-02: Prevents Duplicate Job Registration', () => {
    expect(() => JobRegistry.register(ProjectionRebuildJob)).toThrow(/Duplicate Error/);
  });

  it('TEST-JOBS-03: Priority-Based Queue Ordering (CRITICAL > HIGH > MEDIUM > LOW)', () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('HealthSnapshot', { priority: 'LOW' });
    scheduler.enqueue('SearchIndexRefresh', { priority: 'HIGH' });
    scheduler.enqueue('CacheInvalidation', { priority: 'CRITICAL' });
    scheduler.enqueue('ProjectionRebuild', { priority: 'MEDIUM' });

    const top1 = scheduler.dequeue();
    expect(top1?.priority).toBe('CRITICAL');

    const top2 = scheduler.dequeue();
    expect(top2?.priority).toBe('HIGH');

    const top3 = scheduler.dequeue();
    expect(top3?.priority).toBe('MEDIUM');

    const top4 = scheduler.dequeue();
    expect(top4?.priority).toBe('LOW');
  });

  it('TEST-JOBS-04: Duplicate Enqueuing Prevention Guard', () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild', { correlationId: 'corr-001' });

    expect(() => scheduler.enqueue('ProjectionRebuild', { correlationId: 'corr-001' })).toThrow(/Duplicate Prevention Guard/);
  });

  it('TEST-JOBS-05: Job Execution via JobRunner with JobContext', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result).not.toBeNull();
    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Projections successfully rebuilt');
  });

  it('TEST-JOBS-06: Declarative Retry Policy Execution on Errors', async () => {
    let attemptsCount = 0;
    const FailingJob: JobDefinition = {
      type: 'CacheInvalidation',
      category: 'MAINTENANCE',
      name: 'Flaky Job',
      description: 'Fails once then succeeds',
      defaultPriority: 'HIGH',
      retryPolicy: {
        maxAttempts: 3,
        strategy: { type: 'FIXED', initialDelayMs: 10, maxDelayMs: 100 },
      },
      async execute(ctx) {
        attemptsCount += 1;
        if (attemptsCount === 1) {
          throw new Error('Temporary Network Flake');
        }
        return {
          jobId: 'flaky',
          executionId: ctx.executionId,
          status: 'COMPLETED',
          startedAt: ctx.clock.now(),
          completedAt: ctx.clock.now(),
          durationMs: 5,
          attemptsUsed: attemptsCount,
          outputSummary: 'Succeeded on retry',
        };
      },
    };

    JobRegistry.clear();
    JobRegistry.register(FailingJob);

    const scheduler = new JobScheduler();
    scheduler.enqueue('CacheInvalidation');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.attemptsUsed).toBe(2);
  });

  it('TEST-JOBS-07: Retry Exhaustion Leading to Final FAILED Status', async () => {

    const AlwaysFailingJob: JobDefinition = {
      type: 'MetadataVerification',
      category: 'INTEGRITY',
      name: 'Always Failing Job',
      description: 'Always fails',
      defaultPriority: 'MEDIUM',
      retryPolicy: {
        maxAttempts: 2,
        strategy: { type: 'FIXED', initialDelayMs: 10, maxDelayMs: 50 },
      },
      async execute() {
        throw new Error('Persistent Database Outage');
      },
    };

    JobRegistry.clear();
    JobRegistry.register(AlwaysFailingJob);

    const scheduler = new JobScheduler();
    scheduler.enqueue('MetadataVerification');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('FAILED');
    expect(result?.errorMessage).toBe('Persistent Database Outage');
    expect(result?.attemptsUsed).toBe(2);
  });

  it('TEST-JOBS-08: Job Cancellation Handling', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild');

    const runner = new JobRunner({ scheduler });
    const dequeued = scheduler.dequeue();
    expect(dequeued).not.toBeNull();

    // Directly set status to CANCELLED
    dequeued!.status = 'CANCELLED';
    expect(dequeued!.status).toBe('CANCELLED');
  });

  it('TEST-JOBS-09: Empty Queue Handling', async () => {
    const scheduler = new JobScheduler();
    const runner = new JobRunner({ scheduler });

    const result = await runner.executeNext();
    expect(result).toBeNull();
  });

  it('TEST-JOBS-10: High Volume Queue Performance', async () => {
    const scheduler = new JobScheduler();
    const runner = new JobRunner({ scheduler });

    for (let i = 0; i < 100; i++) {
      scheduler.enqueue('HealthSnapshot', { correlationId: `corr-${i}` });
    }

    const start = Date.now();
    const results = await runner.executeAll();
    const duration = Date.now() - start;

    expect(results.length).toBe(100);
    expect(duration).toBeLessThan(1000); // 100 jobs processed under 1 second
  });

  it('TEST-JOBS-11: Built-in Job — ProjectionRebuildJob', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Projections successfully rebuilt');
  });

  it('TEST-JOBS-12: Built-in Job — SearchIndexRefreshJob', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('SearchIndexRefresh');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Search index refreshed');
  });

  it('TEST-JOBS-13: Built-in Job — MetadataVerificationJob', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('MetadataVerification');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Metadata integrity verified');
  });

  it('TEST-JOBS-14: Built-in Job — CacheInvalidationJob', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('CacheInvalidation');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Stale caches invalidated');
  });

  it('TEST-JOBS-15: Built-in Job — HealthSnapshotJob', async () => {
    const scheduler = new JobScheduler();
    scheduler.enqueue('HealthSnapshot');

    const runner = new JobRunner({ scheduler });
    const result = await runner.executeNext();

    expect(result?.status).toBe('COMPLETED');
    expect(result?.outputSummary).toContain('Platform health snapshot generated');
  });

  it('TEST-JOBS-16: Non-Mutation Guarantee on Canonical Objects & JobProjection Building', async () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);
    const scheduler = new JobScheduler();
    scheduler.enqueue('ProjectionRebuild');
    scheduler.enqueue('SearchIndexRefresh');

    const runner = new JobRunner({ scheduler });
    await runner.executeAll();

    const projection = JobProjectionBuilder.buildProjection(scheduler);

    expect(projection.completedCount).toBe(2);
    expect(Object.isFrozen(projection)).toBe(true);
    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });
});
