-- ============================================================================
-- Migration 022: Test Artifact Quarantine & Public Read Isolation
--
-- Target Table: public.stories
-- Objective:
--   1. Quarantine the 17 verified historical synthetic/test story records by
--      setting `is_test_artifact = true`.
--   2. Preserve historical data, version numbers, timestamps, and audit history
--      intact by temporarily pausing modification triggers during the update.
--   3. Update RLS policy `public_read_published_stories` to require:
--      `status = 'published' AND is_test_artifact = false`.
--
-- Non-Destructive Guarantees:
--   - Zero DROP TABLE, zero DROP COLUMN, zero TRUNCATE, zero DELETE.
--   - Zero modifications to story content, claims, sources, or timelines.
--   - Historical story status remains 'published' (quarantine enforced via flag).
-- ============================================================================

-- Step 1: Temporarily disable modification triggers to preserve historical version & audit integrity
ALTER TABLE public.stories DISABLE TRIGGER trg_stories_version_bump;
ALTER TABLE public.stories DISABLE TRIGGER trg_stories_updated_at;
ALTER TABLE public.stories DISABLE TRIGGER trg_stories_archive;

-- Step 2: Set is_test_artifact = true for the exact 17 approved synthetic stories
UPDATE public.stories
SET is_test_artifact = true
WHERE slug IN (
  'vs1-lifecycle-1790003039396',
  'adversarial-dml-p0-test-1790162463905',
  'story-fully-qualified-p0-test-1790163063554',
  'story-fully-qualified-p0-test-1790163175296',
  'story-fully-qualified-p0-test-1790163525896',
  'story-fully-qualified-p0-test-1790164735850',
  'story-fully-qualified-p0-test-1790164842582',
  'story-fully-qualified-p0-test-1790165283068',
  'story-fully-qualified-p0-test-1790165552184',
  'adversarial-dml-gates-p0-test-1790165552184',
  'adversarial-dml-gates-p0-test-1790168094422',
  'story-fully-qualified-p0-test-1790168394356',
  'adversarial-dml-gates-p0-test-1790168394356',
  'adversarial-dml-gates-p0-test-1790212041459',
  'adversarial-dml-gates-p0-test-1790260508414',
  'adversarial-dml-gates-p0-test-1790266821510',
  'story-concurrency-concurrency-1790266916098'
);

-- Step 3: Re-enable modification triggers
ALTER TABLE public.stories ENABLE TRIGGER trg_stories_version_bump;
ALTER TABLE public.stories ENABLE TRIGGER trg_stories_updated_at;
ALTER TABLE public.stories ENABLE TRIGGER trg_stories_archive;

-- Step 4: Update Row Level Security (RLS) policy for public read isolation
DROP POLICY IF EXISTS public_read_published_stories ON public.stories;
CREATE POLICY public_read_published_stories ON public.stories
    FOR SELECT USING (status = 'published' AND is_test_artifact = false);
