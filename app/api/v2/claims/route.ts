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
    const status = searchParams.get('status') || '';

    let query = db().from('claims').select('id,claim,data,source_text,status,confidence,explanation,created_at,updated_at', { count: 'exact' });
    if (status) query = query.eq('status', status);

    const { data, count, error } = await query
      .order('confidence', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return list(data || [], count || 0, page, pageSize);
  } catch (e) { return serverError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiPermission('story.update', request);
    if ('response' in auth) return auth.response;
    const write = await getPersistentWriteClient(auth.principal);
    if ('response' in write) return write.response;

    const body = await request.json();
    if (!body || typeof body.claim !== 'string' || !body.claim.trim()) {
      return badRequest('claim is required');
    }
    for (const field of ['data', 'source_text', 'explanation']) {
      if (body[field] !== undefined && typeof body[field] !== 'string') {
        return badRequest(`${field} must be a string`);
      }
    }

    const rpc = write.client as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown | null }>;
    };
    const { data, error } = await rpc.rpc('create_editorial_claim', {
      p_claim: body.claim.trim(),
      p_data: body.data || '',
      p_source_text: body.source_text || '',
      p_explanation: body.explanation || '',
    });
    if (error) throw error;
    return created(data);
  } catch (e) { return serverError(e); }
}
