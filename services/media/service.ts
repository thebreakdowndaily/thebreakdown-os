import type { MediaItem, APIListParams, APIResponse } from '@/types/canonical';

export interface MediaService {
  getMedia(params?: APIListParams): APIResponse<MediaItem[]>;
  getMediaItem(id: string): MediaItem | undefined;
  getMediaByTags(tags: string[]): MediaItem[];
  saveMediaItem(item: MediaItem): MediaItem;
  deleteMediaItem(id: string): void;
}

export class MemoryMediaService implements MediaService {
  private items: Map<string, MediaItem>;

  constructor(items: MediaItem[]) {
    this.items = new Map(items.map(m => [m.id, m]));
  }

  getMedia(params?: APIListParams): APIResponse<MediaItem[]> {
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

  getMediaItem(id: string) {
    return this.items.get(id);
  }

  getMediaByTags(tags: string[]) {
    return Array.from(this.items.values()).filter(m => tags.some(t => m.tags.includes(t)));
  }

  saveMediaItem(item: MediaItem) {
    this.items.set(item.id, { ...item, updatedAt: new Date().toISOString() });
    return this.items.get(item.id)!;
  }

  deleteMediaItem(id: string) {
    this.items.delete(id);
  }
}
