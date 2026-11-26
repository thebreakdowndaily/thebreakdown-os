import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMediaRepository } from '@/services/repositories/supabase/media';
import type { MediaItem, APIResponse } from '@/types/canonical';
import { authorizeMediaEditor } from '@/lib/media/server/authorization';
import { intelRoleRank } from '@/features/auth/roles';
import { createServiceClient } from '@/supabase/client';

export const runtime = 'nodejs';

const repo = new SupabaseMediaRepository();

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function objectPathFromPublicUrl(value: string, supabaseUrl: string): string | null {
  try {
    const candidate = new URL(value);
    const base = new URL(supabaseUrl);
    const prefix = '/storage/v1/object/public/processed-media/';
    if (candidate.origin !== base.origin || !candidate.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(candidate.pathname.slice(prefix.length));
    if (!path || path.split('/').some(part => part === '..' || part === '.')) return null;
    return path;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeMediaEditor();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }

  const { id } = await context.params;
  const item = await repo.getMediaItem(id);
  if (!item) {
    return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
  }
  const response: APIResponse<MediaItem> = { data: item };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeMediaEditor();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Trusted media storage is not configured.' }, { status: 503 });
  }

  const { id } = await context.params;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A media metadata object is required.' }, { status: 400 });
    }
    const value = body as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    const stringFields: Array<[string, string, number]> = [
      ['alt', 'alt', 500],
      ['caption', 'caption', 500],
      ['credit', 'credit', 240],
      ['agency', 'agency', 160],
      ['copyrightOwner', 'copyright_owner', 160],
      ['photographer', 'photographer', 160],
      ['sourceUrl', 'source_url', 2048],
      ['licenseType', 'license_type', 40],
      ['imageCategory', 'image_category', 40],
      ['editorialPriority', 'editorial_priority', 40],
      ['longDescription', 'long_description', 3000],
      ['aiModel', 'ai_model', 120],
      ['aiProvider', 'ai_provider', 120],
      ['aiPrompt', 'ai_prompt', 2000],
    ];

    for (const [inputKey, column, maxLength] of stringFields) {
      const cleaned = cleanText(value[inputKey], maxLength);
      if (cleaned !== undefined) update[column] = cleaned || null;
    }

    if (Array.isArray(value.tags)) {
      update.tags = value.tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map(tag => cleanText(tag, 40) ?? '')
        .filter(Boolean)
        .slice(0, 20);
    }

    if (typeof value.isAiGenerated === 'boolean') update.is_ai_generated = value.isAiGenerated;
    for (const [inputKey, column] of [['focusPointX', 'focus_point_x'], ['focusPointY', 'focus_point_y']] as const) {
      const candidate = value[inputKey];
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        update[column] = Math.max(0, Math.min(100, candidate));
      }
    }

    if (value.verificationStatus !== undefined) {
      if (intelRoleRank(authorization.role) < intelRoleRank('fact_checker')) {
        return NextResponse.json({ error: 'A fact-checker or editor must verify media.' }, { status: 403 });
      }
      const allowedStatuses = new Set(['PENDING', 'EDITOR_VERIFIED', 'SOURCE_VERIFIED', 'AI_REVIEWED', 'REJECTED', 'ARCHIVED']);
      if (typeof value.verificationStatus !== 'string' || !allowedStatuses.has(value.verificationStatus)) {
        return NextResponse.json({ error: 'Invalid verification status.' }, { status: 400 });
      }
      update.verification_status = value.verificationStatus;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No editable media metadata was supplied.' }, { status: 400 });
    }

    update.updated_at = new Date().toISOString();
    const service = createServiceClient();
    const { data, error } = await service
      .from('media_items')
      .update(update)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Media metadata could not be saved.' }, { status: 502 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
    }

    const item = await repo.getMediaItem(id);
    if (!item) {
      return NextResponse.json({ error: 'Media item was saved but could not be reloaded.' }, { status: 502 });
    }
    const response: APIResponse<MediaItem> = { data: item };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Invalid media update request.' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeMediaEditor();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (intelRoleRank(authorization.role) < intelRoleRank('editor')) {
    return NextResponse.json({ error: 'An editor or administrator is required to delete media.' }, { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Trusted media storage is not configured.' }, { status: 503 });
  }

  const { id } = await context.params;
  const service = createServiceClient();
  const { data: existing, error: readError } = await service
    .from('media_items')
    .select('id, src, url')
    .eq('id', id)
    .maybeSingle();

  if (readError) return NextResponse.json({ error: 'Media item could not be loaded.' }, { status: 502 });
  if (!existing) return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });

  const objectPath = objectPathFromPublicUrl(existing.src || existing.url, process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (objectPath) {
    const { error: storageError } = await service.storage.from('processed-media').remove([objectPath]);
    if (storageError) {
      return NextResponse.json({ error: 'Processed media could not be removed.' }, { status: 502 });
    }
  }

  const { error: deleteError } = await service.from('media_items').delete().eq('id', id);
  if (deleteError) {
    return NextResponse.json({ error: 'Media metadata could not be removed.' }, { status: 502 });
  }

  return new NextResponse(null, { status: 204 });
}
