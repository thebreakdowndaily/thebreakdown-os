import type { Story, APIListParams, APIResponse } from '@/types/canonical';

export interface StoryService {
  getStories(params?: APIListParams): Promise<APIResponse<Story[]>>;
  getStory(id: string): Promise<Story | undefined>;
  getStoryBySlug(slug: string): Promise<Story | undefined>;
  saveStory(story: Story): Promise<Story>;
  deleteStory(id: string): Promise<void>;
  publishStory(id: string): Promise<Story | undefined>;
  count(): Promise<number>;
  refresh(id?: string): Promise<void>;
  invalidate(id?: string): Promise<void>;
  /** Public-safe: only returns stories whose publication lifecycle permits public visibility. */
  getPublicStories(params?: APIListParams): Promise<APIResponse<Story[]>>;
  /** Public-safe: returns a story only if its publication lifecycle permits public visibility. */
  getPublicStoryBySlug(slug: string): Promise<Story | undefined>;
}
