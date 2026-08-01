// ── Multi-Layer Cache Engine (Phase 18D WP2) ───────────────────────────────

import { CacheTier, CacheTierMetrics, CacheInvalidationEventType } from '../../types/performance';

export class TieredCache<T = unknown> {
  private store = new Map<string, { value: T; expiresAt: number }>();
  private hitCount = 0;
  private missCount = 0;

  constructor(
    public readonly tier: CacheTier,
    public readonly maxSize: number = 1000,
    public readonly ttlMs: number = 300000
  ) {}

  public get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return undefined;
    }

    this.hitCount++;
    return entry.value;
  }

  public set(key: string, value: T): void {
    if (this.store.size >= this.maxSize) {
      // LRU-style eviction of first entry
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  public invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  public getMetrics(): CacheTierMetrics {
    const total = this.hitCount + this.missCount;
    const hitRatio = total > 0 ? Math.round((this.hitCount / total) * 100) / 100 : 1.0;
    return Object.freeze({
      tier: this.tier,
      itemCount: this.store.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatio,
      memoryUsageBytes: this.store.size * 512,
    });
  }
}

export class MultiLayerCacheEngine {
  private memoryCache = new TieredCache<unknown>('L1_MEMORY', 500, 60000);
  private distributedCache = new TieredCache<unknown>('L2_DISTRIBUTED', 1000, 120000);
  private persistentCache = new TieredCache<unknown>('L3_PERSISTENT', 500, 300000);

  public getCache(tier: CacheTier): TieredCache<unknown> {
    switch (tier) {
      case 'L1_MEMORY':
        return this.memoryCache;
      case 'L2_DISTRIBUTED':
        return this.distributedCache;
      case 'L3_PERSISTENT':
        return this.persistentCache;
      default:
        return this.memoryCache;
    }
  }

  /**
   * Event-driven cache invalidation handler.
   */
  public handleInvalidationEvent(eventType: CacheInvalidationEventType): void {
    switch (eventType) {
      case 'CLAIM_UPDATE':
      case 'FIX_UPDATE':
        this.memoryCache.clear();
        this.distributedCache.clear();
        break;
      case 'DATASET_REFRESH':
      case 'MANUAL_PURGE':
        this.memoryCache.clear();
        this.distributedCache.clear();
        this.persistentCache.clear();
        break;
    }
  }

  public getAllMetrics(): readonly CacheTierMetrics[] {
    return Object.freeze([
      this.memoryCache.getMetrics(),
      this.distributedCache.getMetrics(),
      this.persistentCache.getMetrics(),
    ]);
  }
}
