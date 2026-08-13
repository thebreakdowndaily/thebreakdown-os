-- supabase/migrations/012_create_intelligence_schema.sql
-- Newsroom Intelligence OS Schema Migration
-- Creating newsroom schema and its 17 tables

CREATE SCHEMA IF NOT EXISTS newsroom;

-- 1. newsroom.sources
CREATE TABLE IF NOT EXISTS newsroom.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  tier INT NOT NULL,
  adapter_type TEXT NOT NULL,
  domains TEXT[] NOT NULL DEFAULT '{}',
  geography TEXT NOT NULL,
  language TEXT NOT NULL,
  check_interval_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  health_status TEXT NOT NULL DEFAULT 'healthy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. newsroom.source_endpoints
CREATE TABLE IF NOT EXISTS newsroom.source_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES newsroom.sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  endpoint_type TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_successful_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT source_endpoints_source_url_unique UNIQUE (source_id, url)
);

-- 3. newsroom.source_health_log
CREATE TABLE IF NOT EXISTS newsroom.source_health_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES newsroom.sources(id) ON DELETE CASCADE,
  endpoint_id UUID NOT NULL REFERENCES newsroom.source_endpoints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  observations_found INTEGER NOT NULL DEFAULT 0,
  duplicates_found INTEGER NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. newsroom.source_reputation
CREATE TABLE IF NOT EXISTS newsroom.source_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL UNIQUE REFERENCES newsroom.sources(id) ON DELETE CASCADE,
  overall_reliability NUMERIC NOT NULL DEFAULT 100,
  topic_reliability JSONB NOT NULL DEFAULT '{}',
  historical_accuracy NUMERIC NOT NULL DEFAULT 100,
  correction_rate NUMERIC NOT NULL DEFAULT 0,
  false_alarm_rate NUMERIC NOT NULL DEFAULT 0,
  average_latency_minutes NUMERIC NOT NULL DEFAULT 0,
  primary_source_frequency NUMERIC NOT NULL DEFAULT 0,
  confirmation_rate NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. newsroom.observations
CREATE TABLE IF NOT EXISTS newsroom.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES newsroom.sources(id) ON DELETE CASCADE,
  endpoint_id UUID NOT NULL REFERENCES newsroom.source_endpoints(id) ON DELETE CASCADE,
  external_id TEXT,
  observation_type TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  snippet TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  language TEXT NOT NULL,
  original_language TEXT NOT NULL,
  source_tier INT NOT NULL,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  duplicate_of_id UUID REFERENCES newsroom.observations(id) ON DELETE SET NULL,
  near_duplicate_group_id UUID,
  entities_detected JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for newsroom.observations
CREATE INDEX IF NOT EXISTS observations_content_hash_idx ON newsroom.observations (content_hash);
CREATE INDEX IF NOT EXISTS observations_canonical_url_idx ON newsroom.observations (canonical_url);
CREATE UNIQUE INDEX IF NOT EXISTS observations_source_external_idx ON newsroom.observations (source_id, external_id) WHERE external_id IS NOT NULL;

-- 6. newsroom.claims
CREATE TABLE IF NOT EXISTS newsroom.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES newsroom.observations(id) ON DELETE CASCADE,
  actor TEXT,
  action TEXT,
  object TEXT,
  value TEXT,
  time TEXT,
  place TEXT,
  statement TEXT NOT NULL,
  epistemic_status TEXT NOT NULL DEFAULT 'unknown',
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  source_count INTEGER NOT NULL DEFAULT 1,
  verification_state TEXT NOT NULL DEFAULT 'discovered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. newsroom.claim_evidence
