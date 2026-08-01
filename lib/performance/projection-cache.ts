// ── Projection Cache Engine (Phase 27A WP2) ───────────────────────────────────

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
  itemCount: number;
  maxSize: number;
  evictionCount: number;
}

export class ProjectionCacheEngine<T = any> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttlMs: number;
  private hits = 0;
  private misses = 0;
  private evictionCount = 0;

  constructor(maxSize = 100, ttlMs = 300000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  public set(key: string, value: T): void {
    // Ensure projection output is frozen
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      Object.freeze(value);
    }

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // LRU Eviction of oldest item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.evictionCount++;
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictionCount = 0;
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return Object.freeze({
      hits: this.hits,
      misses: this.misses,
      hitRatio: total === 0 ? 0.0 : Number((this.hits / total).toFixed(4)),
      itemCount: this.cache.size,
      maxSize: this.maxSize,
      evictionCount: this.evictionCount,
    });
  }
}
