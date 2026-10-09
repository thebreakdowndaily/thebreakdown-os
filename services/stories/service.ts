import type { Story, APIListParams, APIResponse } from '@/types/canonical';

import { validateStoryEvidenceCompleteness, PublicationBlockedError, DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import { consumePublicationToken } from '@/lib/editorial/publication-token';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

export interface StoryService {
  getStories(params?: APIListParams): Promise<APIResponse<Story[]>>;
  getStory(id: string): Promise<Story | undefined>;
  getStoryBySlug(slug: string): Promise<Story | undefined>;
  saveStory(story: Story, options?: { publicationToken?: string }): Promise<Story>;
  deleteStory(id: string): Promise<void>;
  publishStory(id: string): Promise<Story | undefined>;
}

export class MemoryStoryService implements StoryService {
  private stories: Map<string, Story>;
  private evidenceVault?: EvidenceVaultService;

  constructor(stories: Story[], evidenceVault?: EvidenceVaultService) {
    this.stories = new Map(stories.map(s => [s.id, s]));
    this.evidenceVault = evidenceVault;
  }

  public setEvidenceVault(vault: EvidenceVaultService): void {
    this.evidenceVault = vault;
  }

  public getEvidenceVault(): EvidenceVaultService | undefined {
    return this.evidenceVault;
  }

  async getStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let list = Array.from(this.stories.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getStory(id: string) {
    return this.stories.get(id);
  }

  async getStoryBySlug(slug: string) {
    return Array.from(this.stories.values()).find(s => s.slug === slug);
  }

  async saveStory(story: Story, options?: { publicationToken?: string }) {
    // Repository Publication Guard: Direct saves to 'published' must present a valid server-side publication token
    if (story.status === 'published' || story.publicationStatus === 'published') {
      const token = options?.publicationToken || (story as any)._publicationToken;
      if (!token || !consumePublicationToken(token, story.id)) {
        throw new DirectPublicationForbiddenError(
          `Direct saveStory with status='published' is prohibited for story ${story.id}. Publication must proceed via canonical publication contract or publishStory().`
        );
      }
    }

    this.stories.set(story.id, { ...story, updatedAt: new Date().toISOString() });
    return this.stories.get(story.id)!;
  }

  async deleteStory(id: string) {
    this.stories.delete(id);
  }

  async publishStory(id: string) {
    const s = this.stories.get(id);
    if (!s) return;

    // Phase 4B-2E: Evidence Provenance Publication Guard
    const validation = await validateStoryEvidenceCompleteness(s, this.evidenceVault);
    if (!validation.valid) {
      throw new PublicationBlockedError(validation.violations);
    }

    const { issuePublicationToken } = await import('@/lib/editorial/publication-token');
    const token = issuePublicationToken(s.id);

    const updated = {
      ...s,
      status: 'published' as const,
      publicationStatus: 'published' as const,
      publishedAt: s.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveStory(updated, { publicationToken: token });
  }
}
