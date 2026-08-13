-- Migration 010: Investigation Workspace Schemas
-- Governance: Level 5 Implementation

CREATE TABLE IF NOT EXISTS workspace_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Archived', 'Completed'
  priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES workspace_cases(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'candidate', 'constituency', 'project', 'document'
  source_id TEXT,
  confidence_rating TEXT DEFAULT 'C5',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES workspace_cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  citations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES workspace_cases(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'election', 'court', 'media', 'project'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES workspace_cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Todo', -- 'Todo', 'In Progress', 'Blocked', 'Done'
  evidence_links TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES workspace_cases(id) ON DELETE CASCADE,
  format TEXT NOT NULL, -- 'csv', 'json', 'pdf', 'zip'
  file_url TEXT NOT NULL,
  checksum TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Keep updated_at semantics consistent with the public-schema convention
-- established by migration 002 (set_updated_at is defined there).
CREATE TRIGGER trg_workspace_cases_updated_at
BEFORE UPDATE ON workspace_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workspace_notes_updated_at
BEFORE UPDATE ON workspace_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workspace_tasks_updated_at
BEFORE UPDATE ON workspace_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS — W3/W4 Forensic Audit (docs/audits/w3w4-forensic-audit-20260813.md)
-- The Investigation Workspace holds private case content (notes, evidence,
-- exports). Access is scoped to the case owner (auth.uid()) OR to any
-- internal research role carried in the JWT app_metadata. No anon/public
-- policy. Child tables are scoped through their case's owning policy via an
-- EXISTS subquery, which the case-level RLS naturally enforces.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE workspace_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_all_cases ON workspace_cases
FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY internal_all_cases ON workspace_cases
FOR ALL USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

ALTER TABLE workspace_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_cases_evidence ON workspace_evidence
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_evidence.case_id AND c.owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_evidence.case_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY internal_cases_evidence ON workspace_evidence
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_evidence.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_evidence.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
);

ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_cases_notes ON workspace_notes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_notes.case_id AND c.owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_notes.case_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY internal_cases_notes ON workspace_notes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_notes.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_notes.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
);

ALTER TABLE workspace_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_cases_timeline_events ON workspace_timeline_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_timeline_events.case_id AND c.owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_timeline_events.case_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY internal_cases_timeline_events ON workspace_timeline_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_timeline_events.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_timeline_events.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
);

ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_cases_tasks ON workspace_tasks
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_tasks.case_id AND c.owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_tasks.case_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY internal_cases_tasks ON workspace_tasks
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_tasks.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_tasks.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
);

ALTER TABLE workspace_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_cases_exports ON workspace_exports
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_exports.case_id AND c.owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_exports.case_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY internal_cases_exports ON workspace_exports
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_exports.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_cases c
        WHERE c.id = workspace_exports.case_id
          AND (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
              IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
    )
);
