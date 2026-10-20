import type { Event, EventType } from '@/types/canonical';
import { sanitizeDiagnosticError, createSanitizedError } from '@/lib/security/diagnostic-sanitizer';

export type EventHandler = (event: Event, signal?: AbortSignal) => void | Promise<void>;

const MAX_HISTORY = 500;

export interface PublishOptions {
  /**
   * Minimum number of active handlers required for dispatch to be considered successful.
   * If the number of matching registered handlers is less than minSubscribers,
   * publishAsync will reject with a NO_EVENT_CONSUMERS error.
   */
  minSubscribers?: number;
}

export interface PublishResult {
  deliveredCount: number;
  event: Event;
}

export interface IdempotentHandlerOptions {
  /**
   * Custom function to extract an idempotency key from an event.
   * Defaults to event.payload.idempotencyKey or outbox:${event.payload.outboxId}.
   */
  getIdempotencyKey?: (event: Event) => string | undefined;
  /** Maximum number of processed keys to retain in memory. Defaults to 1,000. */
  maxEntries?: number;
  /** Time-to-live for processed keys in milliseconds. Defaults to 10 minutes (600,000 ms). */
  ttlMs?: number;
  /** Timeout for handler execution in milliseconds. Defaults to 30,000 ms. Set to 0 to disable. */
  timeoutMs?: number;
}

/**
 * Wraps an event handler with in-memory idempotency enforcement and concurrency control.
 *
 * Operational Semantics:
 * 1. Concurrent Deduplication & Failure Propagation:
 *    Multiple concurrent deliveries with the same key join the single active in-flight
 *    execution. If the execution succeeds, all joined callers resolve. If it fails, all
 *    joined callers observe the failure faithfully (no swallowed rejections).
 * 2. Timeout & Overlapping Execution Prevention:
 *    A timeout does not cancel an arbitrary JavaScript promise. When timeoutMs expires,
 *    an AbortSignal is signaled and the awaiting caller rejects with a timeout error.
 *    However, the in-flight deduplication record remains held until the underlying
 *    handler promise actually settles. This ensures that work from a timed-out attempt
 *    cannot overlap with an immediate retry.
 * 3. Cooperative Cancellation:
 *    Handlers accepting the optional AbortSignal can abort network requests or database
 *    operations immediately upon timeout, settling the in-flight lock promptly.
 * 4. Strict LRU Capacity:
 *    Enforces maxEntries via true LRU eviction (expired entries first, then least-recently-used).
 * 5. Process Termination & Durability Boundary:
 *    In-memory tracking is local to the current process runtime and does not survive restarts.
 *    Authoritative at-least-once delivery, retry scheduling, and cross-restart durability
 *    are guaranteed by the PostgreSQL transactional outbox.
 * 6. Partial Success:
 *    The in-memory wrapper does not rollback external side effects if a handler fails mid-way.
 *    Handlers must either be naturally idempotent (such as cache invalidations) or provide
 *    their own atomic transactions.
 */
