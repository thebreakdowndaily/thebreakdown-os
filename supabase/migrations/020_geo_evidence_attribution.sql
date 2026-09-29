-- The Breakdown OS — Migration 020
-- Formal GEO Evidence Attribution & Decoupled Score Matrix Schema
-- ═══════════════════════════════════════════════════════════════════════
-- Governing documents:
--   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
--   - docs/aeo-geo/diagnostic-attribution-framework.md
--   - Editorial Constitution §XIII (transparency & defensibility)
--   - Core Doctrine: T0 Immutability & Decoupled Local vs External Scoring.

CREATE TABLE IF NOT EXISTS public.geo_evidence_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_version VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    query_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64),
    target_url TEXT NOT NULL,
    engine VARCHAR(64) NOT NULL DEFAULT 'google',
    surface VARCHAR(64) NOT NULL DEFAULT 'web_search',
    model VARCHAR(64),
    region VARCHAR(16) DEFAULT 'IN',
    language VARCHAR(16) DEFAULT 'en',
    
    -- Independent Pipeline Stages
    index_status VARCHAR(32) NOT NULL CHECK (index_status IN ('INDEXED_CONFIRMED', 'NOT_INDEXED_CONFIRMED', 'INDEX_STATUS_UNKNOWN')),
    search_retrieval VARCHAR(32) NOT NULL CHECK (search_retrieval IN ('RETRIEVED', 'NOT_RETRIEVED', 'RETRIEVAL_UNKNOWN')),
    llm_ingestion VARCHAR(32) NOT NULL CHECK (llm_ingestion IN ('INGESTED', 'NOT_INGESTED', 'INGESTION_UNKNOWN')),
    mention_status VARCHAR(32) NOT NULL CHECK (mention_status IN ('MENTIONED', 'NOT_MENTIONED', 'MENTION_UNKNOWN')),
    citation_status VARCHAR(32) NOT NULL CHECK (citation_status IN ('CITING_CORRECT_CANONICAL', 'CITING_INCORRECT_URL', 'UNCITED', 'CITATION_UNKNOWN')),
    claim_grounding VARCHAR(32) NOT NULL CHECK (claim_grounding IN ('GROUNDED', 'PARTIALLY_GROUNDED', 'UNSUPPORTED', 'CONTRADICTED', 'GROUNDING_UNKNOWN')),
    
    -- Two Decoupled Scores
    local_readiness_score NUMERIC(5,2) NOT NULL, -- 0.00 to 100.00
    external_retrieval_score NUMERIC(5,2),       -- 0.00 to 100.00 or NULL if unobserved
    
    -- Content Semantic Requirements & Intent Coverage
    intent_coverage_rate NUMERIC(5,2) NOT NULL, -- 0.00 to 100.00
    query_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Formal Evidence Status Model (Array of atomic signals)
    evidence_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Diagnosis, Confidence & Resolution Paths
    diagnosis VARCHAR(64) NOT NULL,
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0.00 AND confidence <= 1.00),
    missing_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolution_test JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- State Transition History
    previous_diagnosis VARCHAR(64),
    transition_evidence TEXT,
    
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.geo_evidence_assessments ENABLE ROW LEVEL SECURITY;

-- 1. Read access for authenticated staff and service role
CREATE POLICY staff_read_geo_evidence_assessments ON public.geo_evidence_assessments
    FOR SELECT
    TO authenticated, service_role
    USING (true);

-- 2. Insert access for editors, researchers, and service role
CREATE POLICY staff_insert_geo_evidence_assessments ON public.geo_evidence_assessments
    FOR INSERT
    TO authenticated, service_role
    WITH CHECK (true);

-- 3. Update access for editors and service role
CREATE POLICY editor_update_geo_evidence_assessments ON public.geo_evidence_assessments
    FOR UPDATE
    TO authenticated, service_role
    USING (true);

-- 4. Delete access restricted to admin / service role
CREATE POLICY admin_delete_geo_evidence_assessments ON public.geo_evidence_assessments
    FOR DELETE
    TO service_role
    USING (true);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_geo_assess_query_id ON public.geo_evidence_assessments(query_id);
CREATE INDEX IF NOT EXISTS idx_geo_assess_version ON public.geo_evidence_assessments(assessment_version);
CREATE INDEX IF NOT EXISTS idx_geo_assess_diagnosis ON public.geo_evidence_assessments(diagnosis);
CREATE INDEX IF NOT EXISTS idx_geo_assess_signals ON public.geo_evidence_assessments USING gin(evidence_signals);
