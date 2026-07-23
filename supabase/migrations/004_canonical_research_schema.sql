-- Canonical Research Schema (Migration 004)
-- Enforces Bitemporal mechanics, Polymorphic exact-1 Claim relations, 
-- and RLS boundaries for Step 3B Pilot.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-------------------------------------------------------------------------------
-- ENUMS
-------------------------------------------------------------------------------
CREATE TYPE publication_status_type AS ENUM ('DRAFT', 'READY_FOR_PUBLICATION', 'PUBLISHED', 'ARCHIVED', 'WITHDRAWN');
CREATE TYPE human_review_status_type AS ENUM ('UNREVIEWED', 'IN_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE value_availability_status_type AS ENUM ('KNOWN', 'UNKNOWN', 'NOT_FOUND', 'WITHHELD', 'NOT_REPORTED', 'NOT_APPLICABLE');
CREATE TYPE affiliation_type_enum AS ENUM ('FORMAL_MEMBERSHIP', 'LEGISLATIVE_PARTY', 'ELECTORAL_ALLIANCE', 'POLITICAL_SUPPORT');
CREATE TYPE affiliation_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPELLED', 'RESIGNED', 'DISPUTED');
CREATE TYPE claim_scope_type AS ENUM ('PRIMARY_SUBJECT', 'RELATED_ENTITY', 'GEOGRAPHIC_SCOPE');
CREATE TYPE research_confidence_type AS ENUM ('C5', 'C4', 'C3', 'C2', 'C1', 'C0');
CREATE TYPE financial_stage_type AS ENUM ('ANNOUNCEMENT', 'BUDGET_PROVISION', 'ADMIN_APPROVAL', 'FINANCIAL_SANCTION', 'FUNDS_RELEASED', 'TENDER_VALUE', 'CONTRACT_AWARD', 'PAYMENT', 'REPORTED_EXPENDITURE', 'UTILIZATION_REPORTED', 'FINAL_COST');
CREATE TYPE correction_type_enum AS ENUM ('EDITORIAL_WITHDRAWAL', 'EVIDENTIARY_CORRECTION', 'FALSE_CLAIM_RETRACTION', 'DATA_ENTRY_FIX');

-------------------------------------------------------------------------------
-- CORE ENTITIES
-------------------------------------------------------------------------------
CREATE TABLE research_constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(20) UNIQUE NOT NULL CHECK (canonical_id ~ '^UP-AC-[0-9]{3}$'),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

CREATE TABLE research_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(50) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

CREATE TABLE research_political_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(50) UNIQUE NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

CREATE TABLE research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

-------------------------------------------------------------------------------
-- BITEMPORAL RELATIONSHIPS
-------------------------------------------------------------------------------
CREATE TABLE research_party_affiliation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES research_persons(id),
    party_id UUID NOT NULL REFERENCES research_political_parties(id),
    affiliation_type affiliation_type_enum NOT NULL,
    affiliation_status affiliation_status_enum NOT NULL,
    
    -- Interval: [valid_from, valid_to)
    valid_from DATE NOT NULL,
    valid_to DATE CHECK (valid_from < valid_to),
    
    -- System Time: [system_from, system_to)
    system_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    system_to TIMESTAMPTZ CHECK (system_from < system_to),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

-- Bitemporal overlap prohibition for exclusive affiliation types
ALTER TABLE research_party_affiliation_history ADD CONSTRAINT no_overlapping_formal_memberships
EXCLUDE USING gist (
    person_id WITH =,
    daterange(valid_from, COALESCE(valid_to, 'infinity'::DATE), '[)') WITH &&
)
WHERE (system_to IS NULL AND affiliation_type IN ('FORMAL_MEMBERSHIP', 'LEGISLATIVE_PARTY'));

-------------------------------------------------------------------------------
-- FINANCE
-------------------------------------------------------------------------------
CREATE TABLE research_financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES research_projects(id),
    stage financial_stage_type NOT NULL,
    
    amount_status value_availability_status_type NOT NULL,
    amount_value NUMERIC(15, 2) CHECK (
        (amount_status = 'KNOWN' AND amount_value IS NOT NULL AND amount_value >= 0) OR
        (amount_status != 'KNOWN' AND amount_value IS NULL)
    ),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    is_cumulative BOOLEAN NOT NULL DEFAULT false,
    
    valid_from DATE NOT NULL,
    valid_to DATE CHECK (valid_from < valid_to),
    system_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    system_to TIMESTAMPTZ CHECK (system_from < system_to),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

-------------------------------------------------------------------------------
-- EVIDENCE & CLAIMS
-------------------------------------------------------------------------------
CREATE TABLE research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

CREATE TABLE research_evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES research_sources(id),
    extracted_text TEXT NOT NULL,
    
    human_review_status human_review_status_type NOT NULL DEFAULT 'UNREVIEWED',
    reviewed_at TIMESTAMPTZ,
    reviewed_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

CREATE TABLE research_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(100) UNIQUE NOT NULL,
    statement TEXT NOT NULL,
    confidence research_confidence_type NOT NULL,
    
    human_review_status human_review_status_type NOT NULL DEFAULT 'UNREVIEWED',
    
    publication_status publication_status_type NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ CHECK (
        (publication_status IN ('PUBLISHED', 'ARCHIVED', 'WITHDRAWN') AND published_at IS NOT NULL) OR
        (publication_status IN ('DRAFT', 'READY_FOR_PUBLICATION') AND published_at IS NULL)
    ),
    archived_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

-- Publication invariant (Must be APPROVED to be PUBLISHED)
ALTER TABLE research_claims ADD CONSTRAINT claim_publish_requires_approval 
CHECK (publication_status != 'PUBLISHED' OR human_review_status = 'APPROVED');

-------------------------------------------------------------------------------
-- POLYMORPHIC CLAIM SUBJECT JUNCTION (Option B)
-------------------------------------------------------------------------------
CREATE TABLE research_claim_subject_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES research_claims(id),
    
    person_id UUID REFERENCES research_persons(id),
    party_id UUID REFERENCES research_political_parties(id),
    constituency_id UUID REFERENCES research_constituencies(id),
    project_id UUID REFERENCES research_projects(id),
    financial_record_id UUID REFERENCES research_financial_records(id),

    scope claim_scope_type NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

ALTER TABLE research_claim_subject_relationships ADD CONSTRAINT exactly_one_target CHECK (
    (
        (person_id IS NOT NULL)::INTEGER +
        (party_id IS NOT NULL)::INTEGER +
        (constituency_id IS NOT NULL)::INTEGER +
        (project_id IS NOT NULL)::INTEGER +
        (financial_record_id IS NOT NULL)::INTEGER
    ) = 1
);

-------------------------------------------------------------------------------
-- AUDITABLE EDITORIAL CORRECTIONS
-------------------------------------------------------------------------------
CREATE TABLE research_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correction_type correction_type_enum NOT NULL,
    rationale TEXT NOT NULL,
    
    -- Option B Typed Nullable FKs for the superseded record
    previous_claim_id UUID REFERENCES research_claims(id),
    previous_financial_id UUID REFERENCES research_financial_records(id),
    previous_affiliation_id UUID REFERENCES research_party_affiliation_history(id),

    -- Option B Typed Nullable FKs for the successor record (if any)
    successor_claim_id UUID REFERENCES research_claims(id),
    successor_financial_id UUID REFERENCES research_financial_records(id),
    successor_affiliation_id UUID REFERENCES research_party_affiliation_history(id),
    
    authorized_by_user_id UUID NOT NULL,
    methodology_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ingestion_method VARCHAR(50) NOT NULL,

    -- Enforce that exactly one "previous" target is specified
    CONSTRAINT exactly_one_previous_target CHECK (
        (previous_claim_id IS NOT NULL)::INTEGER +
        (previous_financial_id IS NOT NULL)::INTEGER +
        (previous_affiliation_id IS NOT NULL)::INTEGER = 1
    ),
    -- Ensure the successor matches the type of the previous if present
    CONSTRAINT successor_type_match CHECK (
        (successor_claim_id IS NULL OR previous_claim_id IS NOT NULL) AND
        (successor_financial_id IS NULL OR previous_financial_id IS NOT NULL) AND
        (successor_affiliation_id IS NULL OR previous_affiliation_id IS NOT NULL)
    )
);

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-------------------------------------------------------------------------------
ALTER TABLE research_party_affiliation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_claims ENABLE ROW LEVEL SECURITY;

