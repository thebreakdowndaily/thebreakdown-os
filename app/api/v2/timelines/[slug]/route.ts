import type { NextRequest } from 'next/server';
import { db, ok, notFound, serverError } from '@/lib/api-v2';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { data, error } = await db().from('timelines').select('*').eq('id', slug).single();
    if (error) throw error;
    if (!data) return notFound('Timeline');
    return ok(data);
  } catch (e) { return serverError(e); }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { data, error } = await db().from('timelines').update(body as import('@/supabase/schema').Database['public']['Tables']['timelines']['Update']).eq('id', slug).select().single();
    if (error) throw error;
    if (!data) return notFound('Timeline');
    return ok(data);
  } catch (e) { return serverError(e); }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { error } = await db().from('timelines').delete().eq('id', slug);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (e) { return serverError(e); }
}
