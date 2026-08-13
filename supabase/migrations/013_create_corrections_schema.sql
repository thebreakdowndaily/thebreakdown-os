-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Migration 013: Corrections & Reader Transparency
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Public Corrections Projection Table (Durable & Append-Only)
CREATE TABLE IF NOT EXISTS public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE RESTRICT,
  story_version_id UUID REFERENCES audit.story_versions(id) ON DELETE SET NULL,
  claim_id UUID REFERENCES newsroom.claims(id) ON DELETE SET NULL,
  verification_event_id UUID REFERENCES newsroom.verification_events(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('factual', 'source', 'interpretive', 'clarification', 'context_update', 'retraction')),
  previous_wording TEXT NOT NULL DEFAULT '',
  corrected_wording TEXT NOT NULL DEFAULT '',
  explanation TEXT NOT NULL,
  superseded_by_id UUID REFERENCES public.corrections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Idempotency / Uniqueness Constraint: Exactly one public correction per authoritative VerificationEvent
  CONSTRAINT uq_public_corrections_event UNIQUE (verification_event_id)
);

CREATE INDEX IF NOT EXISTS idx_public_corrections_story_id ON public.corrections(story_id);
CREATE INDEX IF NOT EXISTS idx_public_corrections_created_at ON public.corrections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_corrections_claim_id ON public.corrections(claim_id);

-- 2. Reader Corrections Submission Queue (Durable Input Queue)
CREATE TABLE IF NOT EXISTS public.reader_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  story_slug TEXT NOT NULL,
  claim_id UUID REFERENCES newsroom.claims(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'factual',
  passage_excerpt TEXT NOT NULL,
  suggested_correction TEXT NOT NULL,
  submitter_email TEXT, -- Private (never exposed to public API)
  supporting_evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'triaged', 'in_review', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reader_corrections_story_slug ON public.reader_corrections(story_slug);
CREATE INDEX IF NOT EXISTS idx_reader_corrections_status ON public.reader_corrections(status);
CREATE INDEX IF NOT EXISTS idx_reader_corrections_created_at ON public.reader_corrections(created_at DESC);

-- Keep updated_at semantics consistent with the public-schema convention
-- established by migration 002 (set_updated_at is defined there).
CREATE TRIGGER trg_corrections_updated_at
BEFORE UPDATE ON public.corrections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reader_corrections_updated_at
BEFORE UPDATE ON public.reader_corrections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS — W3/W4 Forensic Audit (docs/audits/w3w4-forensic-audit-20260813.md)
--
-- public.corrections is the durable, append-only PUBLIC transparency
-- projection: the Corrections Policy (AGENTS.md) mandates that every issued
-- correction is published publicly, so the full table is readable by the anon
-- role. Write access is restricted to internal roles; deletion is impossible
-- (no DELETE policy), preserving the correction history.
--
-- public.reader_corrections is a PRIVATE submission queue. Any reader (anon
-- or authenticated) may file a correction, but the WITH CHECK below enforces a
-- real constraint — submissions must enter in the initial 'received' state
-- with non-empty content — rather than a bare permissive predicate. submitter
-- email, supporting evidence, and triage status are only visible to internal
-- roles; there is no anon SELECT policy.
-- ═══════════════════════════════════════════════════════════════════════════

-- public.corrections: public read, internal write, no delete.
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_corrections ON public.corrections
FOR SELECT USING (true);

CREATE POLICY internal_insert_corrections ON public.corrections
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_corrections ON public.corrections
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);

-- public.reader_corrections: open submission, internal read/triage, no delete.
ALTER TABLE public.reader_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY reader_insert_corrections ON public.reader_corrections
FOR INSERT WITH CHECK (
    status = 'received'
    AND passage_excerpt <> ''
    AND suggested_correction <> ''
);

CREATE POLICY internal_read_reader_corrections ON public.reader_corrections
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
CREATE POLICY internal_update_reader_corrections ON public.reader_corrections
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
