import type { Citation, APIResponse } from '@/types/canonical';
import type { CitationService } from '../../interfaces/citation';

/**
 * In‑memory implementation of the CitationService.
 * Mirrors the patterns used by other memory services (e.g. StoryService).
 * Stores citations in a Map keyed by id and maintains an index of citations per story slug.
 */
export class MemoryCitationService implements CitationService {
  // Primary storage: id -> Citation
  private citations: Map<string, Citation> = new Map();
  // Secondary index: storySlug -> Set of citation ids
  private storyIndex: Map<string, Set<string>> = new Map();

  /** Validate that the provided URL uses an allowed protocol. */
  private static isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /** Helper to fetch all citations for a story (optionally including pending). */
  private fetchByStory(storySlug: string, includePending: boolean): Citation[] {
    const ids = this.storyIndex.get(storySlug) ?? new Set<string>();
    const all = Array.from(ids)
      .map((id) => this.citations.get(id))
      .filter((c): c is Citation => c !== undefined)
      .filter((c) => includePending || c.status === 'approved');
    return all;
  }

  async listByStory(storySlug: string, includePending: boolean = false): Promise<APIResponse<Citation[]>> {
    const data = this.fetchByStory(storySlug, includePending);
    return { data, meta: { total: data.length, page: 1, pageSize: data.length } };
  }

  async getCitation(id: string): Promise<Citation | undefined> {
    return this.citations.get(id);
  }

  async createCitation(citation: Omit<Citation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Citation> {
    if (!citation.url || !MemoryCitationService.isValidUrl(citation.url)) {
      throw new Error('Invalid citation URL. Only http/https URLs are allowed.');
    }
    const existing = this.fetchByStory(citation.storySlug, true);
    if (existing.some((c) => c.url === citation.url && c.title === citation.title)) {
      throw new Error('Duplicate citation for this story.');
    }
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const newCitation: Citation = {
      ...citation,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.citations.set(id, newCitation);
    const set = this.storyIndex.get(citation.storySlug) ?? new Set<string>();
    set.add(id);
    this.storyIndex.set(citation.storySlug, set);
    return newCitation;
  }

  async updateCitation(id: string, updates: Partial<Citation>): Promise<Citation> {
    const existing = this.citations.get(id);
    if (!existing) throw new Error('Citation not found');
    if (updates.url && !MemoryCitationService.isValidUrl(updates.url)) {
      throw new Error('Invalid citation URL.');
    }
    const newStatus = updates.status ?? existing.status;
    if (newStatus === 'approved' && existing.status !== 'approved') {
      const approved = this.fetchByStory(existing.storySlug, false);
      if (approved.length >= 10) {
        throw new Error('Maximum of 10 approved citations per story reached.');
      }
    }
    const now = new Date().toISOString();
    const updated: Citation = { ...existing, ...updates, updatedAt: now };
    this.citations.set(id, updated);
    return updated;
  }

  async deleteCitation(id: string): Promise<void> {
    const existing = this.citations.get(id);
    if (!existing) return;
    this.citations.delete(id);
    const set = this.storyIndex.get(existing.storySlug);
    if (set) {
      set.delete(id);
      if (set.size === 0) this.storyIndex.delete(existing.storySlug);
    }
  }
}
