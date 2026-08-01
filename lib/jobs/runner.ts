// ── Job Runner (Phase 17D WP3) ──────────────────────────────────────────────────

import { JobInstance, JobContext, JobResult } from '../../types/jobs';
import { JobRegistry } from './registry';
import { JobScheduler } from './scheduler';
import { TelemetryCollector } from '../telemetry/collector';
import { TelemetryEventBuilder } from '../telemetry/events/builders';

export interface JobRunnerOptions {
  scheduler: JobScheduler;
  collector?: TelemetryCollector;
  logger?: { info(msg: string): void; error(msg: string): void };
  clock?: { now(): string };
}

export class JobRunner {
  private scheduler: JobScheduler;
  private collector?: TelemetryCollector;
  private logger: { info(msg: string): void; error(msg: string): void };
  private clock: { now(): string };

  constructor(options: JobRunnerOptions) {
    this.scheduler = options.scheduler;
    this.collector = options.collector;
    this.logger = options.logger || {
      info: () => {},
      error: () => {},
    };
    this.clock = options.clock || {
      now: () => new Date().toISOString(),
    };
  }

  /**
   * Executes the next pending job from the scheduler queue.
   */
  public async executeNext(): Promise<JobResult | null> {
    const jobInstance = this.scheduler.dequeue();
    if (!jobInstance) return null;

    return this.executeJobInstance(jobInstance);
  }

  /**
   * Executes all queued jobs until queue is empty.
   */
  public async executeAll(): Promise<JobResult[]> {
    const results: JobResult[] = [];
    let result = await this.executeNext();

    while (result !== null) {
      results.push(result);
      result = await this.executeNext();
    }

    return results;
  }

  /**
   * Internal job execution logic handling retries and context passing.
   */
  private async executeJobInstance(instance: JobInstance): Promise<JobResult> {
    const definition = JobRegistry.get(instance.type);
    if (!definition) {
      const errorResult: JobResult = {
        jobId: instance.jobId,
        executionId: `exec-err-${Date.now()}`,
        status: 'FAILED',
        startedAt: this.clock.now(),
        completedAt: this.clock.now(),
        durationMs: 0,
        attemptsUsed: 0,
        outputSummary: 'Job execution failed: JobDefinition missing from registry.',
        errorMessage: `Unregistered job type "${instance.type}".`,
      };
      instance.status = 'FAILED';
      instance.result = errorResult;
      this.scheduler.recordResult(instance.jobId, instance);
      return errorResult;
    }

    const executionId = `exec-${instance.jobId}-${Date.now()}`;
    const cancellationToken = { isCancelled: false };

    const context: JobContext = {
      executionId,
      correlationId: instance.correlationId,
      clock: this.clock,
      logger: this.logger,
      configuration: {},
      cancellationToken,
    };

    let attemptsUsed = 0;
    let lastError: Error | null = null;
    let finalResult: JobResult | null = null;

    while (attemptsUsed < instance.retryPolicy.maxAttempts && !finalResult) {
      attemptsUsed += 1;
      instance.attempts = attemptsUsed;

      try {
        if (cancellationToken.isCancelled) {
          instance.status = 'CANCELLED';
          finalResult = {
            jobId: instance.jobId,
            executionId,
            status: 'CANCELLED',
            startedAt: this.clock.now(),
            completedAt: this.clock.now(),
            durationMs: 0,
            attemptsUsed,
            outputSummary: 'Job execution cancelled prior to completion.',
          };
          break;
        }

        finalResult = await definition.execute(context, instance.payload);
        finalResult.attemptsUsed = attemptsUsed;
        instance.status = finalResult.status;
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`[${executionId}] Attempt ${attemptsUsed} failed: ${lastError.message}`);
      }
    }

    if (!finalResult) {
      instance.status = 'FAILED';
      finalResult = {
        jobId: instance.jobId,
        executionId,
        status: 'FAILED',
        startedAt: this.clock.now(),
        completedAt: this.clock.now(),
        durationMs: 0,
        attemptsUsed,
        outputSummary: `Job failed after ${attemptsUsed} attempt(s).`,
        errorMessage: lastError?.message || 'Execution error.',
      };
    }

    instance.result = finalResult;
    this.scheduler.recordResult(instance.jobId, instance);

    // Emit Telemetry Observation Event if collector present
    if (this.collector) {
      this.collector.collect(
        TelemetryEventBuilder.createEvent(
          finalResult.status === 'COMPLETED' ? 'BuildCompleted' : 'APIError',
          'job-runner',
          {
            jobId: instance.jobId,
            jobType: instance.type,
            durationMs: finalResult.durationMs,
            status: finalResult.status,
          }
        )
      );
    }

    return finalResult;
  }
}
