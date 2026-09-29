-- The Breakdown OS — Migration 017
-- Generative Engine Optimization (GEO) & AEO Visibility Measurement Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Governing documents:
--   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
--   - docs/aeo-geo/11-measurement-baseline.md (§3 GEO Observation Schema)
--   - Editorial Constitution §XIII (verification & transparency)

CREATE TABLE IF NOT EXISTS public.ai_visibility_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine TEXT NOT NULL CHECK (engine IN (
        'chatgpt',
        'gemini',
        'perplexity',
        'copilot',
        'google_ai_overview',
        'claude',
        'other'
    )),
    query TEXT NOT NULL,
    query_id TEXT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    story_id TEXT,
    mentioned BOOLEAN NOT NULL DEFAULT FALSE,
    cited BOOLEAN NOT NULL DEFAULT FALSE,
    citation_url TEXT,
    citation_correct BOOLEAN,
    answer_accuracy SMALLINT CHECK (answer_accuracy >= 0 AND answer_accuracy <= 4),
    notes TEXT,
    observer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_geo_obs_engine ON public.ai_visibility_observations(engine);
CREATE INDEX IF NOT EXISTS idx_geo_obs_query_id ON public.ai_visibility_observations(query_id);
CREATE INDEX IF NOT EXISTS idx_geo_obs_story_id ON public.ai_visibility_observations(story_id);
CREATE INDEX IF NOT EXISTS idx_geo_obs_observed_at ON public.ai_visibility_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_geo_obs_cited ON public.ai_visibility_observations(cited);

-- Enable Row Level Security
ALTER TABLE public.ai_visibility_observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Staff can read and record observations; Editors can update; Admins can delete
DROP POLICY IF EXISTS staff_read_geo_observations ON public.ai_visibility_observations;
CREATE POLICY staff_read_geo_observations ON public.ai_visibility_observations
    FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS staff_insert_geo_observations ON public.ai_visibility_observations;
CREATE POLICY staff_insert_geo_observations ON public.ai_visibility_observations
    FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS editor_update_geo_observations ON public.ai_visibility_observations;
CREATE POLICY editor_update_geo_observations ON public.ai_visibility_observations
    FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS admin_delete_geo_observations ON public.ai_visibility_observations;
CREATE POLICY admin_delete_geo_observations ON public.ai_visibility_observations
    FOR DELETE USING (public.is_admin());
