import type { Topic, APIListParams, APIResponse } from '@/types/canonical';

export interface TopicService {
  getTopics(params?: APIListParams): APIResponse<Topic[]>;
  getTopic(id: string): Topic | undefined;
  getTopicBySlug(slug: string): Topic | undefined;
  saveTopic(topic: Topic): Topic;
  deleteTopic(id: string): void;
}

export class MemoryTopicService implements TopicService {
  private topics: Map<string, Topic>;

  constructor(topics: Topic[]) {
    this.topics = new Map(topics.map(t => [t.id, t]));
  }

  getTopics(params?: APIListParams): APIResponse<Topic[]> {
    let list = Array.from(this.topics.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  getTopic(id: string) {
    return this.topics.get(id);
  }

  getTopicBySlug(slug: string) {
    return Array.from(this.topics.values()).find(t => t.slug === slug);
  }

  saveTopic(topic: Topic) {
    this.topics.set(topic.id, { ...topic, updatedAt: new Date().toISOString() });
    return this.topics.get(topic.id)!;
  }

  deleteTopic(id: string) {
    this.topics.delete(id);
  }
}
