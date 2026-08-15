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
import { MemoryStateRepository } from './memory';
import { ResearchFileStateRepository, DEFAULT_RESEARCH_STATE_FILE } from './file';
import { ResearchSupabaseStateRepository } from './supabase';

export function createResearchStateRepository(options?: {
  provider?: string;
  filePath?: string;
}): ResearchStateRepository {
  const provider =
    options?.provider ??
    process.env.RESEARCH_STATE_PROVIDER ??
    (process.env.NODE_ENV === 'production' ? 'supabase' : 'memory');

  if (provider === 'supabase') {
    return new ResearchSupabaseStateRepository();
  }
  if (provider === 'file') {
    return new ResearchFileStateRepository(
      options?.filePath ?? process.env.RESEARCH_STATE_FILE ?? DEFAULT_RESEARCH_STATE_FILE
    );
  }
  return new MemoryStateRepository();
}

export type { ResearchStateRepository, ResearchPersistedState } from './state';
export { MemoryStateRepository } from './memory';
export { ResearchFileStateRepository } from './file';
export { ResearchSupabaseStateRepository } from './supabase';
