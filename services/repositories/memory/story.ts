import type { Story, APIListParams, APIResponse } from '@/types/canonical';
import type { StoryService } from '../../interfaces/story';
import { isPubliclyPublished, storyPublicationContext } from '@/lib/story/publication';
import { LEGACY_PUBLIC_SLUGS } from '@/utils/data-layer/store';

import { validateStoryEvidenceCompleteness, PublicationBlockedError, DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import { consumePublicationToken } from '@/lib/editorial/publication-token';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

export class MemoryStoryService implements StoryService {
  private stories: Map<string, Story>;
  private evidenceVault?: EvidenceVaultService;

  constructor(stories: Story[] = [], evidenceVault?: EvidenceVaultService) {
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
    if (!s) return undefined;

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

  async count() {
    return this.stories.size;
  }

  async refresh(id?: string) {
    // Memory store doesn't need external refresh
  }

  async invalidate(id?: string) {
    // Memory store doesn't need cache invalidation
  }

  private isPublic(story: Story, now: Date): boolean {
    if (isPubliclyPublished(storyPublicationContext(story), now)) return true;
    const pubAt = story.publishedAt;
    if (LEGACY_PUBLIC_SLUGS.has(story.slug) && pubAt && new Date(pubAt).getTime() <= now.getTime()) return true;
    return false;
  }

  async getPublicStories(params?: APIListParams): Promise<APIResponse<Story[]>> {
    const now = new Date();
    let list = Array.from(this.stories.values()).filter(s => this.isPublic(s, now));
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

  async getPublicStoryBySlug(slug: string): Promise<Story | undefined> {
    const story = Array.from(this.stories.values()).find(s => s.slug === slug);
    if (!story) return undefined;
    return this.isPublic(story, new Date()) ? story : undefined;
  }
}
