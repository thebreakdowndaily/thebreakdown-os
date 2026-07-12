import type { Topic, APIListParams, APIResponse } from '@/types/canonical';

export interface TopicService {
  getTopics(params?: APIListParams): Promise<APIResponse<Topic[]>>;
  getTopic(id: string): Promise<Topic | undefined>;
  getTopicBySlug(slug: string): Promise<Topic | undefined>;
  saveTopic(topic: Topic): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
  count(): Promise<number>;
}
