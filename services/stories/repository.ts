import type { Story, APIListParams, APIResponse } from '@/types/canonical';

export interface StoryRepository {
  findAll(params?: APIListParams): Promise<APIResponse<Story[]>>;
  findById(id: string): Promise<Story | undefined>;
  findBySlug(slug: string): Promise<Story | undefined>;
  save(story: Story): Promise<Story>;
  update(id: string, updates: Partial<Story>): Promise<Story>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export class MemoryStoryRepository implements StoryRepository {
  private store = new Map<string, Story>();

  constructor(stories?: Story[]) { if (stories) stories.forEach(s => this.store.set(s.id, s)); }

  async findAll(params?: APIListParams): Promise<APIResponse<Story[]>> {
    let list = Array.from(this.store.values());
    if (params?.search) { const q = params.search.toLowerCase(); list = list.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)); }
    const total = list.length;
    if (params?.page && params?.pageSize) { const start = (params.page - 1) * params.pageSize; list = list.slice(start, start + params.pageSize); }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async findById(id: string) { return this.store.get(id); }
  async findBySlug(slug: string) { return Array.from(this.store.values()).find(s => s.slug === slug); }
  async save(story: Story) { this.store.set(story.id, { ...story, updatedAt: new Date().toISOString() }); return this.store.get(story.id)!; }
  async update(id: string, updates: Partial<Story>) { const existing = this.store.get(id); if (!existing) throw new Error(`Story ${id} not found`); const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }; this.store.set(id, updated); return updated; }
  async delete(id: string) { return this.store.delete(id); }
  async count() { return this.store.size; }
}
