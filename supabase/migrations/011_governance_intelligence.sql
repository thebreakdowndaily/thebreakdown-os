-- supabase/migrations/011_governance_intelligence.sql
-- Ingestion schema for Governance domain plugin

CREATE TABLE IF NOT EXISTS gov_ministries (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

CREATE TABLE IF NOT EXISTS gov_budgets (
  id VARCHAR(255) PRIMARY KEY,
  ministry_id VARCHAR(255) REFERENCES gov_ministries(id),
  allocated_amount NUMERIC NOT NULL,
  released_amount NUMERIC NOT NULL,
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

CREATE TABLE IF NOT EXISTS gov_schemes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ministry_id VARCHAR(255) REFERENCES gov_ministries(id),
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

CREATE TABLE IF NOT EXISTS gov_projects (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  scheme_id VARCHAR(255) REFERENCES gov_schemes(id),
  constituency_id VARCHAR(255) NOT NULL,
  budget_allocated NUMERIC NOT NULL,
  budget_spent NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,
  delay_months INTEGER DEFAULT 0,
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

CREATE TABLE IF NOT EXISTS gov_contractors (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  reliability_score NUMERIC DEFAULT 1.0,
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

CREATE TABLE IF NOT EXISTS gov_audits (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES gov_projects(id),
  audit_risk_score NUMERIC DEFAULT 0.0,
  findings TEXT,
  valid_range TSTZRANGE NOT NULL,
  system_range TSTZRANGE NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS — W3/W4 Forensic Audit (docs/audits/w3w4-forensic-audit-20260813.md)
-- Governance intelligence tables hold budget allocations, project spend, and
-- audit findings — internal intelligence material. Row access is gated to the
-- research roles carried in the JWT app_metadata; no anon/public policy.
-- No DELETE policy, preserving hard-delete protection and auditability.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gov_ministries ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_ministries ON gov_ministries
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_ministries ON gov_ministries
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_ministries ON gov_ministries
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE gov_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_budgets ON gov_budgets
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_budgets ON gov_budgets
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_budgets ON gov_budgets
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE gov_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_schemes ON gov_schemes
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_schemes ON gov_schemes
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_schemes ON gov_schemes
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE gov_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_projects ON gov_projects
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_projects ON gov_projects
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_projects ON gov_projects
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE gov_contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_contractors ON gov_contractors
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_contractors ON gov_contractors
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_contractors ON gov_contractors
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE gov_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gov_audits ON gov_audits
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_insert_gov_audits ON gov_audits
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_gov_audits ON gov_audits
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
