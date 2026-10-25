-- Migration 033: Durable, idempotent publication of reader corrections.
--
-- The public corrections ledger is an append-only projection. Publishing a
-- correction and resolving its private submission must commit atomically; a
-- process-local Map is only an offline/test fixture, never the production
-- source of truth.

ALTER TABLE public.reader_corrections
  ADD COLUMN IF NOT EXISTS triage_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_correction_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reader_corrections_resolved_correction_id_fkey'
      AND conrelid = 'public.reader_corrections'::regclass
  ) THEN
    ALTER TABLE public.reader_corrections
      ADD CONSTRAINT reader_corrections_resolved_correction_id_fkey
      FOREIGN KEY (resolved_correction_id)
      REFERENCES public.corrections(id)
      ON DELETE RESTRICT;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_reader_corrections_resolved_correction_id
  ON public.reader_corrections(resolved_correction_id);

CREATE OR REPLACE FUNCTION public.publish_reader_correction(
  p_reader_correction_id UUID,
  p_triage_notes TEXT,
  p_category TEXT,
  p_previous_wording TEXT,
  p_corrected_wording TEXT,
  p_explanation TEXT
)
RETURNS SETOF public.corrections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reader public.reader_corrections%ROWTYPE;
  v_notice public.corrections%ROWTYPE;
  v_story_id UUID;
BEGIN
  -- This privileged RPC is server-to-server only. Do not rely on RLS alone
  -- inside SECURITY DEFINER code, and do not accept caller-controlled roles.
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'publish_reader_correction requires service_role'
      USING ERRCODE = '42501';
  END IF;

  IF p_reader_correction_id IS NULL THEN
    RAISE EXCEPTION 'reader correction id is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_category IS NULL OR p_category NOT IN (
    'factual', 'source', 'interpretive', 'clarification',
    'context_update', 'retraction'
  ) THEN
    RAISE EXCEPTION 'invalid correction category'
      USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_corrected_wording, '')), '') IS NULL THEN
    RAISE EXCEPTION 'corrected wording is required'
      USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_explanation, '')), '') IS NULL THEN
    RAISE EXCEPTION 'correction explanation is required'
      USING ERRCODE = '22023';
  END IF;

  -- Serialize retries for the same submission. The id of the public notice is
  -- the reader-submission UUID, making publication naturally idempotent.
  SELECT *
    INTO v_reader
    FROM public.reader_corrections
   WHERE id = p_reader_correction_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reader correction not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_reader.resolved_correction_id IS NOT NULL THEN
    SELECT *
      INTO v_notice
      FROM public.corrections
     WHERE id = v_reader.resolved_correction_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'resolved correction reference is inconsistent'
        USING ERRCODE = '23503';
    END IF;

    RETURN NEXT v_notice;
    RETURN;
  END IF;

  IF v_reader.status = 'rejected' THEN
    RAISE EXCEPTION 'a rejected reader correction cannot be published'
      USING ERRCODE = '23514';
  END IF;

  -- Repair/ambiguous prior states should not overwrite an existing public
  -- notice. A notice with this id but no submission linkage is an integrity
  -- conflict and must be reviewed rather than silently adopted.
  SELECT *
    INTO v_notice
    FROM public.corrections
   WHERE id = p_reader_correction_id;

  IF FOUND THEN
    RAISE EXCEPTION 'public correction id exists without submission linkage'
      USING ERRCODE = '23505';
  END IF;

  v_story_id := v_reader.story_id;
  IF v_story_id IS NULL THEN
    SELECT s.id
      INTO v_story_id
      FROM public.stories AS s
     WHERE s.slug = v_reader.story_slug
     LIMIT 1;
  END IF;

  IF v_story_id IS NULL THEN
    RAISE EXCEPTION 'reader correction does not resolve to a canonical story'
      USING ERRCODE = '23503';
  END IF;

  INSERT INTO public.corrections (
    id,
    story_id,
    claim_id,
    verification_event_id,
    category,
    previous_wording,
    corrected_wording,
    explanation
  ) VALUES (
    p_reader_correction_id,
    v_story_id,
    v_reader.claim_id,
    NULL,
    p_category,
    COALESCE(p_previous_wording, ''),
    BTRIM(p_corrected_wording),
    BTRIM(p_explanation)
  )
  RETURNING * INTO v_notice;

  -- This update shares the same transaction as the insert above. If either
  -- operation fails, neither the public notice nor the resolved state commits.
  UPDATE public.reader_corrections
     SET status = 'resolved',
         triage_notes = COALESCE(NULLIF(BTRIM(p_triage_notes), ''), triage_notes),
         resolved_correction_id = v_notice.id,
         updated_at = now()
   WHERE id = p_reader_correction_id;

  RETURN NEXT v_notice;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_reader_correction(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_reader_correction(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_reader_correction(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;
