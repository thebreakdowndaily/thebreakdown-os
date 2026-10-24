/**
 * ─── Research Intelligence — State Repository Factory ────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Provider resolution:
 *   1. Explicit RESEARCH_STATE_PROVIDER env ("memory" | "file" | "supabase")
 *   2. Production default: "supabase" (durable authoritative state)
 *   3. Otherwise: "memory" (tests / unconfigured local development)
 *
 * RESEARCH_STATE_FILE overrides the snapshot location for the file provider.
 */

import type {
  ResearchPersistedState,
  ResearchStateRepository,
} from './state';
import { ResearchPersistenceError } from './state';
import { MemoryStateRepository } from './memory';
import { ResearchFileStateRepository, DEFAULT_RESEARCH_STATE_FILE } from './file';
import { ResearchSupabaseStateRepository } from './supabase';

export function createResearchStateRepository(options?: {
  provider?: string;
  filePath?: string;
}): ResearchStateRepository {
  const configuredProvider = options?.provider ?? process.env.RESEARCH_STATE_PROVIDER;
  const requestedProvider = configuredProvider?.trim()
    ? configuredProvider.trim().toLowerCase()
    : undefined;
  const runtimeIsProduction =
    process.env.VERCEL_ENV === 'production' ||
    process.env.APP_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build');
  const provider =
    requestedProvider ?? (runtimeIsProduction || process.env.NODE_ENV === 'production' ? 'supabase' : 'memory');

  if (runtimeIsProduction && provider !== 'supabase') {
    throw new ResearchPersistenceError(
      'Production research state must use RESEARCH_STATE_PROVIDER=supabase; memory and file providers are disabled.',
      'PERSISTENCE_PROVIDER_INVALID'
    );
  }

  if (provider === 'supabase') {
    return new ResearchSupabaseStateRepository();
  }
  if (provider === 'file') {
    return new ResearchFileStateRepository(
      options?.filePath ?? process.env.RESEARCH_STATE_FILE ?? DEFAULT_RESEARCH_STATE_FILE
    );
  }
  if (provider === 'memory') {
    return new MemoryStateRepository();
  }

  throw new ResearchPersistenceError(
    'Invalid RESEARCH_STATE_PROVIDER value; expected "memory", "file", or "supabase".',
    'PERSISTENCE_PROVIDER_INVALID'
  );
}

export type { ResearchStateRepository, ResearchPersistedState } from './state';
export { MemoryStateRepository } from './memory';
export { ResearchFileStateRepository } from './file';
export { ResearchSupabaseStateRepository } from './supabase';
