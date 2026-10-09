-- ─── Migration 028: Pre-Vault Legacy Cohort Demarcation ──────────────────────
--
-- Governing Documents:
--   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV)
--   - AGENTS.md (Platform Beta - Zero-Bypass Invariants)
--   - .planning/PHASE-4B-2J-PRODUCTION-BOUNDARY-BUILD-AUTHORITY-DESIGN.md
--
-- Objective:
--   Deterministically tag all historical claims in ALREADY-PUBLISHED pre-vault
--   stories with isLegacy = true. Excludes draft stories and future insertions.

DO $$
BEGIN
  -- 1. Backfill isLegacy: true onto all claims of stories published prior to vault activation
  UPDATE public.stories
  SET claims = (
    SELECT jsonb_agg(
      CASE 
        WHEN jsonb_typeof(claim_elem) = 'object' THEN
          jsonb_set(claim_elem, '{isLegacy}', 'true'::jsonb, true)
        ELSE claim_elem
      END
    )
    FROM jsonb_array_elements(claims) AS claim_elem
  )
  WHERE status = 'published'
    AND claims IS NOT NULL
    AND jsonb_typeof(claims) = 'array'
    AND jsonb_array_length(claims) > 0;

  -- 2. Populate legacy_id for auditability on pre-vault published stories if not already populated
  UPDATE public.stories
  SET legacy_id = COALESCE(legacy_id, 'pre-vault-' || id::text)
  WHERE status = 'published'
    AND legacy_id IS NULL;

END $$;
