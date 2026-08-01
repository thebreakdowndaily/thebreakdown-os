-- Migration 005: Research Gaps & Search Protocols + Semantic Corrections

CREATE TYPE research_gap_status_type AS ENUM ('NOT_FOUND', 'NOT_REPORTED', 'NOT_VERIFIED', 'WITHHELD', 'NOT_APPLICABLE');

-- REPORTED was added to value_availability_status_type in migration 004
-- (ALTER TYPE ADD VALUE cannot run in a transaction block, so it must be
-- defined at CREATE TYPE time rather than added later).

-- COMMIT_SPLIT


-- Support for provisional records in claims
ALTER TABLE research_claims ADD COLUMN verification_required BOOLEAN NOT NULL DEFAULT false;

-- Claim-Evidence Relationship
CREATE TABLE research_claim_evidence_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES research_claims(id),
    evidence_id UUID NOT NULL REFERENCES research_evidence_items(id),
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'SUPPORTS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL,
    CONSTRAINT uq_claim_evidence UNIQUE (claim_id, evidence_id)
);

ALTER TABLE research_claim_evidence_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY internal_read_cer ON research_claim_evidence_relationships
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

CREATE POLICY agent_insert_cer ON research_claim_evidence_relationships
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
);

CREATE POLICY service_role_bypass_cer ON research_claim_evidence_relationships
USING (current_setting('role') = 'service_role');

-- Add missing insert policies for financial records (RLS was enabled in 004 but no insert policies added)
CREATE POLICY agent_insert_finance ON research_financial_records
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
);

CREATE POLICY researcher_insert_finance ON research_financial_records
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
);

ALTER TABLE research_claims DROP CONSTRAINT IF EXISTS claim_publish_requires_approval;
ALTER TABLE research_claims ADD CONSTRAINT claim_publish_requires_approval 
CHECK (publication_status != 'PUBLISHED' OR (human_review_status = 'APPROVED' AND verification_required = false));

-- Recreate the CHECK constraint with REPORTED now in the enum
ALTER TABLE research_financial_records DROP CONSTRAINT IF EXISTS research_financial_records_check;
ALTER TABLE research_financial_records ADD CONSTRAINT research_financial_records_check
CHECK (
    (amount_status IN ('KNOWN', 'REPORTED') AND amount_value IS NOT NULL AND amount_value >= 0) OR
    (amount_status NOT IN ('KNOWN', 'REPORTED') AND amount_value IS NULL)
);

-- Add amount_operator and source_terminology to research_financial_records
ALTER TABLE research_financial_records
ADD COLUMN amount_operator VARCHAR(50),
ADD COLUMN source_terminology TEXT,
ADD COLUMN fiscal_year VARCHAR(20),
ADD COLUMN reporting_source_id UUID REFERENCES research_sources(id);

-- Research Search Protocols
CREATE TABLE research_search_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(100) UNIQUE,
    research_question TEXT,
    requested_metric TEXT,
    target_geography TEXT,
    target_period TEXT,
    repositories_searched JSONB NOT NULL,
    queries_used JSONB,
    documents_inspected JSONB,
    near_matches_rejected JSONB,
    rejection_reasons TEXT,
    search_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_completed_at TIMESTAMPTZ,
    completeness_confidence VARCHAR(50),
    reverification_at TIMESTAMPTZ,
    executed_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT search_time_valid CHECK (search_completed_at IS NULL OR search_completed_at >= search_started_at)
);

