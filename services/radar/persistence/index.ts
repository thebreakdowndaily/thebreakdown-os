/**
 * ─── Radar Persistence Repository Factory ─────────────────────────────────────
 *
 * Provider resolution:
 *   1. Explicit RADAR_STATE_PROVIDER env ("supabase" | "file" | "memory")
 *   2. If DATA_PROVIDER === 'supabase', default to 'supabase'
 *   3. If production NODE_ENV, default to 'file' or 'supabase'
 *   4. Otherwise default to 'file' (restart-resilient) or 'memory' (tests)
 */

import type { RadarPersistenceRepository } from './types';
import { MemoryRadarRepository } from './memory';
import { FileRadarRepository, DEFAULT_RADAR_STATE_FILE } from './file';
import { SupabaseRadarRepository } from './supabase';

export function createRadarPersistenceRepository(options?: {
  provider?: string;
  filePath?: string;
}): RadarPersistenceRepository {
  const hasSupabase = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const requested =
    options?.provider ||
    process.env.RADAR_STATE_PROVIDER ||
    (process.env.DATA_PROVIDER === 'supabase' ? 'supabase' : undefined) ||
    (process.env.VERCEL === '1' && hasSupabase ? 'supabase' : undefined);

  if (requested === 'supabase' && hasSupabase) {
    return new SupabaseRadarRepository();
  }

  if (requested === 'memory') {
    return new MemoryRadarRepository();
  }

  // Default to file repository for persistent durability across restarts
  return new FileRadarRepository(options?.filePath || DEFAULT_RADAR_STATE_FILE);
}

export type { RadarPersistenceRepository } from './types';
export { MemoryRadarRepository } from './memory';
export { FileRadarRepository } from './file';
export { SupabaseRadarRepository } from './supabase';
