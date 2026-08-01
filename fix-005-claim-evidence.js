const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\supabase\\migrations\\005_research_gap_schema.sql';
let c = fs.readFileSync(p, 'utf8');

const claimEvidence = `
-------------------------------------------------------------------------------
-- CLAIM -> EVIDENCE RELATIONSHIP
-------------------------------------------------------------------------------
CREATE TABLE research_claim_evidence_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES research_claims(id),
    evidence_id UUID NOT NULL REFERENCES research_evidence_items(id),
    
    -- Optional context on why this evidence supports/challenges the claim
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'SUPPORTS',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    ingestion_method VARCHAR(50) NOT NULL
);

ALTER TABLE research_claim_evidence_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_claim_evidence ON research_claim_evidence_relationships
FOR SELECT USING (
    EXISTS (SELECT 1 FROM research_claims WHERE id = claim_id AND publication_status = 'PUBLISHED')
);

CREATE POLICY internal_read_claim_evidence ON research_claim_evidence_relationships
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

CREATE POLICY researcher_insert_claim_evidence ON research_claim_evidence_relationships
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
);

CREATE POLICY agent_insert_claim_evidence ON research_claim_evidence_relationships
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
);
`;

c = c + claimEvidence;
fs.writeFileSync(p, c);
console.log("Added claim evidence relationship to 005 schema");
