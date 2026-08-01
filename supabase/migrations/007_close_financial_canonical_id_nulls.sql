-- Migration 007: Close DEBT-FIN-CANONICAL-ID-NULLS
--
-- Ensures all new financial records MUST have a canonical_id.
-- Adds a NOT NULL constraint on canonical_id for research_financial_records.
--
-- Prior to this migration, canonical_id was UNIQUE but nullable.
-- Legacy NULL rows (if any) are preserved by setting a sentinel value
-- before applying the constraint.
--
-- DEBT-FIN-CANONICAL-ID-NULLS: CLOSED

-- 1. Backfill any NULL canonical_ids with a generated identifier
-- Pattern: FIN-{LEGACY}-{ROW_ID_SHORT}
UPDATE research_financial_records
SET canonical_id = 'FIN-LEGACY-' || UPPER(SUBSTRING(id::text FROM 1 FOR 8))
WHERE canonical_id IS NULL;

-- 2. Add NOT NULL constraint
ALTER TABLE research_financial_records
ALTER COLUMN canonical_id SET NOT NULL;

-- 3. Verify no NULLs remain (defensive)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM research_financial_records WHERE canonical_id IS NULL) THEN
        RAISE EXCEPTION 'DEBT-FIN-CANONICAL-ID-NULLS: NULL canonical_id still present';
    END IF;
END
$$;
