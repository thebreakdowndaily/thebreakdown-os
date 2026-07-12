import type { MediaItem, APIListParams, APIResponse } from '@/types/canonical';

export interface MediaService {
  getMedia(params?: APIListParams): Promise<APIResponse<MediaItem[]>>;
  getMediaItem(id: string): Promise<MediaItem | undefined>;
  getMediaByTags(tags: string[]): Promise<MediaItem[]>;
  saveMediaItem(item: MediaItem): Promise<MediaItem>;
  deleteMediaItem(id: string): Promise<void>;
}
