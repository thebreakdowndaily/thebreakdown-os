-- 034_durable_correction_publication.sql
-- Make public.corrections authoritative and publish a reader correction atomically.
-- Additive only: no production data is deleted or overwritten.

ALTER TABLE public.reader_corrections
  ADD COLUMN IF NOT EXISTS resolved_correction_id UUID
  REFERENCES public.corrections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reader_corrections_resolved_correction_id
  ON public.reader_corrections(resolved_correction_id);

-- Backfill the four existing editorial notices that previously lived only in a
-- process-local TypeScript map. The join uses canonical story slugs and skips
-- existing equivalents, so the statement is repeatable and does not synthesize
-- story identities. Missing stories are intentionally skipped for safe staged rollout.
INSERT INTO public.corrections (
  story_id, category, previous_wording, corrected_wording, explanation, created_at, updated_at
)
SELECT story.id, seed.category, seed.previous_wording, seed.corrected_wording,
       seed.explanation, seed.created_at, seed.created_at
FROM (
  VALUES
    (
      'electoral-bonds', 'factual',
      'The Bharatiya Janata Party (BJP) emerged as the single largest beneficiary of the electoral bond scheme, redeeming ₹6,060.5 crore—more than all other parties combined.',
      'The Bharatiya Janata Party (BJP) emerged as the single largest beneficiary of the electoral bond scheme, redeeming ₹6,060.5 crore—more than the next five largest recipient parties combined (47.5% of total encashed bond value).',
      'While the BJP was the predominant beneficiary, ₹6,060.5 crore represented 47.5% of the total ₹12,769 crore encashed during the disclosure window, which is slightly less than 50% of the aggregate total. The sentence was amended to accurately specify that BJP received more than the next five largest recipient parties combined.',
      '2026-09-29T10:00:00Z'::timestamptz
    ),
    (
      'electoral-bonds', 'factual',
      'The All India Trinamool Congress (TMC) redeemed ₹1,609.5 crore, ranking third behind the Indian National Congress (INC).',
      'The All India Trinamool Congress (TMC) redeemed ₹1,609.5 crore, ranking second behind the BJP, while the Indian National Congress (INC) redeemed ₹1,421.9 crore, ranking third.',
      'Corrected party encashment rankings. ECI disclosed filings confirm TMC was the second largest recipient overall with ₹1,609.5 crore, and INC was third with ₹1,421.9 crore.',
      '2026-09-29T10:00:00Z'::timestamptz
    ),
    (
      'electoral-bonds', 'factual',
      '12 July 2017: Finance Minister Arun Jaitley announces electoral bond scheme in Union Budget speech.',
      '1 February 2017: Finance Minister Arun Jaitley announces electoral bond scheme in Union Budget 2017–18 speech.',
      'Corrected date of the Union Budget 2017–18 speech in which the electoral bond scheme was originally proposed. The budget was presented on 1 February 2017, not 12 July 2017.',
      '2026-09-29T10:00:00Z'::timestamptz
    ),
    (
      'mgnrega-reform', 'clarification',
      'Social audit category totals in the summary chart did not explicitly account for 6,666 record reconciliation items.',
      'Added Record Reconciliation / Procedural (6.6k records) to ensure social audit breakdown categories reconcile exactly to the 89,066 record total.',
      'Reconciled social audit finding categories so that individual complaint bars and categories sum precisely to the reported national audit total of 89,066 records.',
      '2026-09-29T10:00:00Z'::timestamptz
    )
) AS seed(story_slug, category, previous_wording, corrected_wording, explanation, created_at)
JOIN public.stories AS story ON story.slug = seed.story_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.corrections AS existing
   WHERE existing.story_id = story.id
     AND existing.category = seed.category
     AND existing.previous_wording = seed.previous_wording
     AND existing.corrected_wording = seed.corrected_wording
     AND existing.explanation = seed.explanation
);

CREATE OR REPLACE FUNCTION public.publish_reader_correction(
  p_reader_correction_id UUID,
  p_published_correction_id UUID,
  p_category TEXT,
  p_previous_wording TEXT,
  p_corrected_wording TEXT,
  p_explanation TEXT,
  p_claim_id UUID
)
RETURNS SETOF public.corrections
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_submission public.reader_corrections%ROWTYPE;
  v_story_id UUID;
  v_claim_id UUID;
BEGIN
  SELECT rc.* INTO v_submission
    FROM public.reader_corrections AS rc
   WHERE rc.id = p_reader_correction_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Reader correction submission not found';
  END IF;

  -- Locking and the linkage column make retrying the publication idempotent.
  IF v_submission.resolved_correction_id IS NOT NULL THEN
    RETURN QUERY
      SELECT c.* FROM public.corrections AS c
       WHERE c.id = v_submission.resolved_correction_id;
    RETURN;
  END IF;

  IF v_submission.status = 'rejected' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Rejected submissions cannot be published';
  END IF;

  IF p_published_correction_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A published correction ID is required';
  END IF;

  IF p_category NOT IN ('factual', 'source', 'interpretive', 'clarification', 'context_update', 'retraction') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid correction category';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_corrected_wording, '')) = ''
     OR pg_catalog.btrim(COALESCE(p_explanation, '')) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Corrected wording and explanation are required';
  END IF;

  v_story_id := v_submission.story_id;
  IF v_story_id IS NULL THEN
    SELECT s.id INTO v_story_id
      FROM public.stories AS s
     WHERE s.slug = v_submission.story_slug
     ORDER BY s.created_at ASC
     LIMIT 1;
  END IF;

  IF v_story_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'The correction cannot be published because its canonical story was not found';
  END IF;

  v_claim_id := COALESCE(p_claim_id, v_submission.claim_id);
  IF v_claim_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM newsroom.claims AS claim WHERE claim.id = v_claim_id) THEN
    RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'The referenced claim was not found';
  END IF;

  INSERT INTO public.corrections (
    id, story_id, claim_id, category, previous_wording, corrected_wording, explanation
  ) VALUES (
    p_published_correction_id, v_story_id, v_claim_id, p_category,
    COALESCE(p_previous_wording, ''), p_corrected_wording, p_explanation
  );

  -- Insert and status/link update commit or roll back together.
  UPDATE public.reader_corrections
     SET story_id = v_story_id,
         claim_id = v_claim_id,
         status = 'resolved',
         resolved_correction_id = p_published_correction_id,
         updated_at = pg_catalog.now()
   WHERE id = p_reader_correction_id;

  RETURN QUERY
    SELECT c.* FROM public.corrections AS c
     WHERE c.id = p_published_correction_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.publish_reader_correction(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_reader_correction(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  TO service_role;

COMMENT ON FUNCTION public.publish_reader_correction(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  IS 'Atomically publishes an editorial correction and links it to the resolved reader submission. Service-role only.';
