import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';

export interface TimelineService {
  getTimelines(params?: APIListParams): Promise<APIResponse<Timeline[]>>;
  getTimeline(id: string): Promise<Timeline | undefined>;
  saveTimeline(timeline: Timeline): Promise<Timeline>;
  deleteTimeline(id: string): Promise<void>;
  count(): Promise<number>;
}