CREATE TABLE IF NOT EXISTS newsroom.claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES newsroom.claims(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES newsroom.observations(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  strength NUMERIC NOT NULL DEFAULT 0,
  passage TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_tier INTEGER NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT claim_evidence_claim_observation_unique UNIQUE (claim_id, observation_id)
);

-- 8. newsroom.verification_events
CREATE TABLE IF NOT EXISTS newsroom.verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES newsroom.claims(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_id UUID REFERENCES newsroom.claim_evidence(id) ON DELETE SET NULL,
  verified_by TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. newsroom.story_clusters
CREATE TABLE IF NOT EXISTS newsroom.story_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_title TEXT NOT NULL,
  summary TEXT NOT NULL,
  domains TEXT[] NOT NULL DEFAULT '{}',
  geography TEXT[] NOT NULL DEFAULT '{}',
  observation_count INTEGER NOT NULL DEFAULT 0,
  source_count INTEGER NOT NULL DEFAULT 0,
  primary_source_count INTEGER NOT NULL DEFAULT 0,
  unique_source_count INTEGER NOT NULL DEFAULT 0,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_state TEXT NOT NULL DEFAULT 'discovered',
  temporal_relevance TEXT NOT NULL DEFAULT 'breaking',
  entities JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. newsroom.story_observations
CREATE TABLE IF NOT EXISTS newsroom.story_observations (
  story_cluster_id UUID NOT NULL REFERENCES newsroom.story_clusters(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES newsroom.observations(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_cluster_id, observation_id)
);

-- 11. newsroom.story_claims
CREATE TABLE IF NOT EXISTS newsroom.story_claims (
  story_cluster_id UUID NOT NULL REFERENCES newsroom.story_clusters(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES newsroom.claims(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'supporting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_cluster_id, claim_id)
);

-- 12. newsroom.story_velocity
CREATE TABLE IF NOT EXISTS newsroom.story_velocity (
  story_cluster_id UUID PRIMARY KEY REFERENCES newsroom.story_clusters(id) ON DELETE CASCADE,
  observations_per_hour NUMERIC NOT NULL DEFAULT 0.0,
  independent_sources INTEGER NOT NULL DEFAULT 0,
  platform_count INTEGER NOT NULL DEFAULT 0,
  acceleration NUMERIC NOT NULL DEFAULT 0.0,
  geographic_spread NUMERIC NOT NULL DEFAULT 0.0,
  primary_source_emergence BOOLEAN NOT NULL DEFAULT false,
  velocity_level TEXT NOT NULL DEFAULT 'normal',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. newsroom.signals
CREATE TABLE IF NOT EXISTS newsroom.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_cluster_id UUID NOT NULL REFERENCES newsroom.story_clusters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  priority_level TEXT NOT NULL DEFAULT 'P2',
  priority_explanation TEXT NOT NULL DEFAULT '',
  scores JSONB NOT NULL DEFAULT '{}',
  domains TEXT[] NOT NULL DEFAULT '{}',
  geography TEXT[] NOT NULL DEFAULT '{}',
  entities JSONB NOT NULL DEFAULT '[]',
  temporal_relevance TEXT NOT NULL DEFAULT 'breaking',
  verification_state TEXT NOT NULL DEFAULT 'discovered',
  observation_count INTEGER NOT NULL DEFAULT 0,
  source_count INTEGER NOT NULL DEFAULT 0,
  primary_source_count INTEGER NOT NULL DEFAULT 0,
  recommended_action TEXT NOT NULL DEFAULT '',
  why_it_matters TEXT NOT NULL DEFAULT '',
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. newsroom.alerts
CREATE TABLE IF NOT EXISTS newsroom.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES newsroom.signals(id) ON DELETE CASCADE,
  story_cluster_id UUID NOT NULL REFERENCES newsroom.story_clusters(id) ON DELETE CASCADE,
  priority_level TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  explanation TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  delivered_channels TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. newsroom.editorial_feedback
CREATE TABLE IF NOT EXISTS newsroom.editorial_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES newsroom.signals(id) ON DELETE CASCADE,
  observation_id UUID REFERENCES newsroom.observations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  feedback_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. newsroom.coverage_gaps
CREATE TABLE IF NOT EXISTS newsroom.coverage_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  expected_development TEXT NOT NULL,
  last_covered_at TIMESTAMPTZ,
  gap_type TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. newsroom.pipeline_metrics
CREATE TABLE IF NOT EXISTS newsroom.pipeline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS — W3/W4 Forensic Audit (docs/audits/w3w4-forensic-audit-20260813.md)
-- The newsroom schema is internal intelligence infrastructure. All 17 tables
-- receive the identical role-gated policy set, so the policies are created in
-- a loop rather than repeated by hand: read/insert/update by any research role
-- carried in the JWT app_metadata. No anon/public policy and no DELETE policy
-- (hard-delete protection). The schema remains private; public exposure is
-- achieved through the service layer, never through anon RLS.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
  role_check TEXT := '(SELECT auth.jwt() -> ''app_metadata'' ->> ''research_role'')
    IN (''researcher'', ''reviewer'', ''editor'', ''administrator'', ''automated_ingestion_agent'')';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sources', 'source_endpoints', 'source_health_log', 'source_reputation',
    'observations', 'claims', 'claim_evidence', 'verification_events',
    'story_clusters', 'story_observations', 'story_claims', 'story_velocity',
    'signals', 'alerts', 'editorial_feedback', 'coverage_gaps', 'pipeline_metrics'
  ] LOOP
    EXECUTE format('ALTER TABLE newsroom.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY internal_read_%s ON newsroom.%I FOR SELECT USING (%s)', t, t, role_check);
    EXECUTE format('CREATE POLICY internal_insert_%s ON newsroom.%I FOR INSERT WITH CHECK (%s)', t, t, role_check);
    EXECUTE format('CREATE POLICY internal_update_%s ON newsroom.%I FOR UPDATE USING (%s) WITH CHECK (%s)', t, t, role_check, role_check);
  END LOOP;
END $$;
