import type { Timeline, APIListParams, APIResponse } from '@/types/canonical';
import type { TimelineService } from '../../interfaces/timeline';

export class MemoryTimelineRepository implements TimelineService {
  private timelines: Map<string, Timeline>;

  constructor(timelines: Timeline[] = []) {
    this.timelines = new Map(timelines.map(t => [t.id, t]));
  }

  async getTimelines(params?: APIListParams): Promise<APIResponse<Timeline[]>> {
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

  async getTimeline(id: string) {
    return this.timelines.get(id);
  }

  async saveTimeline(timeline: Timeline) {
    this.timelines.set(timeline.id, { ...timeline, updatedAt: new Date().toISOString() });
    return this.timelines.get(timeline.id)!;
  }

  async deleteTimeline(id: string) {
    this.timelines.delete(id);
  }

  async count() {
    return this.timelines.size;
  }
}
