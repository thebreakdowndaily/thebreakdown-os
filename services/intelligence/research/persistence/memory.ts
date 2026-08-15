/**
 * ─── Research Intelligence — In-Memory Repository ────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Default provider for development and tests: process-local state, no I/O.
 * Never the authoritative store in production (worker restarts lose state) —
 * the core persists to a durable provider when configured.
 */

import type {
  ResearchPersistedState,
  ResearchStateRepository,
} from './state';
import { emptyPersistedState } from './state';

export class MemoryStateRepository implements ResearchStateRepository {
  readonly kind = 'memory' as const;
  private state: ResearchPersistedState;

  constructor(initialState?: ResearchPersistedState) {
    this.state = initialState ?? emptyPersistedState();
  }

  load(): ResearchPersistedState | null {
    return this.state;
  }

  save(state: ResearchPersistedState): void {
    this.state = state;
  }

  get current(): ResearchPersistedState {
    return this.state;
  }
}
