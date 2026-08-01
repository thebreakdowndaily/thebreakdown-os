// ── Platform Automation & Job Domain Specification (Phase 17D) ───────────────
// Observational & Operational job domain types. Immutable interfaces.

export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobCategory = 'MAINTENANCE' | 'INTEGRITY' | 'SEARCH' | 'MONITORING';

export type JobType =
  | 'ProjectionRebuild'
  | 'SearchIndexRefresh'
  | 'MetadataVerification'
  | 'CacheInvalidation'
  | 'HealthSnapshot';

export interface BackoffStrategy {
  type: 'FIXED' | 'EXPONENTIAL';
  initialDelayMs: number;
  maxDelayMs: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  strategy: BackoffStrategy;
  retryableErrors?: string[];
}

export interface JobContext {
  executionId: string;
  correlationId: string;
  clock: {
    now(): string;
  };
  logger: {
    info(msg: string): void;
    error(msg: string): void;
  };
  configuration: Record<string, unknown>;
  cancellationToken: {
    isCancelled: boolean;
  };
}

export interface JobResult {
  jobId: string;
  executionId: string;
  status: JobStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  attemptsUsed: number;
  outputSummary: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface JobDefinition {
  type: JobType;
  category: JobCategory;
  name: string;
  description: string;
  defaultPriority: JobPriority;
  retryPolicy: RetryPolicy;
  execute(context: JobContext, payload?: unknown): Promise<JobResult>;
}

export interface JobInstance {
  jobId: string;
  correlationId: string;
  type: JobType;
  category: JobCategory;
  priority: JobPriority;
  status: JobStatus;
  scheduledAt: string;
  payload?: unknown;
  attempts: number;
  retryPolicy: RetryPolicy;
  result?: JobResult;
}

export interface JobProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  totalEnqueued: number;
  pendingCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
  throughputPerMinute: number;
  averageDurationMs: number;
  categoryBreakdown: Record<JobCategory, number>;
  recentResults: readonly JobResult[];
}
