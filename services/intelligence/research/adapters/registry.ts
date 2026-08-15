/**
 * ─── Research Intelligence — Adapter Registry ────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Simple registry of ResearchSourceAdapter instances. Extensible without
 * changing the pipeline: register a new adapter, and queries routed to it are
 * served. No new abstraction layer — a plain Map keyed by adapter id.
 */

import type { ResearchSourceAdapter } from './interface';

export class ResearchAdapterRegistry {
  private adapters = new Map<string, ResearchSourceAdapter>();

  register(adapter: ResearchSourceAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  get(id: string): ResearchSourceAdapter | undefined {
    return this.adapters.get(id);
  }

  has(id: string): boolean {
    return this.adapters.has(id);
  }

  list(): ResearchSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  clear(): void {
    this.adapters.clear();
  }
}

export const researchAdapterRegistry = new ResearchAdapterRegistry();
