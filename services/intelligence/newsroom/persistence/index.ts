/**
 * ─── Newsroom State Repository Factory ────────────────────────────────────────
 *
 * Provider resolution (Operating Standard §21 — Persistence & Durability):
 *
 *   1. Explicit NEWSROOM_STATE_PROVIDER env ("memory" | "file")
 *   2. Production default: "file" (durable, restart-safe authoritative state)
 *   3. Otherwise: "memory" (tests / unconfigured local development)
 *
 * NEWSROOM_STATE_FILE overrides the snapshot location for the file provider.
 */

import {
  NewsroomStateRepository,
} from './state';
import { MemoryStateRepository } from './memory';
import { FileStateRepository, DEFAULT_NEWSROOM_STATE_FILE } from './file';
import { SupabaseStateRepository } from './supabase';

export function createNewsroomStateRepository(options?: {
  provider?: string;
  filePath?: string;
}): NewsroomStateRepository {
  const isProduction =
    process.env.DATA_PROVIDER === 'supabase' || process.env.NODE_ENV === 'production';

  const requestedProvider = options?.provider ?? process.env.NEWSROOM_STATE_PROVIDER;

  // In production or when DATA_PROVIDER=supabase, local memory/file fallbacks are strictly prohibited
  if (isProduction) {
    if (requestedProvider && requestedProvider !== 'supabase') {
      throw new Error(
        `Production persistence policy violation: provider '${requestedProvider}' is forbidden. Production MUST use Supabase persistence.`
      );
    }
    return new SupabaseStateRepository();
  }

  const provider = requestedProvider ?? 'memory';

  if (provider === 'supabase') {
    return new SupabaseStateRepository();
  }
  if (provider === 'file') {
    return new FileStateRepository(
      options?.filePath ?? process.env.NEWSROOM_STATE_FILE ?? DEFAULT_NEWSROOM_STATE_FILE
    );
  }
  return new MemoryStateRepository();
}

export type { NewsroomStateRepository, NewsroomPersistedState } from './state';
export { MemoryStateRepository } from './memory';
export { FileStateRepository } from './file';
export { SupabaseStateRepository } from './supabase';
