-- ─── Migration 025: Evidence Preservation Vault (Phase 4B-2B) ──────────────────
--
-- Governing Documents:
--   - AGENTS.md (Verification & Idempotency, Knowledge First)
--   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
--   - .planning/PHASE-4B-2A-EVIDENCE-PRESERVATION-DESIGN.md
--
-- Objective:
--   Provide immutable relational metadata and content-addressed storage linkage
--   for raw upstream source artifacts. Ensures published claims can be independently
--   reconstructed even if the upstream source is deleted or modified.
--
-- Target Schema: newsroom, storage

-- 1. Ensure newsroom schema exists
CREATE SCHEMA IF NOT EXISTS newsroom;

-- 2. Create newsroom.archived_artifacts
CREATE TABLE IF NOT EXISTS newsroom.archived_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  source_revision_id TEXT,
  observation_id TEXT,
  raw_sha256 TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_length INTEGER NOT NULL,
  retrieval_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_url TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'evidence-vault',
  storage_path TEXT NOT NULL,
  preservation_state TEXT NOT NULL DEFAULT 'preserved', -- 'staged', 'preserved', 'failed'
  retention_state TEXT NOT NULL DEFAULT 'staged',       -- 'staged', 'verified', 'locked'
  raw_payload BYTEA,                                  -- Relational byte copy for atomic offline durability
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_archived_artifacts_raw_sha256 UNIQUE (raw_sha256),
  CONSTRAINT chk_byte_length_positive CHECK (byte_length >= 0)
);

-- 3. Indexes for fast provenance traversal and deduplication lookups
CREATE INDEX IF NOT EXISTS idx_archived_artifacts_content_hash 
  ON newsroom.archived_artifacts (content_hash);
CREATE INDEX IF NOT EXISTS idx_archived_artifacts_source_id 
  ON newsroom.archived_artifacts (source_id);
CREATE INDEX IF NOT EXISTS idx_archived_artifacts_observation_id 
  ON newsroom.archived_artifacts (observation_id);
CREATE INDEX IF NOT EXISTS idx_archived_artifacts_retention_state 
  ON newsroom.archived_artifacts (retention_state);

-- 4. Foreign Key Linkage: newsroom.observations -> newsroom.archived_artifacts
-- Uses ON DELETE RESTRICT to guarantee historical evidence cannot be silently deleted
ALTER TABLE newsroom.observations 
  ADD COLUMN IF NOT EXISTS archive_id UUID 
  REFERENCES newsroom.archived_artifacts(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_observations_archive_id 
  ON newsroom.observations (archive_id);

-- 5. Foreign Key Linkage: newsroom.claim_evidence -> newsroom.archived_artifacts
ALTER TABLE newsroom.claim_evidence 
  ADD COLUMN IF NOT EXISTS archive_id UUID 
  REFERENCES newsroom.archived_artifacts(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_claim_evidence_archive_id 
  ON newsroom.claim_evidence (archive_id);

-- 6. Row-Level Security on newsroom.archived_artifacts
ALTER TABLE newsroom.archived_artifacts ENABLE ROW LEVEL SECURITY;

-- Deny all public access by default (fail-closed)
DROP POLICY IF EXISTS deny_public_archived_artifacts ON newsroom.archived_artifacts;
CREATE POLICY deny_public_archived_artifacts ON newsroom.archived_artifacts
  FOR ALL
  TO anon, authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'editor', 'admin'),
      false
    )
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'editor', 'admin'),
      false
    )
  );

-- 7. Ensure private storage bucket 'evidence-vault' exists in storage.buckets
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'evidence-vault',
  'evidence-vault',
  false,
  15728640, -- 15MB maximum per raw artifact
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage bucket RLS: Deny public/anon read or write to evidence-vault
-- Storage objects table has RLS enabled by Supabase.
-- Add private bucket policy for evidence-vault to enforce server-role / privileged research access only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'evidence_vault_privileged_access'
  ) THEN
    CREATE POLICY evidence_vault_privileged_access ON storage.objects
      FOR ALL
      TO authenticated
      USING (
        bucket_id = 'evidence-vault' AND
        COALESCE((auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'editor', 'admin'), false)
      )
      WITH CHECK (
        bucket_id = 'evidence-vault' AND
        COALESCE((auth.jwt() -> 'app_metadata' ->> 'research_role') IN ('researcher', 'editor', 'admin'), false)
      );
  END IF;
END $$;