-- 1. Hard Deletes Prevented (No roles have DELETE access natively unless superuser bypass)

-- 2. Public Read (Published claims only)
CREATE POLICY public_read_published_claims ON research_claims
FOR SELECT USING (publication_status = 'PUBLISHED');

CREATE POLICY public_read_active_history ON research_party_affiliation_history
FOR SELECT USING (system_to IS NULL);

-- 2b. Internal Read (All roles can read everything to perform their work)
CREATE POLICY internal_read_claims ON research_claims
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

CREATE POLICY internal_read_history ON research_party_affiliation_history
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

CREATE POLICY internal_read_finance ON research_financial_records
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

-- 3. Researchers (Can INSERT, and UPDATE only DRAFT/UNREVIEWED)
CREATE POLICY researcher_insert_claims ON research_claims
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
);
CREATE POLICY researcher_update_claims ON research_claims
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
    AND human_review_status = 'UNREVIEWED'
);

-- 4. Reviewers (Can UPDATE human_review_status, cannot PUBLISH)
CREATE POLICY reviewer_update_claims ON research_claims
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'reviewer'
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'reviewer'
    AND publication_status NOT IN ('PUBLISHED')
);

-- 5. Editors (Can PUBLISH and close bitemporal history)
CREATE POLICY editor_publish_claims ON research_claims
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'editor'
);

CREATE POLICY editor_close_history ON research_party_affiliation_history
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'editor'
);

-- 6. Admins (Can ARCHIVE)
CREATE POLICY admin_update_claims ON research_claims
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'administrator'
);

-- 7. Automated Ingestion Agent (Can INSERT only, status locked to DRAFT/UNREVIEWED)
CREATE POLICY agent_insert_claims ON research_claims
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
    AND publication_status = 'DRAFT'
    AND human_review_status = 'UNREVIEWED'
);
