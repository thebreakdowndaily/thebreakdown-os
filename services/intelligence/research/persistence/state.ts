/**
 * ─── Research Intelligence Persistence — Canonical Durable State ─────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * TBIOS forbids process-local variables as the authoritative source of truth.
 * This module defines the serializable, versioned snapshot every provider
 * (memory / file / supabase) must persist and restore, mirroring the newsroom
 * persistence contract. The snapshot is written after every authoritative state
 * mutation and reloaded on bootstrap so worker restarts yield zero state loss.
 */

import type {
  ResearchClaim,
  ResearchChangeEvent,
  ResearchContradiction,
  ResearchDocument,
  ResearchEvent,
  ResearchEvidence,
  ResearchGap,
  ResearchProject,
  ResearchQuery,
  ResearchQuestion,
  ResearchRun,
  ResearchSource,
  SocialSignal,
  CorroborationCluster,
  ResearchStoryBrief,
} from '@/types/research-intelligence';

export const RESEARCH_STATE_VERSION = 1 as const;

export interface ResearchPersistedState {
  version: typeof RESEARCH_STATE_VERSION;
  savedAt: string;
  projects: ResearchProject[];
  queries: ResearchQuery[];
  sources: ResearchSource[];
  documents: ResearchDocument[];
  claims: ResearchClaim[];
  evidence: ResearchEvidence[];
  events: ResearchEvent[];
  questions: ResearchQuestion[];
  contradictions: ResearchContradiction[];
  gaps: ResearchGap[];
  socialSignals: SocialSignal[];
  clusters: CorroborationCluster[];
  runs: ResearchRun[];
  changeEvents: ResearchChangeEvent[];
  storyBriefs: ResearchStoryBrief[];
}

export function emptyPersistedState(): ResearchPersistedState {
  return {
    version: RESEARCH_STATE_VERSION,
    savedAt: new Date().toISOString(),
    projects: [],
    queries: [],
    sources: [],
    documents: [],
    claims: [],
    evidence: [],
    events: [],
    questions: [],
    contradictions: [],
    gaps: [],
    socialSignals: [],
    clusters: [],
    runs: [],
    changeEvents: [],
    storyBriefs: [],
  };
}

export interface ResearchStateRepository {
  readonly kind: 'memory' | 'file' | 'supabase';
  load(): ResearchPersistedState | null | Promise<ResearchPersistedState | null>;
  save(state: ResearchPersistedState): void | Promise<void>;
}
