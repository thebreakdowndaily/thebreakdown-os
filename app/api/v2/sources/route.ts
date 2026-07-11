import type { NextRequest } from 'next/server';
import { db, list, created, serverError } from '@/lib/api-v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const tier = searchParams.get('tier') || '';

    let query = db().from('sources').select('*', { count: 'exact' });
    if (tier) query = query.eq('tier', tier);

    const { data, count, error } = await query
      .order('title')
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return list(data || [], count || 0, page, pageSize);
  } catch (e) { return serverError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await db().from('sources').insert(body).select().single();
    if (error) throw error;
    return created(data);
  } catch (e) { return serverError(e); }
}
