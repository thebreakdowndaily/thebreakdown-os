import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';

export interface TimelineService {
  getTimelines(params?: APIListParams): APIResponse<Timeline[]>;
  getTimeline(id: string): Timeline | undefined;
  saveTimeline(timeline: Timeline): Timeline;
  deleteTimeline(id: string): void;
}

export class MemoryTimelineService implements TimelineService {
  private timelines: Map<string, Timeline>;

  constructor(timelines: Timeline[]) {
    this.timelines = new Map(timelines.map(t => [t.id, t]));
  }

  getTimelines(params?: APIListParams): APIResponse<Timeline[]> {
    let list = Array.from(this.timelines.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  getTimeline(id: string) {
    return this.timelines.get(id);
  }

  saveTimeline(timeline: Timeline) {
    this.timelines.set(timeline.id, { ...timeline, updatedAt: new Date().toISOString() });
    return this.timelines.get(timeline.id)!;
  }

  deleteTimeline(id: string) {
    this.timelines.delete(id);
  }
}