-- Research Gaps
CREATE TABLE research_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(100) UNIQUE NOT NULL,
    gap_status research_gap_status_type NOT NULL,
    search_protocol_id UUID REFERENCES research_search_protocols(id),
    source_id UUID REFERENCES research_sources(id),
    
    -- polymorphic subject relationships (similar to claim subject relationships)
    entity_type VARCHAR(50),
    target_person_id UUID REFERENCES research_persons(id),
    target_party_id UUID REFERENCES research_political_parties(id),
    target_constituency_id UUID REFERENCES research_constituencies(id),
    target_project_id UUID REFERENCES research_projects(id),
    
    gap_description TEXT,
    rationale TEXT,
    
    publication_status publication_status_type NOT NULL DEFAULT 'DRAFT',
    human_review_status human_review_status_type NOT NULL DEFAULT 'UNREVIEWED',
    
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL,
    

    CONSTRAINT gap_status_not_reported_requires_source CHECK (
        (gap_status != 'NOT_REPORTED') OR (source_id IS NOT NULL)
    ),
    CONSTRAINT exactly_one_target CHECK (
        (
            (target_person_id IS NOT NULL)::INTEGER +
            (target_party_id IS NOT NULL)::INTEGER +
            (target_constituency_id IS NOT NULL)::INTEGER +
            (target_project_id IS NOT NULL)::INTEGER
        ) = 1
    ),
    CONSTRAINT gap_publish_requires_approval CHECK (
        publication_status != 'PUBLISHED' OR human_review_status = 'APPROVED'
    )
);

-- Hard Delete Protection is natively enforced because no role is granted DELETE privileges

ALTER TABLE research_search_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;

-- 2. Public Read (Published gaps only)
CREATE POLICY public_read_published_gaps ON research_gaps
FOR SELECT USING (publication_status = 'PUBLISHED');

-- 2b. Internal Read 
CREATE POLICY internal_read_gaps ON research_gaps
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

CREATE POLICY internal_read_protocols ON research_search_protocols
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

-- 3. Researchers
CREATE POLICY researcher_insert_gaps ON research_gaps
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
);
CREATE POLICY researcher_insert_protocols ON research_search_protocols
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
);

CREATE POLICY researcher_update_gaps ON research_gaps
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
    AND human_review_status = 'UNREVIEWED'
);

-- 4. Reviewers
CREATE POLICY reviewer_update_gaps ON research_gaps
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'reviewer'
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'reviewer'
    AND publication_status NOT IN ('PUBLISHED')
);

-- 5. Editors
CREATE POLICY editor_publish_gaps ON research_gaps
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'editor'
);

-- 6. Admins
CREATE POLICY admin_update_gaps ON research_gaps
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'administrator'
);

-- 7. Automated Ingestion Agent
CREATE POLICY agent_insert_gaps ON research_gaps
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
    AND publication_status = 'DRAFT'
    AND human_review_status = 'UNREVIEWED'
);
CREATE POLICY agent_insert_protocols ON research_search_protocols
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
);

-- Explicit service role bypass
CREATE POLICY service_role_bypass_gaps ON research_gaps
USING (current_setting('role') = 'service_role');
CREATE POLICY service_role_bypass_protocols ON research_search_protocols
USING (current_setting('role') = 'service_role');

-- Trigger to enforce NOT_FOUND requires a completed protocol
CREATE OR REPLACE FUNCTION enforce_completed_protocol_for_not_found()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.gap_status = 'NOT_FOUND' THEN
        IF NEW.search_protocol_id IS NULL THEN
            RAISE EXCEPTION 'gap_status_not_found_requires_protocol: NOT_FOUND requires a search_protocol_id';
        END IF;
        
        -- Check if the protocol is completed
        IF NOT EXISTS (
            SELECT 1 FROM research_search_protocols 
            WHERE id = NEW.search_protocol_id 
            AND search_completed_at IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'gap_status_not_found_requires_completed_protocol: NOT_FOUND requires a COMPLETED search protocol';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_completed_protocol_for_not_found
BEFORE INSERT OR UPDATE ON research_gaps
FOR EACH ROW EXECUTE FUNCTION enforce_completed_protocol_for_not_found();

-------------------------------------------------------------------------------
-- GRANT TABLE-LEVEL PERMISSIONS
-------------------------------------------------------------------------------
GRANT SELECT ON research_claim_evidence_relationships TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_claim_evidence_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_claim_evidence_relationships TO service_role;

GRANT SELECT ON research_search_protocols TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_search_protocols TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_search_protocols TO service_role;

GRANT SELECT ON research_gaps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_gaps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_gaps TO service_role;
