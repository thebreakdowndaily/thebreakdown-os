-- 034 — Trusted server-side media processing boundary
--
-- Only the application server's service-role client may write to the processed-media
-- bucket or media_items table. Staff sessions, including owner/managing_editor, may
-- not bypass the sanitizer by writing directly through Supabase client APIs.
--
-- Raw uploads are processed in memory and are never persisted to this public bucket.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'processed-media',
  'processed-media',
  true,
  4194304,
  ARRAY['image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public delivery is read-only. Public buckets do not imply public upload rights.
DROP POLICY IF EXISTS processed_media_public_read ON storage.objects;
CREATE POLICY processed_media_public_read
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'processed-media');

-- Restrictive policies are intentional: they are ANDed with any existing permissive
-- Storage policies, so a broad legacy staff policy cannot reopen this bucket.
DROP POLICY IF EXISTS processed_media_deny_client_insert ON storage.objects;
CREATE POLICY processed_media_deny_client_insert
  ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id <> 'processed-media');

DROP POLICY IF EXISTS processed_media_deny_client_update ON storage.objects;
CREATE POLICY processed_media_deny_client_update
  ON storage.objects
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id <> 'processed-media')
  WITH CHECK (bucket_id <> 'processed-media');

DROP POLICY IF EXISTS processed_media_deny_client_delete ON storage.objects;
CREATE POLICY processed_media_deny_client_delete
  ON storage.objects
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id <> 'processed-media');

-- Preserve public reads while making the server route the only application write path.
DROP POLICY IF EXISTS staff_insert_media ON public.media_items;
DROP POLICY IF EXISTS staff_update_media ON public.media_items;
DROP POLICY IF EXISTS admin_delete_media ON public.media_items;

DROP POLICY IF EXISTS media_items_deny_client_insert ON public.media_items;
CREATE POLICY media_items_deny_client_insert
  ON public.media_items
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS media_items_deny_client_update ON public.media_items;
CREATE POLICY media_items_deny_client_update
  ON public.media_items
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS media_items_deny_client_delete ON public.media_items;
CREATE POLICY media_items_deny_client_delete
  ON public.media_items
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);
