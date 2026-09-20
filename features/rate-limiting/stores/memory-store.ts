import type { RateLimitStore, RateLimitResult } from '../types';

interface WindowEntry {
  windowStart: number;
  count: number;
}

export class MemoryRateLimitStore implements RateLimitStore {
  readonly name = 'memory';
  private buckets = new Map<string, WindowEntry>();

  increment(key: string, windowSeconds: number, maxLimit: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const currentWindowStart = Math.floor(now / windowMs) * windowMs;

    let entry = this.buckets.get(key);
    if (!entry || entry.windowStart !== currentWindowStart) {
      entry = { windowStart: currentWindowStart, count: 1 };
      this.buckets.set(key, entry);
    } else {
      entry.count++;
    }

    const resetSeconds = Math.max(1, Math.ceil((entry.windowStart + windowMs - now) / 1000));
    const allowed = entry.count <= maxLimit;
    const remaining = Math.max(0, maxLimit - entry.count);

    // Opportunistic cleanup
    if (this.buckets.size > 2000) {
      for (const [k, v] of this.buckets.entries()) {
        if (now - v.windowStart > windowMs * 2) {
          this.buckets.delete(k);
        }
      }
    }

    return Promise.resolve({
      allowed,
      limit: maxLimit,
      current: entry.count,
      remaining,
      resetSeconds,
      retryAfterSeconds: allowed ? undefined : resetSeconds,
    });
  }

  reset(key: string): Promise<void> {
    this.buckets.delete(key);
    return Promise.resolve();
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  clear(): void {
    this.buckets.clear();
  }
}
