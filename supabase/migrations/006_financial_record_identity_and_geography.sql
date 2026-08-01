-- Migration 006: Financial Record Identity & Geography
--
-- Adds three columns to research_financial_records that were introduced
-- via live ALTER TABLE during Step 3B vertical-slice validation.
--
-- canonical_id          — unique stable identifier for financial records,
--                         used by ingestion scripts and validation to
--                         detect duplicates and reference specific records
--                         (e.g. FIN-AYO-A1, FIN-AYO-A2-REGIONAL).
-- target_geography      — free-text description of the geographic scope
--                         (e.g. "Ayodhya and surrounding areas").
-- target_constituency_id — FK to research_constituencies for constituency-level
--                          attribution. NULL when the record covers a regional
--                          aggregation that spans multiple constituencies.

-- 1. Add canonical_id with unique constraint
ALTER TABLE research_financial_records
ADD COLUMN IF NOT EXISTS canonical_id VARCHAR(100);

-- UNIQUE constraint: each financial record has at most one canonical identifier.
-- NULLs are permitted (existing A1-style records created before this migration
-- do not carry a canonical_id). PostgreSQL treats NULLs as distinct for UNIQUE
-- purposes, so multiple rows with NULL canonical_id are valid.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_financial_canonical_id'
    ) THEN
        ALTER TABLE research_financial_records
        ADD CONSTRAINT uq_financial_canonical_id UNIQUE (canonical_id);
    END IF;
END
$$;

-- 2. Add target_geography for regional aggregation descriptions
ALTER TABLE research_financial_records
ADD COLUMN IF NOT EXISTS target_geography TEXT;

-- 3. Add target_constituency_id for constituency-level attribution
-- FK to research_constituencies(id). NULL for regional/aggregated records
-- that span multiple constituencies (e.g. FIN-AYO-A2-REGIONAL).
ALTER TABLE research_financial_records
ADD COLUMN IF NOT EXISTS target_constituency_id UUID
    REFERENCES research_constituencies(id);

-- Index for efficient lookup by constituency.
-- (No UNIQUE or other index covers target_constituency_id.)
CREATE INDEX IF NOT EXISTS idx_financial_target_constituency
    ON research_financial_records(target_constituency_id)
    WHERE target_constituency_id IS NOT NULL;

-- Note: canonical_id does NOT get an additional partial index because the
-- UNIQUE(canonical_id) constraint already creates a B-tree index that
-- covers non-NULL lookups. A separate partial index would be redundant
-- write/storage overhead.
