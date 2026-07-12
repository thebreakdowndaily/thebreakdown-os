import type { MediaItem, APIListParams, APIResponse } from '@/types/canonical';
import type { MediaService } from '../../interfaces/media';

export class MemoryMediaRepository implements MediaService {
  private items: Map<string, MediaItem>;

  constructor(items: MediaItem[] = []) {
    this.items = new Map(items.map(m => [m.id, m]));
  }

  async getMedia(params?: APIListParams): Promise<APIResponse<MediaItem[]>> {
    let list = Array.from(this.items.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(m => m.alt.toLowerCase().includes(q) || m.caption.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getMediaItem(id: string) {
    return this.items.get(id);
  }

  async getMediaByTags(tags: string[]) {
    return Array.from(this.items.values()).filter(m => tags.some(t => m.tags.includes(t)));
  }

  async saveMediaItem(item: MediaItem) {
    this.items.set(item.id, { ...item, updatedAt: new Date().toISOString() });
    return this.items.get(item.id)!;
  }

  async deleteMediaItem(id: string) {
    this.items.delete(id);
  }
}
