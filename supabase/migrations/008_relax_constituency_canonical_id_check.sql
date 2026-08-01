-- Migration 008: Relax constituency canonical_id check constraint
--
-- The pilot constraint CHECK (canonical_id ~ '^UP-AC-[0-9]{3}$') only
-- accepted UP assembly constituencies with 3-digit numbers. The controlled
-- production batch requires all Indian states and both 2- and 3-digit AC
-- numbers (e.g. GJ-AC-61, MH-AC-191, HP-AC-36, ML-AC-16).
--
-- Also expands VARCHAR(20) → VARCHAR(100) to match the schema baseline
-- freeze document which specifies VARCHAR(100) for this column.

BEGIN;

-- 1. Drop the overly restrictive check constraint
ALTER TABLE research_constituencies
    DROP CONSTRAINT IF EXISTS research_constituencies_canonical_id_check;

-- 2. Expand column width to match baseline freeze spec
ALTER TABLE research_constituencies
    ALTER COLUMN canonical_id TYPE VARCHAR(100);

-- 3. Add new permissive check constraint:
--    {STATE_CODE}-AC-{2_to_4_digits}
--    Supports all Indian state/UT codes and AC numbers 1–9999.
ALTER TABLE research_constituencies
    ADD CONSTRAINT research_constituencies_canonical_id_check
    CHECK (canonical_id ~ '^[A-Z]{2}-AC-[0-9]{2,4}$');

COMMIT;
