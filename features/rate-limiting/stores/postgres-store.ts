import { getServiceClient } from '@/supabase/client';
import type { RateLimitStore, RateLimitResult } from '../types';

export class PostgresRateLimitStore implements RateLimitStore {
  readonly name = 'postgres';

  async increment(key: string, windowSeconds: number, maxLimit: number): Promise<RateLimitResult> {
    const supabase = getServiceClient();

    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_bucket_key: key,
      p_window_seconds: windowSeconds,
      p_max_limit: maxLimit,
    });

    if (error || data.length === 0) {
      const errDetail = error ? error.message : 'RPC returned empty response';
      throw new Error(`PostgresRateLimitStore error: ${errDetail}`);
    }

    const row = data[0];

    return {
      allowed: row.allowed,
      limit: maxLimit,
      current: row.current_count,
      remaining: row.remaining,
      resetSeconds: row.reset_seconds,
      retryAfterSeconds: row.allowed ? undefined : row.reset_seconds,
    };
  }

  async reset(key: string): Promise<void> {
    try {
      const supabase = getServiceClient();
      await supabase.from('rate_limit_buckets').delete().eq('bucket_key', key);
    } catch {
      // Best-effort
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const supabase = getServiceClient();
      const { error } = await supabase.from('rate_limit_buckets').select('bucket_key').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}
