/**
 * THE BREAKDOWN — Repository & Concurrency Errors
 */

/**
 * Error thrown when a concurrent update to an entity (e.g. Story) fails
 * due to a version conflict in Optimistic Concurrency Control (OCC).
 */
export class OptimisticLockError extends Error {
  readonly code = 'OPTIMISTIC_LOCK_CONFLICT';
  readonly status = 409;

  constructor(
    message: string,
    public readonly entityId: string,
    public readonly expectedVersion?: number,
    public readonly actualVersion?: number
  ) {
    super(message);
    this.name = 'OptimisticLockError';
    Object.setPrototypeOf(this, OptimisticLockError.prototype);
  }
}
