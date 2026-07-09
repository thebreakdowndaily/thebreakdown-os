import type { NextRequest } from 'next/server';
import { db, list, serverError } from '@/lib/api-v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    if (!q) {
      return list([], 0, page, pageSize);
    }

    let query = (db().from('index_entries') as any).select('*', { count: 'exact' });

    const tsq = q.split(/\s+/).filter(Boolean).join(' & ');
    if (tsq) {
      query = query.textSearch('idx_search_entries_fts', tsq, { config: 'english' });
    } else {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (type) query = query.eq('ref_type', type);

    const { data, count, error } = await query
      .order('score', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return list(data || [], count || 0, page, pageSize);
  } catch (e) { return serverError(e); }
}
