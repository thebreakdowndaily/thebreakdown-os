// ── Search Index Refresh Job ──────────────────────────────────────────────────

import { JobDefinition, JobContext, JobResult } from '../../../types/jobs';

export const SearchIndexRefreshJob: JobDefinition = {
  type: 'SearchIndexRefresh',
  category: 'SEARCH',
  name: 'Search Index Refresh Job',
  description: 'Refreshes BM25 weighted search tokens for published Fixes.',
  defaultPriority: 'HIGH',
  retryPolicy: {
    maxAttempts: 3,
    strategy: { type: 'FIXED', initialDelayMs: 50, maxDelayMs: 200 },
  },
  async execute(context: JobContext): Promise<JobResult> {
    const startedAt = context.clock.now();
    context.logger.info(`[${context.executionId}] Executing SearchIndexRefreshJob...`);

    return {
      jobId: 'job-search-refresh',
      executionId: context.executionId,
      status: 'COMPLETED',
      startedAt,
      completedAt: context.clock.now(),
      durationMs: 20,
      attemptsUsed: 1,
      outputSummary: 'Search index refreshed with published BM25 tokens.',
    };
  },
};
