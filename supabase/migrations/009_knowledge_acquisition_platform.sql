-- SUPABASE MIGRATION: 009_KNOWLEDGE_ACQUISITION_PLATFORM
-- Implements the database tables for Layer 0 Ingestion tracking and Source Registries.

BEGIN;

-- 1. Extend research_sources
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en';
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS reliability INTEGER DEFAULT 100 CHECK (reliability >= 0 AND reliability <= 100);
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS refresh_frequency VARCHAR(50) DEFAULT 'monthly';
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS authentication JSONB DEFAULT '{}'::jsonb;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS parser_version VARCHAR(50) DEFAULT 'v1.0';
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS last_successful_sync TIMESTAMPTZ;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS next_refresh TIMESTAMPTZ;
ALTER TABLE research_sources ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'HEALTHY';

-- 2. Create research_collectors
CREATE TABLE IF NOT EXISTS research_collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    purpose TEXT NOT NULL,
    refresh_interval INTERVAL NOT NULL DEFAULT '30 days'::INTERVAL,
    health_status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY',
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create research_ingestion_queue
CREATE TABLE IF NOT EXISTS research_ingestion_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID REFERENCES research_collectors(id),
    source_id UUID REFERENCES research_sources(id),
    raw_payload_url TEXT, -- Pointing to object storage url
    raw_payload_checksum VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'collected' CHECK (status IN ('collected', 'needs_review', 'verified', 'published', 'archived', 'rejected', 'conflict')),
    conflict_details JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create research_diff_alerts
CREATE TABLE IF NOT EXISTS research_diff_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at semantics consistent with the public-schema convention
-- established by migration 002 (set_updated_at is defined there).
CREATE TRIGGER trg_research_ingestion_queue_updated_at
BEFORE UPDATE ON research_ingestion_queue
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS — W3/W4 Forensic Audit (docs/audits/w3w4-forensic-audit-20260813.md)
-- The Knowledge Acquisition Platform tables are internal ingestion
-- infrastructure (source registry, raw payload pointers, checksums, diff
-- alerts). Row access is gated to the research roles carried in the JWT
-- app_metadata; no anon/public policy. No DELETE policy, preserving
-- hard-delete protection and auditability of the ingestion queue.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE research_collectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_collectors ON research_collectors
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_collectors ON research_collectors
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_collectors ON research_collectors
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE research_ingestion_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_ingestion_queue ON research_ingestion_queue
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_ingestion_queue ON research_ingestion_queue
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_ingestion_queue ON research_ingestion_queue
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE research_diff_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_diff_alerts ON research_diff_alerts
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_diff_alerts ON research_diff_alerts
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_diff_alerts ON research_diff_alerts
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

COMMIT;
