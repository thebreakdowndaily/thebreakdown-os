import type { Citation, APIResponse } from '@/types/canonical';

export interface CitationService {
  /** List citations for a given story slug. */
  listByStory(storySlug: string, includePending?: boolean): Promise<APIResponse<Citation[]>>;

  /** Retrieve a citation by its id. */
  getCitation(id: string): Promise<Citation | undefined>;

  /** Create a new citation (editor only). */
  createCitation(citation: Omit<Citation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Citation>;

  /** Update a citation (editor only). */
  updateCitation(id: string, updates: Partial<Citation>): Promise<Citation>;

  /** Delete a citation (editor only). */
  deleteCitation(id: string): Promise<void>;
}
