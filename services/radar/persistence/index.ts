/**
 * ─── Radar Persistence Repository Factory ─────────────────────────────────────
 *
 * Production Radar state is authoritative only when persisted in Supabase.
 * File persistence is for local development; it is not durable across Vercel
 * instances. Production must explicitly select Supabase and provide credentials.
 */

import type { RadarPersistenceRepository } from './types';
import { MemoryRadarRepository } from './memory';
import { FileRadarRepository, DEFAULT_RADAR_STATE_FILE } from './file';
import { SupabaseRadarRepository } from './supabase';

export class RadarPersistenceConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RadarPersistenceConfigurationError';
  }
}

export function createRadarPersistenceRepository(options?: {
  provider?: string;
  filePath?: string;
}): RadarPersistenceRepository {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const hasSupabase = Boolean(url && serviceKey && url !== 'https://dummy.supabase.co');

  // NEXT_PHASE distinguishes a production build from a running production
  // process; build-time imports must not be mistaken for live runtime config.
  const isProductionRuntime =
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    (
      process.env.VERCEL_ENV === 'production' ||
      process.env.APP_ENV === 'production' ||
      process.env.NODE_ENV === 'production'
    );

  const optionProvider = options?.provider?.trim().toLowerCase();
  const envProvider = process.env.RADAR_STATE_PROVIDER?.trim().toLowerCase();
  const requested =
    (optionProvider || undefined) ??
    (envProvider || undefined) ??
    (process.env.DATA_PROVIDER?.trim().toLowerCase() === 'supabase' ? 'supabase' : undefined) ??
    (process.env.VERCEL === '1' && hasSupabase ? 'supabase' : undefined);

  if (!requested && isProductionRuntime) {
    throw new RadarPersistenceConfigurationError(
      'Production Radar requires RADAR_STATE_PROVIDER=supabase or DATA_PROVIDER=supabase; refusing to fall back to local file or memory storage.'
    );
  }

  if (requested === 'supabase') {
    if (!hasSupabase) {
      throw new RadarPersistenceConfigurationError(
        'Supabase Radar persistence was requested, but SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.'
      );
    }
    return new SupabaseRadarRepository();
  }

  if (requested === 'memory') {
    if (isProductionRuntime) {
      throw new RadarPersistenceConfigurationError(
        'Memory Radar persistence is disabled in production; configure Supabase as the authoritative provider.'
      );
    }
    return new MemoryRadarRepository();
  }

  if (requested === 'file') {
    if (isProductionRuntime) {
      throw new RadarPersistenceConfigurationError(
        'File Radar persistence is disabled in production because local files are not shared durable state across runtime instances.'
      );
    }
    return new FileRadarRepository(options?.filePath || DEFAULT_RADAR_STATE_FILE);
  }

  if (requested) {
    throw new RadarPersistenceConfigurationError(
      'Invalid RADAR_STATE_PROVIDER value; expected "supabase", "file", or "memory".'
    );
  }

  // Local development default only. Production must use an explicit durable DB.
  return new FileRadarRepository(options?.filePath || DEFAULT_RADAR_STATE_FILE);
}

export type { RadarPersistenceRepository } from './types';
export { MemoryRadarRepository } from './memory';
export { FileRadarRepository } from './file';
export { SupabaseRadarRepository } from './supabase';
