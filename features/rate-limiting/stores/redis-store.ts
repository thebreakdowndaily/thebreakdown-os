import type { RateLimitStore, RateLimitResult } from '../types';

export class RedisRateLimitStore implements RateLimitStore {
  readonly name = 'redis';
  private restUrl?: string;
  private restToken?: string;

  constructor(options?: { url?: string; token?: string }) {
    this.restUrl = options?.url || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
    this.restToken = options?.token || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
  }

  async increment(key: string, windowSeconds: number, maxLimit: number): Promise<RateLimitResult> {
    if (!this.restUrl || !this.restToken) {
      throw new Error('Redis credentials not configured');
    }

    const bucketWindow = Math.floor(Date.now() / (windowSeconds * 1000)).toString();
    const bucketKey = `rl:${key}:${bucketWindow}`;
    
    // Execute atomic pipeline: INCR + EXPIRE
    const pipelineUrl = `${this.restUrl.replace(/\/$/, '')}/pipeline`;
    const resp = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', bucketKey],
        ['EXPIRE', bucketKey, windowSeconds * 2],
        ['TTL', bucketKey],
      ]),
    });

    if (!resp.ok) {
      throw new Error(`Upstash Redis HTTP error: ${resp.status.toString()} ${resp.statusText}`);
    }

    const results = (await resp.json()) as Array<{ result: number }>;
    const current = results[0]?.result ?? 1;
    const ttl = results[2]?.result ?? windowSeconds;
    const resetSeconds = Math.max(1, ttl);

    const allowed = current <= maxLimit;
    const remaining = Math.max(0, maxLimit - current);

    return {
      allowed,
      limit: maxLimit,
      current,
      remaining,
      resetSeconds,
      retryAfterSeconds: allowed ? undefined : resetSeconds,
    };
  }

  async reset(key: string): Promise<void> {
    if (!this.restUrl || !this.restToken) return;
    try {
      await fetch(`${this.restUrl.replace(/\/$/, '')}/del/rl:${key}:*`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.restToken}` },
      });
    } catch {
      // Best-effort
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.restUrl || !this.restToken) return false;
    try {
      const resp = await fetch(`${this.restUrl.replace(/\/$/, '')}/ping`, {
        headers: { Authorization: `Bearer ${this.restToken}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }
}
