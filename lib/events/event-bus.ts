import type { Event, EventType } from '@/types/canonical';

export type EventHandler = (event: Event) => void | Promise<void>;

const MAX_HISTORY = 500;

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
        const result = handler(fullEvent);
        if (result instanceof Promise) {
          asyncHandlers.push(result);
        }
      }
    };

    dispatch(event.type);
    dispatch('*');

    if (asyncHandlers.length > 0) {
      Promise.all(asyncHandlers).catch((err) =>
        console.error('[EventBus] async handler error:', err)
      );
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
