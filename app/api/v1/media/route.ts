import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMediaRepository } from '@/services/repositories/supabase/media';
import type { MediaItem, APIResponse, APIListParams } from '@/types/canonical';
import { authorizeMediaEditor } from '@/lib/media/server/authorization';
import { sanitizeRasterImage, MediaSanitizationError, MAX_IMAGE_UPLOAD_BYTES } from '@/lib/media/server/image-sanitizer';
import { createServiceClient } from '@/supabase/client';
import { rateLimiter } from '@/features/rate-limiting/limiter';

export const runtime = 'nodejs';
export const maxDuration = 30;

const repo = new SupabaseMediaRepository();
const MAX_MULTIPART_OVERHEAD = 64 * 1024;

const LICENSE_TYPES: readonly NonNullable<MediaItem['licenseType']>[] = [
  'EDITORIAL', 'OFFICIAL', 'PUBLIC_DOMAIN', 'CC0', 'CC-BY', 'CC-BY-SA',
  'COMMERCIAL', 'LICENSED', 'FAIR_USE', 'AI',
];
const IMAGE_CATEGORIES: readonly NonNullable<MediaItem['imageCategory']>[] = [
  'PHOTO', 'ILLUSTRATION', 'INFOGRAPHIC', 'MAP', 'CHART', 'DIAGRAM',
  'DOCUMENT', 'SCREENSHOT', 'SATELLITE', 'LOGO',
];
const EDITORIAL_PRIORITIES: readonly NonNullable<MediaItem['editorialPriority']>[] = [
  'PRIMARY', 'SECONDARY', 'SUPPORTING', 'THUMBNAIL', 'HERO',
];

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? value as T
    : fallback;
}

async function readBoundedRequestBody(request: NextRequest, maxBytes: number): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel('Media request body exceeds the configured limit.');
        throw new MediaSanitizationError('Image uploads must be 4 MB or smaller.', 413);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, totalBytes);
}

function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return Array.from(value)
    .filter(character => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .trim()
    .slice(0, maxLength);
}

function parseMetadata(value: FormDataEntryValue | null): Record<string, unknown> {
  if (typeof value !== 'string' || value.length > 32 * 1024) {
    throw new Error('A valid media metadata object is required.');
  }
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Media metadata must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => cleanText(tag, 40))
    .filter(Boolean)
    .slice(0, 20);
}

export async function GET(request: NextRequest) {
  const authorization = await authorizeMediaEditor();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const readLimit = await rateLimiter.checkLimit({
    key: authorization.userId,
    tier: 'standard_api',
    endpoint: '/api/v1/media',
    actorId: authorization.userId,
    ip: clientIp,
  });
  if (!readLimit.allowed) {
    return rateLimiter.create429Response(readLimit, 'Media library rate limit exceeded.');
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageStr = searchParams.get('page');
    const pageSizeStr = searchParams.get('pageSize');
    const page = pageStr ? Math.max(1, Number.parseInt(pageStr, 10) || 1) : undefined;
    const pageSize = pageSizeStr
      ? Math.min(100, Math.max(1, Number.parseInt(pageSizeStr, 10) || 100))
      : undefined;
    const params: APIListParams = {
      page,
      pageSize,
      search: cleanText(searchParams.get('search'), 120) || undefined,
    };

    const result = await repo.getMedia(params);
    const typeFilter = searchParams.get('type');
    const filtered = typeFilter
      ? result.data.filter(item => item.type === typeFilter)
      : result.data;

    const response: APIResponse<MediaItem[]> = {
      data: filtered,
      meta: {
        ...result.meta,
        total: typeFilter ? filtered.length : (result.meta?.total ?? filtered.length),
        page: page ?? result.meta?.page ?? 1,
        pageSize: pageSize ?? result.meta?.pageSize ?? result.data.length,
      },
    };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load media library.' }, { status: 500 });
  }
}

/**
 * The only media creation path. Raw bytes are processed in memory, converted to
 * WebP and stripped of metadata before the service-role client writes them.
 * JSON/URL-based media creation is intentionally unsupported.
 */
