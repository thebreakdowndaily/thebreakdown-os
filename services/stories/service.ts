import type { Story, APIListParams, APIResponse } from '@/types/canonical';

export interface StoryService {
  getStories(params?: APIListParams): APIResponse<Story[]>;
  getStory(id: string): Story | undefined;
  getStoryBySlug(slug: string): Story | undefined;
  saveStory(story: Story): Story;
  deleteStory(id: string): void;
  publishStory(id: string): Story | undefined;
}

export class MemoryStoryService implements StoryService {
  private stories: Map<string, Story>;

  constructor(stories: Story[]) {
    this.stories = new Map(stories.map(s => [s.id, s]));
  }

  getStories(params?: APIListParams): APIResponse<Story[]> {
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

  getStory(id: string) {
    return this.stories.get(id);
  }

  getStoryBySlug(slug: string) {
    return Array.from(this.stories.values()).find(s => s.slug === slug);
  }

  saveStory(story: Story) {
    this.stories.set(story.id, { ...story, updatedAt: new Date().toISOString() });
    return this.stories.get(story.id)!;
  }

  deleteStory(id: string) {
    this.stories.delete(id);
  }

  publishStory(id: string) {
    const s = this.stories.get(id);
    if (!s) return;
    const updated = { ...s, status: 'published' as const, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.stories.set(id, updated);
    return updated;
  }
}
