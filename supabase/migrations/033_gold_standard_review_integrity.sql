-- ─── Migration 033: Gold Standard Review Integrity (Article XI / CR-01..03) ───
--
-- Governing Documents:
--   - docs/editorial/editorial-constitution.md (Article XI - The 7-Phase Gold Standard Review)
--   - docs/editorial/editorial-constitution.md (Article XIII - Cryptographic Immutability)
--   - docs/editorial/newsroom-readiness/2026-10-23-constitution-to-code-gap-matrix.md (CR-01, CR-02, CR-03)
--
-- Objective:
--   Add persistent columns to public.stories for:
--   1. gold_standard_audit (jsonb): Full 7-phase audit record with auditor identity, timestamp, role, notes, and blocking issues count.
--   2. content_fingerprint (text): SHA-256 fingerprint of editorially meaningful fields binding audit signoff to exact story content.

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS gold_standard_audit jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS content_fingerprint text;

COMMENT ON COLUMN public.stories.gold_standard_audit IS '7-Phase Gold Standard Review audit record per Article XI';
COMMENT ON COLUMN public.stories.content_fingerprint IS 'SHA-256 hash of editorially meaningful fields binding audit signoff to exact story content';
