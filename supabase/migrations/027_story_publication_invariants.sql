-- ─── Migration 027: Story Publication Invariant Trigger (Phase 4B-2H) ──────────
--
-- Governing Documents:
--   - AGENTS.md (Verification & Idempotency, Platform Beta Zero-Bypass)
--   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
--   - .planning/PHASE-4B-2G-PUBLICATION-GUARD-UNIFICATION-DESIGN.md
--
-- Objective:
--   Add database-level defense-in-depth trigger on public.stories.
--   Fails closed if any non-legacy story is transitioned to 'published'
--   with non-legacy claims that lack Evidence Vault archive identifiers.
--
-- Target Schema: public.stories

CREATE OR REPLACE FUNCTION public.enforce_story_publication_invariants()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  claim_item jsonb;
  is_legacy_claim boolean;
  archive_id text;
BEGIN
  -- Trigger ONLY fires when status transitions to 'published' or is inserted as 'published'
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status <> 'published') THEN
    
    -- 1. Ensure published_at timestamp is present
    IF NEW.published_at IS NULL THEN
      RAISE EXCEPTION 'Database Invariant Violation: Published story % must have a valid published_at timestamp.', NEW.id
        USING ERRCODE = '23514';
    END IF;

    -- 2. Inspect claims array for evidence compliance
    IF NEW.claims IS NOT NULL AND jsonb_typeof(NEW.claims) = 'array' AND jsonb_array_length(NEW.claims) > 0 THEN
      FOR claim_item IN SELECT * FROM jsonb_array_elements(NEW.claims)
      LOOP
        is_legacy_claim := COALESCE((claim_item->>'isLegacy')::boolean, false);
        archive_id := claim_item->>'archiveId';

        -- Non-legacy claims MUST have an archiveId attached
        IF NOT is_legacy_claim THEN
          IF archive_id IS NULL OR length(trim(archive_id)) = 0 THEN
            RAISE EXCEPTION 'Database Invariant Violation: Story % contains non-legacy claim lacking an Evidence Vault archiveId: %',
              NEW.id, COALESCE(claim_item->>'claim', 'Unnamed Claim')
              USING ERRCODE = '23514';
          END IF;
        END IF;
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_story_publication_invariants ON public.stories;

CREATE TRIGGER trg_enforce_story_publication_invariants
  BEFORE INSERT OR UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_story_publication_invariants();
