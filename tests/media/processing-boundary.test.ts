import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('trusted media processing boundary', () => {
  it('stores only server-sanitized WebP bytes in the processed media bucket', () => {
    const route = read('app/api/v1/media/route.ts');
    expect(route).toContain('sanitizeRasterImage(rawBytes, file.type)');
    expect(route).toContain(".from('processed-media')");
    expect(route).toContain('.upload(objectPath, sanitized.buffer');
    expect(route).toContain('contentType: sanitized.mimeType');
    expect(route).not.toContain('src: cleanText(metadata.src');
    expect(route).toContain('readBoundedRequestBody(\n      request,\n      MAX_IMAGE_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD\n    )');
    expect(route).toContain('request.body?.getReader()');
    expect(route).toContain('await parsedRequest.formData()');
  });

  it('does not accept client-authored URLs as a new media record', () => {
    const route = read('app/api/v1/media/route.ts');
    expect(route).toContain("const file = formData.get('file')");
    expect(route).toContain('if (!(file instanceof File))');
    expect(route).toContain('JSON/URL-based media creation is intentionally unsupported.');
    expect(route).toContain('file.type');
  });

  it('denies direct browser writes even for privileged staff roles', () => {
    const migration = read('supabase/migrations/034_trusted_media_processing_boundary.sql');
    expect(migration).toContain('AS RESTRICTIVE');
    expect(migration).toContain('processed_media_deny_client_insert');
    expect(migration).toContain('processed_media_deny_client_update');
    expect(migration).toContain('processed_media_deny_client_delete');
    expect(migration).toContain('media_items_deny_client_insert');
    expect(migration).toContain('media_items_deny_client_update');
    expect(migration).toContain('media_items_deny_client_delete');
    expect(migration).toContain('WITH CHECK (false)');
    expect(migration).toContain("bucket_id <> 'processed-media'");
  });

  it('derives permissions from a verified session and authoritative role data', () => {
    const authorization = read('lib/media/server/authorization.ts');
    expect(authorization).toContain('supabase.auth.getClaims()');
    expect(authorization).toContain(".from('user_roles')");
    expect(authorization).toContain("canAccessIntelModule(role, 'media')");
    expect(authorization).not.toContain('claims.user_metadata');
  });

  it('updates only whitelisted metadata and never overwrites the processed file URL', () => {
    const route = read('app/api/v1/media/[id]/route.ts');
    expect(route).toContain("['alt', 'alt', 500]");
    expect(route).toContain("['caption', 'caption', 500]");
    expect(route).not.toContain('...body');
    expect(route).not.toContain('update.src');
    expect(route).not.toContain('update.url');
  });
});
