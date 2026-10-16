import type { NextRequest } from 'next/server';
import { db, list, created, serverError } from '@/lib/api-v2';
import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
import { badRequest } from '@/lib/api-v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const tier = searchParams.get('tier') || '';

    let query = db().from('sources').select('id,title,url,type,tier,description,publisher,published_at,accessed_at,created_at,updated_at', { count: 'exact' });
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
    const auth = await requireApiPermission('citation.create', request);
    if ('response' in auth) return auth.response;
    const write = await getPersistentWriteClient(auth.principal);
    if ('response' in write) return write.response;

    const body = await request.json();
    if (!body || typeof body.title !== 'string' || !body.title.trim() ||
        typeof body.url !== 'string' || !body.url.trim()) {
      return badRequest('title and url are required');
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      return badRequest('url must be a valid HTTP(S) URL');
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return badRequest('url must be a valid HTTP(S) URL');
    }
    const tier = body.tier || 't3';
    if (!['t1', 't2', 't3', 't4', 't5'].includes(tier)) {
      return badRequest('tier must be one of t1, t2, t3, t4, t5');
    }

    const rpc = write.client as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown | null }>;
    };
    const { data, error } = await rpc.rpc('create_editorial_source', {
      p_title: body.title.trim(),
      p_url: parsedUrl.toString(),
      p_type: typeof body.type === 'string' ? body.type : '',
      p_tier: tier,
      p_description: typeof body.description === 'string' ? body.description : '',
      p_publisher: typeof body.publisher === 'string' ? body.publisher : '',
      p_published_at: typeof body.published_at === 'string' ? body.published_at : null,
    });
    if (error) throw error;
    return created(data);
  } catch (e) { return serverError(e); }
}
