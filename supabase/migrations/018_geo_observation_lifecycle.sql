-- The Breakdown OS — Migration 018
-- GEO Observation Lifecycle, Representation Integrity & Feedback Schema
-- ═════════════════════════════════════════════════════════════════════════
-- Governing documents:
--   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
--   - Editorial Constitution §XIII (verification & transparency)
--   - Core Question: Separate absence of retrieval from factual inaccuracy

ALTER TABLE public.ai_visibility_observations
    ADD COLUMN IF NOT EXISTS observation_state TEXT CHECK (observation_state IN (
        'NOT_OBSERVED',
        'OBSERVED_NO_MENTION',
        'OBSERVED_MENTION_NO_CITATION',
        'OBSERVED_CITATION',
        'OBSERVED_INCORRECT_CITATION',
        'OBSERVED_CORRECT_CITATION'
    )) DEFAULT 'NOT_OBSERVED',
    ADD COLUMN IF NOT EXISTS observation_method TEXT CHECK (observation_method IN (
        'manual',
        'browser',
        'api',
        'search_inspection',
        'ai_inspection'
    )) DEFAULT 'search_inspection',
    ADD COLUMN IF NOT EXISTS answer_present BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS model TEXT,
    ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'IN',
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS entity_id TEXT,
    ADD COLUMN IF NOT EXISTS raw_response_snippet TEXT,
    ADD COLUMN IF NOT EXISTS context_integrity TEXT CHECK (context_integrity IN (
        'preserved',
        'omitted',
        'distorted'
    )),
    ADD COLUMN IF NOT EXISTS freshness TEXT CHECK (freshness IN (
        'current',
        'stale',
        'outdated'
    )),
    ADD COLUMN IF NOT EXISTS evidence_grounding TEXT CHECK (evidence_grounding IN (
        'grounded',
        'unsupported',
        'contradicted'
    )),
    ADD COLUMN IF NOT EXISTS claim_evaluations JSONB,
    ADD COLUMN IF NOT EXISTS failure_classification TEXT CHECK (failure_classification IN (
        'CONTENT_GAP',
        'EVIDENCE_GAP',
        'ENTITY_GAP',
        'STRUCTURED_DATA_GAP',
        'DISCOVERY_GAP',
        'CANONICAL_GAP',
        'FRESHNESS_GAP',
        'REPRESENTATION_GAP',
        'EXTERNAL_INDEXING_GAP',
        'UNKNOWN'
    ));

-- Backfill existing rows: ensure unobserved baseline entries have NULL accuracy and NOT_OBSERVED state
UPDATE public.ai_visibility_observations
SET observation_state = 'NOT_OBSERVED',
    answer_present = FALSE,
    answer_accuracy = NULL,
    failure_classification = 'EXTERNAL_INDEXING_GAP'
WHERE (mentioned = FALSE AND cited = FALSE AND answer_accuracy = 0);

-- Indexes for dimensional retrieval and feedback queries
CREATE INDEX IF NOT EXISTS idx_geo_obs_state ON public.ai_visibility_observations(observation_state);
CREATE INDEX IF NOT EXISTS idx_geo_obs_failure ON public.ai_visibility_observations(failure_classification);
CREATE INDEX IF NOT EXISTS idx_geo_obs_entity ON public.ai_visibility_observations(entity_id);
CREATE INDEX IF NOT EXISTS idx_geo_obs_method ON public.ai_visibility_observations(observation_method);