export async function POST(request: NextRequest) {
  const authorization = await authorizeMediaEditor();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const uploadLimit = await rateLimiter.checkLimit({
    key: authorization.userId,
    tier: 'mutation',
    endpoint: '/api/v1/media',
    actorId: authorization.userId,
    ip: clientIp,
  });
  if (!uploadLimit.allowed) {
    return rateLimiter.create429Response(uploadLimit, 'Media upload rate limit exceeded.');
  }

  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: 'A same-origin browser request is required for media uploads.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_IMAGE_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD) {
    return NextResponse.json({ error: 'Image uploads must be 4 MB or smaller.' }, { status: 413 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Trusted media storage is not configured.' }, { status: 503 });
  }

  let objectPath: string | null = null;
  const service = createServiceClient();

  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) {
      return NextResponse.json({ error: 'Media uploads must use multipart form data.' }, { status: 415 });
    }

    const boundedBody = await readBoundedRequestBody(
      request,
      MAX_IMAGE_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD
    );
    const parsedRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: new Uint8Array(boundedBody),
    });
    let formData: FormData;
    try {
      formData = await parsedRequest.formData();
    } catch {
      return NextResponse.json({ error: 'The multipart upload is malformed.' }, { status: 400 });
    }
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose a JPEG, PNG, WebP or AVIF image to upload.' }, { status: 400 });
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadata(formData.get('metadata'));
    } catch {
      return NextResponse.json({ error: 'A valid media metadata object is required.' }, { status: 400 });
    }
    if (file.size < 1 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Image uploads must be between 1 byte and 4 MB.' }, { status: 413 });
    }

    const rawBytes = Buffer.from(await file.arrayBuffer());
    const sanitized = await sanitizeRasterImage(rawBytes, file.type);
    const licenseType = enumValue(metadata.licenseType, LICENSE_TYPES, 'EDITORIAL');
    const imageCategory = enumValue(metadata.imageCategory, IMAGE_CATEGORIES, 'PHOTO');
    const editorialPriority = enumValue(metadata.editorialPriority, EDITORIAL_PRIORITIES, 'SECONDARY');

    const id = crypto.randomUUID();
    objectPath = `${authorization.userId}/${id}.webp`;

    const { error: storageError } = await service.storage
      .from('processed-media')
      .upload(objectPath, sanitized.buffer, {
        contentType: sanitized.mimeType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (storageError) {
      await service.storage.from('processed-media').remove([objectPath]);
      objectPath = null;
      return NextResponse.json({ error: 'The processed image could not be stored.' }, { status: 502 });
    }

    const { data: publicUrlData } = service.storage
      .from('processed-media')
      .getPublicUrl(objectPath);
    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl || !/^https:\/\//.test(publicUrl)) {
      await service.storage.from('processed-media').remove([objectPath]);
      return NextResponse.json({ error: 'The processed media URL could not be resolved.' }, { status: 502 });
    }

    const now = new Date().toISOString();
    const { error: databaseError } = await service.from('media_items').insert({
      id,
      title: cleanText(metadata.caption, 180) || 'Untitled image',
      type: 'image',
      url: publicUrl,
      src: publicUrl,
      alt: cleanText(metadata.alt, 500),
      caption: cleanText(metadata.caption, 500),
      credit: cleanText(metadata.credit, 240),
      width: sanitized.width,
      height: sanitized.height,
      file_size: sanitized.fileSize,
      version: 1,
      tags: cleanTags(metadata.tags),
      agency: cleanText(metadata.agency, 160) || null,
      copyright_owner: cleanText(metadata.copyrightOwner, 160) || null,
      photographer: cleanText(metadata.photographer, 160) || null,
      source_url: cleanText(metadata.sourceUrl, 2048) || null,
      license_type: licenseType,
      image_category: imageCategory,
      editorial_priority: editorialPriority,
      long_description: cleanText(metadata.longDescription, 3000) || null,
      sha256_hash: sanitized.sha256,
      verification_status: 'PENDING',
      focus_point_x: 50,
      focus_point_y: 50,
      is_ai_generated: metadata.isAiGenerated === true,
      ai_model: cleanText(metadata.aiModel, 120) || null,
      ai_provider: cleanText(metadata.aiProvider, 120) || null,
      ai_prompt: cleanText(metadata.aiPrompt, 2000) || null,
      updated_at: now,
    });

    if (databaseError) {
      await service.storage.from('processed-media').remove([objectPath]);
      objectPath = null;
      return NextResponse.json({ error: 'The media record could not be created.' }, { status: 502 });
    }

    const response: APIResponse<MediaItem> = {
      data: {
        id,
        type: 'image',
        src: publicUrl,
        alt: cleanText(metadata.alt, 500),
        caption: cleanText(metadata.caption, 500),
        tags: cleanTags(metadata.tags),
        credit: cleanText(metadata.credit, 240),
        width: sanitized.width,
        height: sanitized.height,
        fileSize: sanitized.fileSize,
        version: 1,
        createdAt: now,
        updatedAt: now,
        sha256Hash: sanitized.sha256,
        verificationStatus: 'PENDING',
        licenseType,
        imageCategory,
        editorialPriority,
        isAiGenerated: metadata.isAiGenerated === true,
      },
    };
    return NextResponse.json(response, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (objectPath) {
      try {
        await service.storage.from('processed-media').remove([objectPath]);
      } catch {
        // Best-effort cleanup; the failure is not exposed to the client.
      }
    }

    if (error instanceof MediaSanitizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Media upload failed. No original file was published.' }, { status: 500 });
  }
}
