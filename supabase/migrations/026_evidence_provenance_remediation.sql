-- ─── Migration 026: Evidence Provenance Remediation (Phase 4B-2E) ────────────────
--
-- Governing Documents:
--   - AGENTS.md (Verification & Idempotency, Knowledge First)
--   - docs/editorial/editorial-constitution.md (Article III - Evidence Hierarchy)
--   - .planning/PHASE-4B-2D-EVIDENCE-PROVENANCE-REMEDIATION-DESIGN.md
--   - .planning/PHASE-4B-2C-EVIDENCE-VAULT-FORENSIC-VALIDATION.md
--
-- Objectives:
--   1. Authoritative blob storage cutover: Drop deprecated raw_payload BYTEA column
--      from newsroom.archived_artifacts. All raw bytes live in Supabase Storage.
--   2. Add immutability trigger preventing modification of cryptographic identity fields
--      (raw_sha256, content_hash, byte_length, storage_bucket, storage_path, source_id).
--   3. Add archival_state to newsroom.observations to support fail-safe radar ingestion
--      with fail-closed verification/publication gates.
--   4. Add is_legacy to newsroom.claims to grandfather pre-vault claims.
--   5. Add lifecycle state constraints for retention_state and preservation_state.
--
-- Target Schema: newsroom, storage

-- 1. Drop deprecated raw_payload BYTEA column from newsroom.archived_artifacts
-- APPROVED_DESTRUCTIVE: ARCH-026 Remove deprecated raw_payload in favor of storage pointer
ALTER TABLE newsroom.archived_artifacts 
  DROP COLUMN IF EXISTS raw_payload;

-- 2. Lifecycle constraints on newsroom.archived_artifacts
ALTER TABLE newsroom.archived_artifacts 
  DROP CONSTRAINT IF EXISTS chk_archived_artifacts_retention_state;

ALTER TABLE newsroom.archived_artifacts 
  ADD CONSTRAINT chk_archived_artifacts_retention_state 
  CHECK (retention_state IN ('staged', 'verified', 'locked', 'corrupted', 'missing', 'archive_failed'));

ALTER TABLE newsroom.archived_artifacts 
  DROP CONSTRAINT IF EXISTS chk_archived_artifacts_preservation_state;

ALTER TABLE newsroom.archived_artifacts 
  ADD CONSTRAINT chk_archived_artifacts_preservation_state 
  CHECK (preservation_state IN ('staged', 'preserved', 'failed', 'corrupted', 'missing'));

-- 3. Immutability trigger for cryptographic and locator fields on newsroom.archived_artifacts
CREATE OR REPLACE FUNCTION newsroom.prevent_archived_artifact_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.raw_sha256 <> OLD.raw_sha256 THEN
    RAISE EXCEPTION 'Cryptographic identity raw_sha256 is strictly immutable.'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.content_hash <> OLD.content_hash THEN
    RAISE EXCEPTION 'Cryptographic content_hash is strictly immutable.'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.byte_length <> OLD.byte_length THEN
    RAISE EXCEPTION 'byte_length is strictly immutable.'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.storage_bucket <> OLD.storage_bucket OR NEW.storage_path <> OLD.storage_path THEN
    RAISE EXCEPTION 'Storage locator (storage_bucket, storage_path) is strictly immutable.'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.source_id <> OLD.source_id THEN
    RAISE EXCEPTION 'source_id is strictly immutable.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_archived_artifact_mutation ON newsroom.archived_artifacts;
CREATE TRIGGER trg_prevent_archived_artifact_mutation
  BEFORE UPDATE ON newsroom.archived_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION newsroom.prevent_archived_artifact_mutation();

-- 4. Add archival_state to newsroom.observations
ALTER TABLE newsroom.observations 
  ADD COLUMN IF NOT EXISTS archival_state TEXT NOT NULL DEFAULT 'staged';

ALTER TABLE newsroom.observations 
  DROP CONSTRAINT IF EXISTS chk_observations_archival_state;

ALTER TABLE newsroom.observations 
  ADD CONSTRAINT chk_observations_archival_state 
  CHECK (archival_state IN ('pending', 'staged', 'archive_failed', 'corrupted'));

CREATE INDEX IF NOT EXISTS idx_observations_archival_state 
  ON newsroom.observations (archival_state);

-- 5. Add is_legacy to newsroom.claims
ALTER TABLE newsroom.claims 
  ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_claims_is_legacy 
  ON newsroom.claims (is_legacy);
