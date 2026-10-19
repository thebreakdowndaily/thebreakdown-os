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
}

/**
 * Wraps an event handler with idempotency enforcement.
 * If an event with an already-processed key is received within ttlMs,
 * duplicate delivery is skipped without re-executing non-idempotent business logic.
 * If the handler fails, the key is evicted so retries can execute.
 */
export function createIdempotentHandler(
  handler: EventHandler,
  options: IdempotentHandlerOptions = {},
): EventHandler {
  const maxEntries = options.maxEntries ?? 1000;
  const ttlMs = options.ttlMs ?? 600000; // 10 minutes default
  const processedKeys = new Map<string, number>();

  return async (event: Event): Promise<void> => {
    const key =
      options.getIdempotencyKey?.(event) ??
      (event.payload?.idempotencyKey as string | undefined) ??
      (event.payload?.outboxId ? `outbox:${event.payload.outboxId}` : undefined);

    const now = Date.now();

    // Periodic eviction of expired keys if map grows beyond limit
    if (processedKeys.size > maxEntries) {
      for (const [k, timestamp] of processedKeys.entries()) {
        if (now - timestamp > ttlMs) {
          processedKeys.delete(k);
        }
      }
    }

    if (key) {
      const lastSeen = processedKeys.get(key);
      if (lastSeen !== undefined && now - lastSeen < ttlMs) {
        // Duplicate delivery detected: skip re-execution of non-idempotent action
        return;
      }
    }

    try {
      const result = handler(event);
      if (result instanceof Promise) {
        await result;
      }
      if (key) {
        processedKeys.set(key, now);
      }
    } catch (err) {
      // If handler throws, evict the key so retry attempts can re-execute
      if (key) {
        processedKeys.delete(key);
      }
      throw err;
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
      Promise.all(asyncHandlers).catch((err) => {
        const errorName = err instanceof Error ? err.name : 'UnknownError';
        const safeMsg = sanitizeDiagnosticError(err);
        console.error(
          JSON.stringify({
            event: 'event_bus.async_handler_error',
            errorName,
            error: safeMsg,
            timestamp: new Date().toISOString(),
          }),
        );
      });
    }
  }

  async publishAsync(event: Omit<Event, 'timestamp'>): Promise<void> {
    const fullEvent: Event = { ...event, timestamp: new Date().toISOString() };

    this.history.push(fullEvent);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    const promises: Promise<void>[] = [];

    const dispatch = (key: string) => {
      const set = this.handlers.get(key);
      if (!set) return;
      for (const handler of set) {
        try {
          const result = handler(fullEvent);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (syncErr) {
          throw createSanitizedError(syncErr, 'HandlerError');
        }
      }
    };

    try {
      dispatch(event.type);
      dispatch('*');
    } catch (dispatchErr) {
      throw createSanitizedError(dispatchErr);
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (err) {
        throw createSanitizedError(err);
      }
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
