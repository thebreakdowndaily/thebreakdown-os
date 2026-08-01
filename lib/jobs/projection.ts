// ── Job Projection Builder Layer (Phase 17D Recommendation 1) ──────────────────

import { JobInstance, JobProjection, JobCategory, JobResult } from '../../types/jobs';
import { JobScheduler } from './scheduler';

export class JobProjectionBuilder {
  /**
   * Builds an immutable JobProjection from scheduler queues and historical execution results.
   */
  public static buildProjection(
    scheduler: JobScheduler,
    options?: {
      projectionId?: string;
      platformVersion?: string;
      currentTime?: Date;
    }
  ): JobProjection {
    const timestamp = options?.currentTime ? options.currentTime.toISOString() : new Date().toISOString();
    const queue = scheduler.getQueue();
    const active = scheduler.getActiveJobs();
    const history = scheduler.getHistory();

    const pendingCount = queue.length;
    const runningCount = active.length;

    let completedCount = 0;
    let failedCount = 0;
    let cancelledCount = 0;
    let totalDurationMs = 0;
    const recentResults: JobResult[] = [];

    const categoryBreakdown: Record<JobCategory, number> = {
      MAINTENANCE: 0,
      INTEGRITY: 0,
      SEARCH: 0,
      MONITORING: 0,
    };

    // Calculate queue category breakdown
    for (const item of [...queue, ...active]) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    }

    // Process history
    for (const item of history) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;

      if (item.status === 'COMPLETED') completedCount += 1;
      if (item.status === 'FAILED') failedCount += 1;
      if (item.status === 'CANCELLED') cancelledCount += 1;

      if (item.result) {
        totalDurationMs += item.result.durationMs || 0;
        recentResults.push(item.result);
      }
    }

    const totalEnqueued = pendingCount + runningCount + history.length;
    const totalFinished = completedCount + failedCount + cancelledCount;
    const averageDurationMs = totalFinished > 0 ? Math.round(totalDurationMs / totalFinished) : 0;
    const throughputPerMinute = Math.round(totalFinished * 60);

    return Object.freeze({
      projectionId: options?.projectionId || `proj-jobs-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'AR-13A.0',
      generatedAt: timestamp,
      totalEnqueued,
      pendingCount,
      runningCount,
      completedCount,
      failedCount,
      cancelledCount,
      throughputPerMinute,
      averageDurationMs,
      categoryBreakdown: Object.freeze(categoryBreakdown),
      recentResults: Object.freeze(recentResults.slice(-10)),
    });
  }
}
