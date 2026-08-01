// ── Job Scheduler (Phase 17D WP2) ──────────────────────────────────────────────

import { JobInstance, JobPriority, JobType, JobCategory, RetryPolicy } from '../../types/jobs';
import { JobRegistry } from './registry';

const PRIORITY_RANK: Record<JobPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export class JobScheduler {
  private queue: JobInstance[] = [];
  private activeJobs = new Map<string, JobInstance>();
  private completedHistory: JobInstance[] = [];
  private sequenceCounter = 0;

  private generateJobId(type: JobType): string {
    this.sequenceCounter += 1;
    return `job-${type.toLowerCase()}-${Date.now()}-${this.sequenceCounter}`;
  }

  /**
   * Enqueues an operational job for execution.
   */
  public enqueue(
    type: JobType,
    options?: {
      priority?: JobPriority;
      correlationId?: string;
      payload?: unknown;
      customRetryPolicy?: RetryPolicy;
    }
  ): JobInstance {
    const definition = JobRegistry.get(type);
    if (!definition) {
      throw new Error(`JobScheduler Error: Unregistered job type "${type}". Register job definition first.`);
    }

    const correlationId = options?.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Duplicate Prevention Guard: Prevent enqueuing duplicate pending/running jobs with same correlationId & type
    const isDuplicate = this.queue.some((j) => j.type === type && j.correlationId === correlationId) ||
      Array.from(this.activeJobs.values()).some((j) => j.type === type && j.correlationId === correlationId);

    if (isDuplicate) {
      throw new Error(`JobScheduler Duplicate Prevention Guard: Job of type "${type}" with correlationId "${correlationId}" is already enqueued or running.`);
    }

    const instance: JobInstance = {
      jobId: this.generateJobId(type),
      correlationId,
      type: definition.type,
      category: definition.category,
      priority: options?.priority || definition.defaultPriority,
      status: 'PENDING',
      scheduledAt: new Date().toISOString(),
      payload: options?.payload,
      attempts: 0,
      retryPolicy: options?.customRetryPolicy || definition.retryPolicy,
    };

    this.queue.push(instance);
    this.sortQueue();
    return Object.freeze({ ...instance });
  }

  /**
   * Sorts queue deterministically by Priority Rank (CRITICAL -> LOW) then by scheduledAt.
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const rankA = PRIORITY_RANK[a.priority];
      const rankB = PRIORITY_RANK[b.priority];
      if (rankA !== rankB) return rankB - rankA;
      return Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt);
    });
  }

  /**
   * Dequeues the highest priority pending job.
   */
  public dequeue(): JobInstance | null {
    if (this.queue.length === 0) return null;
    const item = this.queue.shift()!;
    item.status = 'RUNNING';
    this.activeJobs.set(item.jobId, item);
    return item;
  }

  /**
   * Records completed or failed job execution into history.
   */
  public recordResult(jobId: string, instance: JobInstance): void {
    this.activeJobs.delete(jobId);
    this.completedHistory.push(Object.freeze({ ...instance }));
  }

  public getQueue(): readonly JobInstance[] {
    return Object.freeze([...this.queue]);
  }

  public getActiveJobs(): readonly JobInstance[] {
    return Object.freeze(Array.from(this.activeJobs.values()));
  }

  public getHistory(): readonly JobInstance[] {
    return Object.freeze([...this.completedHistory]);
  }

  public clear(): void {
    this.queue = [];
    this.activeJobs.clear();
    this.completedHistory = [];
  }
}
