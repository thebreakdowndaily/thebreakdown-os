-- The Breakdown OS — Migration 019
-- GEO Diagnostic Attribution & Retrieval Failure Classification Schema
-- ═══════════════════════════════════════════════════════════════════════
-- Governing documents:
--   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
--   - Editorial Constitution §XIII (transparency & defensibility)
--   - Core Question: Separate unobserved retrieval from assumed indexing failure.
--   - Diagnostic Taxonomy: 12 discrete failure modes (A through L).

-- 1. Drop old constraint and apply expanded diagnostic taxonomy
ALTER TABLE public.ai_visibility_observations
    DROP CONSTRAINT IF EXISTS ai_visibility_observations_failure_classification_check;

ALTER TABLE public.ai_visibility_observations
    ADD CONSTRAINT ai_visibility_observations_failure_classification_check
    CHECK (failure_classification IN (
        -- Expanded 12-factor diagnostic taxonomy
        'INDEXING_DISCOVERY_GAP',
        'RANKING_RETRIEVAL_GAP',
        'ENTITY_RECOGNITION_GAP',
        'CONTENT_GAP',
        'EVIDENCE_GAP',
        'STRUCTURED_DATA_GAP',
        'CANONICALIZATION_GAP',
        'FRESHNESS_GAP',
        'REPRESENTATION_GAP',
        'AUTHORITY_GAP',
        'ENGINE_SPECIFIC_BEHAVIOR',
        'UNKNOWN_INSUFFICIENT_EVIDENCE',
        -- Backward-compatible legacy aliases
        'DISCOVERY_GAP',
        'CANONICAL_GAP',
        'EXTERNAL_INDEXING_GAP',
        'UNKNOWN'
    ));

-- 2. Add diagnostic_signals JSONB column for forensic telemetry
ALTER TABLE public.ai_visibility_observations
    ADD COLUMN IF NOT EXISTS diagnostic_signals JSONB;

-- 3. Update existing unobserved baseline records:
-- Replace premature 'EXTERNAL_INDEXING_GAP' with 'UNKNOWN_INSUFFICIENT_EVIDENCE'
-- unless verified by empirical index inspection telemetry.
UPDATE public.ai_visibility_observations
SET failure_classification = 'UNKNOWN_INSUFFICIENT_EVIDENCE',
    notes = 'T0 Baseline: Retrieval unobserved across tested surfaces. Diagnostic attribution remains UNKNOWN_INSUFFICIENT_EVIDENCE until index inspection or SERP telemetry is gathered.'
WHERE observation_state = 'NOT_OBSERVED' 
  AND (failure_classification = 'EXTERNAL_INDEXING_GAP' OR failure_classification IS NULL);

-- 4. Clean up duplicate test rows, keeping the single latest record per query_id + engine + observer
DELETE FROM public.ai_visibility_observations a
USING public.ai_visibility_observations b
WHERE a.query_id = b.query_id
  AND a.engine = b.engine
  AND a.observer = b.observer
  AND a.created_at < b.created_at;

-- Index for diagnostic telemetry querying
CREATE INDEX IF NOT EXISTS idx_geo_obs_diag_signals ON public.ai_visibility_observations USING gin(diagnostic_signals);
