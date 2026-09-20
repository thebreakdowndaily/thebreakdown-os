import { NextResponse } from 'next/server';
import { logSecurityEvent } from '@/features/security/audit-logger';
import { MemoryRateLimitStore } from './stores/memory-store';
import { PostgresRateLimitStore } from './stores/postgres-store';
import { RedisRateLimitStore } from './stores/redis-store';
import type { RateLimitStore, RateLimitTier, RateLimitPolicy, RateLimitResult } from './types';

export const RATE_LIMIT_POLICIES: Record<RateLimitTier, RateLimitPolicy> = {
  auth: { windowSeconds: 60, maxRequests: 10, failClosed: true },
  ai: { windowSeconds: 60, maxRequests: 15, failClosed: true },
  intelligence: { windowSeconds: 60, maxRequests: 20, failClosed: true },
  export: { windowSeconds: 60, maxRequests: 10, failClosed: true },
  search: { windowSeconds: 60, maxRequests: 30, failClosed: true },
  mutation: { windowSeconds: 60, maxRequests: 20, failClosed: true },
  checkout: { windowSeconds: 60, maxRequests: 1, failClosed: true },
  standard_api: { windowSeconds: 60, maxRequests: 120, failClosed: true },
  public_api: { windowSeconds: 60, maxRequests: 60, failClosed: false }, // graceful degradation
  unlimited: { windowSeconds: 60, maxRequests: 1_000_000, failClosed: false },
};

export interface CheckLimitOptions {
  key: string;
  tier: RateLimitTier;
  endpoint?: string;
  ip?: string | null;
  actorId?: string | null;
}

export class DistributedRateLimiter {
  private primaryStore: RateLimitStore;
  private fallbackStore: RateLimitStore;

  constructor(customStore?: RateLimitStore, fallbackStore?: RateLimitStore) {
    if (customStore) {
      this.primaryStore = customStore;
      this.fallbackStore = fallbackStore || customStore;
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.primaryStore = new RedisRateLimitStore();
      this.fallbackStore = new PostgresRateLimitStore();
    } else if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      this.primaryStore = new PostgresRateLimitStore();
      this.fallbackStore = new MemoryRateLimitStore();
    } else {
      this.primaryStore = new MemoryRateLimitStore();
      this.fallbackStore = new MemoryRateLimitStore();
    }
  }

  getStoreName(): string {
    return this.primaryStore.name;
  }

  setStore(store: RateLimitStore): void {
    this.primaryStore = store;
  }

  async checkLimit(options: CheckLimitOptions): Promise<RateLimitResult> {
    const policy = RATE_LIMIT_POLICIES[options.tier];

    if (options.tier === 'unlimited') {
      return {
        allowed: true,
        limit: policy.maxRequests,
        current: 0,
        remaining: policy.maxRequests,
        resetSeconds: policy.windowSeconds,
      };
    }

    const bucketKey = `${options.tier}:${options.key}`;

    try {
      // 1. Attempt primary distributed store
      const result = await this.primaryStore.increment(
        bucketKey,
        policy.windowSeconds,
        policy.maxRequests
      );

      if (!result.allowed) {
        logSecurityEvent({
          type: 'rate_limit.exceeded',
          ip: options.ip,
          actorId: options.actorId,
          endpoint: options.endpoint,
          metadata: {
            tier: options.tier,
            current: result.current,
            limit: result.limit,
            store: this.primaryStore.name,
          },
        });
      }

      return result;
    } catch (primaryErr: unknown) {
      logSecurityEvent({
        type: 'rate_limit.store_error',
        endpoint: options.endpoint,
        metadata: {
          store: this.primaryStore.name,
          error: primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
        },
      });

      // 2. Attempt secondary fallback store
      try {
        const fallbackResult = await this.fallbackStore.increment(
          bucketKey,
          policy.windowSeconds,
          policy.maxRequests
        );
        logSecurityEvent({
          type: 'rate_limit.store_fallback',
          endpoint: options.endpoint,
          metadata: { fallbackStore: this.fallbackStore.name },
        });
        return fallbackResult;
      } catch {
        // 3. Both stores failed: Execute explicit failure behavior
        if (policy.failClosed) {
          logSecurityEvent({
            type: 'rate_limit.store_error',
            endpoint: options.endpoint,
            reason: 'Rate limit stores unavailable; failed closed by policy',
          });
          return {
            allowed: false,
            limit: policy.maxRequests,
            current: policy.maxRequests + 1,
            remaining: 0,
            resetSeconds: policy.windowSeconds,
            retryAfterSeconds: policy.windowSeconds,
          };
        }

        // Graceful degradation for low-risk endpoints
        return {
          allowed: true,
          limit: policy.maxRequests,
          current: 1,
          remaining: policy.maxRequests - 1,
          resetSeconds: policy.windowSeconds,
        };
      }
    }
  }

  /**
   * Helper to append standard rate-limit headers to response
   */
  applyHeaders(headers: Headers, result: RateLimitResult): void {
    headers.set('X-RateLimit-Limit', String(result.limit));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(result.resetSeconds));
    if (!result.allowed && result.retryAfterSeconds) {
      headers.set('Retry-After', String(result.retryAfterSeconds));
    }
  }

  /**
   * Generates standard RFC 6585 429 Too Many Requests response
   */
  create429Response(result: RateLimitResult, message = 'Rate limit exceeded'): NextResponse {
    const headers = new Headers();
    this.applyHeaders(headers, result);
    headers.set('Content-Type', 'application/json');

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: message,
        message,
        retryAfter: result.retryAfterSeconds || result.resetSeconds,
      }),
      { status: 429, headers }
    );
  }
}

export const rateLimiter = new DistributedRateLimiter();