export function createIdempotentHandler(
  handler: EventHandler,
  options: IdempotentHandlerOptions = {},
): EventHandler {
  const maxEntries = options.maxEntries ?? 1000;
  const ttlMs = options.ttlMs ?? 600000; // 10 minutes default
  const timeoutMs = options.timeoutMs ?? 30000; // 30 seconds default
  const processedKeys = new Map<string, number>();
  const inFlight = new Map<string, Promise<void>>();

  const prune = (now: number) => {
    // 1. Evict expired entries
    for (const [k, timestamp] of processedKeys.entries()) {
      if (now - timestamp > ttlMs) {
        processedKeys.delete(k);
      }
    }
    // 2. Strict capacity enforcement: evict oldest keys until under maxEntries
    while (processedKeys.size >= maxEntries) {
      const oldestKey = processedKeys.keys().next().value;
      if (oldestKey === undefined) break;
      processedKeys.delete(oldestKey);
    }
  };

  return async (event: Event, signal?: AbortSignal): Promise<void> => {
    const key =
      options.getIdempotencyKey?.(event) ??
      (event.payload?.idempotencyKey as string | undefined) ??
      (event.payload?.outboxId ? `outbox:${event.payload.outboxId}` : undefined);

    const now = Date.now();

    if (key) {
      // 1. Check in-flight executions: joined callers await the running execution
      const activePromise = inFlight.get(key);
      if (activePromise) {
        if (timeoutMs > 0) {
          let joinTimerId: ReturnType<typeof setTimeout> | undefined;
          try {
            const timeoutPromise = new Promise<never>((_, reject) => {
              joinTimerId = setTimeout(() => {
                reject(new Error(`Handler execution timed out after ${timeoutMs}ms`));
              }, timeoutMs);
            });
            await Promise.race([activePromise, timeoutPromise]);
          } finally {
            if (joinTimerId) clearTimeout(joinTimerId);
          }
        } else {
          await activePromise;
        }
        return;
      }

      // 2. Check memorized processed keys: deduplicate completed deliveries
      const lastSeen = processedKeys.get(key);
      if (lastSeen !== undefined) {
        if (now - lastSeen < ttlMs) {
          // Refresh LRU position
          processedKeys.delete(key);
          processedKeys.set(key, lastSeen);
          return;
        } else {
          processedKeys.delete(key);
        }
      }
    }

    const controller = new AbortController();
    if (signal) {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
      }
    }

    let timerId: ReturnType<typeof setTimeout> | undefined;

    // Start raw handler execution, passing the abort signal for cooperative cancellation.
    const rawHandlerPromise = (async () => {
      await handler(event, controller.signal);
    })();

    // In-flight settlement promise:
    // Tracks the underlying side effect until it finishes (resolves or rejects).
    // It keeps `key` locked in `inFlight` until the underlying work actually settles,
    // guaranteeing that immediate retries cannot overlap with still-running work.
    const inFlightPromise = (async () => {
      try {
        await rawHandlerPromise;
        if (key) {
          prune(Date.now());
          processedKeys.set(key, Date.now());
        }
      } catch (err) {
        if (key) {
          processedKeys.delete(key);
        }
        throw err;
      } finally {
        if (key) {
          inFlight.delete(key);
        }
        if (timerId) {
          clearTimeout(timerId);
        }
      }
    })();

    // Attach silent rejection handler to inFlightPromise to suppress V8 unhandledRejection
    // warnings when no caller is awaiting at the precise instant of failure.
    // NOTE: This does NOT mutate inFlightPromise itself; callers awaiting inFlightPromise
    // will still receive the rejection faithfully.
    inFlightPromise.catch(() => {});

    if (key) {
      inFlight.set(key, inFlightPromise);
    }

    // For the primary caller, apply timeoutMs if configured
    if (timeoutMs > 0) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => {
          controller.abort(new Error(`Handler execution timed out after ${timeoutMs}ms`));
          reject(new Error(`Handler execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      await Promise.race([inFlightPromise, timeoutPromise]);
    } else {
      await inFlightPromise;
    }
  };
}

export class EventBus {
  private static instance: EventBus;
  private handlers = new Map<string, Set<EventHandler>>();
  private history: Event[] = [];

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(type: EventType | '*', handler: EventHandler): () => void {
    const key = type;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler);
    return () => {
      this.handlers.get(key)?.delete(handler);
    };
  }

  subscribeIdempotent(
    type: EventType | '*',
    handler: EventHandler,
    options?: IdempotentHandlerOptions,
  ): () => void {
    const idempotentHandler = createIdempotentHandler(handler, options);
    return this.subscribe(type, idempotentHandler);
  }

  publish(event: Omit<Event, 'timestamp'>): void {
    const fullEvent: Event = { ...event, timestamp: new Date().toISOString() };

    this.history.push(fullEvent);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    const asyncHandlers: Promise<void>[] = [];

    const dispatch = (key: string) => {
      const set = this.handlers.get(key);
      if (!set) return;
      for (const handler of set) {
        try {
          const result = handler(fullEvent);
          if (result instanceof Promise) {
            asyncHandlers.push(result);
          }
        } catch (syncErr) {
          console.error(
            JSON.stringify({
              event: 'event_bus.handler_error',
              errorName: syncErr instanceof Error ? syncErr.name : 'HandlerError',
              error: sanitizeDiagnosticError(syncErr),
              timestamp: new Date().toISOString(),
            }),
          );
        }
      }
    };

    dispatch(event.type);
    dispatch('*');

    if (asyncHandlers.length > 0) {
      Promise.allSettled(asyncHandlers).then((settled) => {
        for (const res of settled) {
          if (res.status === 'rejected') {
            const err = res.reason;
            console.error(
              JSON.stringify({
                event: 'event_bus.async_handler_error',
                errorName: err instanceof Error ? err.name : 'UnknownError',
                error: sanitizeDiagnosticError(err),
                timestamp: new Date().toISOString(),
              }),
            );
          }
        }
      });
    }
  }

  async publishAsync(
    event: Omit<Event, 'timestamp'>,
    options?: PublishOptions,
  ): Promise<PublishResult> {
    const fullEvent: Event = { ...event, timestamp: new Date().toISOString() };

    this.history.push(fullEvent);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    const handlersToRun: EventHandler[] = [];

    const collect = (key: string) => {
      const set = this.handlers.get(key);
      if (!set) return;
      for (const handler of set) {
        handlersToRun.push(handler);
      }
    };

    collect(event.type);
    collect('*');

    if (options?.minSubscribers !== undefined && handlersToRun.length < options.minSubscribers) {
      throw new Error(
        `NO_EVENT_CONSUMERS: Event "${event.type}" dispatched with ${handlersToRun.length} consumers, expected at least ${options.minSubscribers}`,
      );
    }

    if (handlersToRun.length === 0) {
      return { deliveredCount: 0, event: fullEvent };
    }

    // Invoke all handlers concurrently and settle all started promises without abandoning any
    const settled = await Promise.allSettled(
      handlersToRun.map(async (handler) => {
        await handler(fullEvent);
      }),
    );

    const errors: unknown[] = [];
    for (const res of settled) {
      if (res.status === 'rejected') {
        errors.push(res.reason);
      }
    }

    if (errors.length > 0) {
      for (const err of errors) {
        console.error(
          JSON.stringify({
            event: 'event_bus.async_handler_error',
            errorName: err instanceof Error ? err.name : 'UnknownError',
            error: sanitizeDiagnosticError(err),
            timestamp: new Date().toISOString(),
          }),
        );
      }

      const primary = errors[0];
      const safeMsg =
        errors.length === 1
          ? sanitizeDiagnosticError(primary)
          : `${sanitizeDiagnosticError(primary)} (and ${errors.length - 1} more handler failure${errors.length > 2 ? 's' : ''})`;

      const errToThrow = new Error(safeMsg);
      errToThrow.name = primary instanceof Error && primary.name ? primary.name : 'HandlerError';
      throw errToThrow;
    }

    return { deliveredCount: handlersToRun.length, event: fullEvent };
  }

  getHistory(limit?: number): Event[] {
    if (limit && limit > 0) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }
}

export const eventBus = EventBus.getInstance();
