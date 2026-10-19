import type { Event, EventType } from '@/types/canonical';
import { sanitizeDiagnosticError, createSanitizedError } from '@/lib/security/diagnostic-sanitizer';

export type EventHandler = (event: Event) => void | Promise<void>;

const MAX_HISTORY = 500;

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
 * Wraps an event handler with idempotency enforcement.
 *
 * Guarantees:
 * 1. Concurrent In-Flight Deduplication: Multiple concurrent deliveries with the same key
 *    await the single running execution rather than executing concurrently.
 * 2. Strict LRU Capacity: Enforces maxEntries via true LRU eviction (expired entries first,
 *    then least-recently-used).
 * 3. Failure Eviction: Failed or timed-out handler executions evict the key so retries can execute.
 * 4. Success Memorization: Successful completions are recorded with TTL.
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

  return async (event: Event): Promise<void> => {
    const key =
      options.getIdempotencyKey?.(event) ??
      (event.payload?.idempotencyKey as string | undefined) ??
      (event.payload?.outboxId ? `outbox:${event.payload.outboxId}` : undefined);

    const now = Date.now();

    if (key) {
      // Check in-flight executions: deduplicate concurrent delivery within this runtime
      const activePromise = inFlight.get(key);
      if (activePromise) {
        await activePromise;
        return;
      }

      // Check memorized processed keys: deduplicate completed deliveries
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

    const task = (async () => {
      let timerId: ReturnType<typeof setTimeout> | undefined;
      try {
        const handlerPromise = Promise.resolve(handler(event));
        if (timeoutMs > 0) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(() => {
              reject(new Error(`Handler execution timed out after ${timeoutMs}ms`));
            }, timeoutMs);
          });
          await Promise.race([handlerPromise, timeoutPromise]);
        } else {
          await handlerPromise;
        }

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
        if (timerId) clearTimeout(timerId);
      }
    })();

    if (key) {
      // Attach a silent catch handler to avoid unhandledRejection events in Node/V8
      inFlight.set(
        key,
        task.catch(() => {}),
      );
    }

    try {
      await task;
    } finally {
      if (key) {
        inFlight.delete(key);
      }
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

  async publishAsync(event: Omit<Event, 'timestamp'>): Promise<void> {
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

    if (handlersToRun.length === 0) {
      return;
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
