import type { SearchIndexEntry, APIListParams, APIResponse } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalSearchService {
  async search(query: string, params?: APIListParams): Promise<APIResponse<SearchIndexEntry[]>> {
    if (!query.trim()) return { data: [], meta: { total: 0, page: params?.page || 1, pageSize: params?.pageSize || 0 } };

    let q = db().from('index_entries').select('*', { count: 'exact' });

    const tsq = query.split(/\s+/).filter(Boolean).join(' & ');
    if (tsq) {
      q = q.textSearch('idx_search_entries_fts', tsq, { config: 'english' });
    } else {
      q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (params?.page && params?.pageSize) {
      q = q.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }

    const { data, count, error } = await q.order('score', { ascending: false });
    if (error) throw error;

    return { data: (data || []).map(rowToEntry), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async searchByType(query: string, type: string, params?: APIListParams): Promise<APIResponse<SearchIndexEntry[]>> {
    if (!query.trim()) return { data: [], meta: { total: 0, page: params?.page || 1, pageSize: params?.pageSize || 0 } };

    let q = db().from('index_entries').select('*', { count: 'exact' });

    const tsq = query.split(/\s+/).filter(Boolean).join(' & ');
    if (tsq) {
      q = q.textSearch('idx_search_entries_fts', tsq, { config: 'english' });
    } else {
      q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    q = q.eq('ref_type', type);

    if (params?.page && params?.pageSize) {
      q = q.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    }

    const { data, count, error } = await q.order('score', { ascending: false });
    if (error) throw error;

    return { data: (data || []).map(rowToEntry), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async index(items: SearchIndexEntry[]): Promise<void> {
    for (const item of items) {
      await db().from('index_entries').upsert({
        ref_type: item.type,
        ref_id: item.id,
        ref_slug: item.slug,
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        score: item.score,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'ref_type,ref_id' });
    }
  }
}

function rowToEntry(row: import('@/supabase/client').TypedDatabase['public']['Tables']['index_entries']['Row']): SearchIndexEntry {
  return {
    id: row.ref_id,
    type: row.ref_type as SearchIndexEntry['type'],
    title: row.title,
    slug: row.ref_slug,
    description: row.description || '',
    tags: row.tags || [],
    content: row.content || '',
    score: row.score || 0,
    updatedAt: row.updated_at,
  };
}
