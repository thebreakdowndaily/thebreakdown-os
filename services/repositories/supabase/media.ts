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
    if (params?.search) query = query.ilike('caption', `%${params.search}%`);
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
    agency: row.agency ?? undefined,
    copyrightOwner: row.copyright_owner ?? undefined,
    photographer: row.photographer ?? undefined,
    capturedAt: row.captured_at ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    licenseType: row.license_type as MediaItem['licenseType'],
    imageCategory: row.image_category as MediaItem['imageCategory'],
    editorialPriority: row.editorial_priority as MediaItem['editorialPriority'],
    longDescription: row.long_description ?? undefined,
    sha256Hash: row.sha256_hash ?? undefined,
    blurHash: row.blur_hash ?? undefined,
    focusPointX: row.focus_point_x ?? undefined,
    focusPointY: row.focus_point_y ?? undefined,
    dominantColor: row.dominant_color ?? undefined,
    verificationStatus: row.verification_status as MediaItem['verificationStatus'],
    isAiGenerated: row.is_ai_generated ?? undefined,
    aiModel: row.ai_model ?? undefined,
    aiPrompt: row.ai_prompt ?? undefined,
    aiProvider: row.ai_provider ?? undefined,
    generatedAt: row.generated_at ?? undefined,
    orientation: row.orientation ?? undefined,
    camera: row.camera ?? undefined,
    lens: row.lens ?? undefined,
    iso: row.iso ?? undefined,
    gps: row.gps ?? undefined,
  };
}

function rowFromMediaItem(item: MediaItem): any {
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
  };
}
