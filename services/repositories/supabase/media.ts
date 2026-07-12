import type { MediaItem, APIListParams, APIResponse } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';
import type { TypedDatabase } from '@/supabase/client';
import type { MediaService } from '../../interfaces/media';

type MediaRow = TypedDatabase['public']['Tables']['media_items']['Row'];
type MediaInsert = TypedDatabase['public']['Tables']['media_items']['Insert'];

function sb() { return getSupabaseClient().from('media_items'); }

export class SupabaseMediaRepository implements MediaService {
  async getMedia(params?: APIListParams): Promise<APIResponse<MediaItem[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.ilike('title', `%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToMediaItem), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getMediaItem(id: string) {
    const { data, error } = await sb().select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToMediaItem(data) : undefined;
  }

  async getMediaByTags(tags: string[]) {
    const { data, error } = await sb().select('*').contains('tags', tags);
    if (error) throw error;
    return (data || []).map(rowToMediaItem);
  }

  async saveMediaItem(item: MediaItem) {
    const { data, error } = await sb().upsert(rowFromMediaItem(item)).select().single();
    if (error) throw error;
    return rowToMediaItem(data);
  }

  async deleteMediaItem(id: string) {
    const { error } = await sb().delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    type: row.type as MediaItem['type'],
    src: row.src || row.url || '',
    alt: row.alt || '',
    caption: row.caption || row.title || '',
    tags: row.tags || [],
    credit: row.credit || '',
    width: row.width || 0,
    height: row.height || 0,
    fileSize: row.file_size || 0,
    version: row.version ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowFromMediaItem(item: MediaItem): MediaInsert {
  return {
    id: item.id,
    type: item.type,
    src: item.src,
    alt: item.alt || '',
    caption: item.caption || '',
    tags: item.tags || [],
    credit: item.credit || '',
    width: item.width,
    height: item.height,
    file_size: item.fileSize,
    version: item.version ?? 1,
    title: item.caption || '',
    url: item.src || '',
  };
}
