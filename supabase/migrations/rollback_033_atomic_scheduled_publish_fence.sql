-- ==============================================================================
-- The Breakdown OS — Canonical Migration 033 Rollback Artifact
-- Applicable Migration: supabase/migrations/033_atomic_scheduled_publish_fence.sql
-- Artifact: supabase/migrations/rollback_033_atomic_scheduled_publish_fence.sql
--
-- STATUS: UNAPPLIED PRE-AUTHORIZATION ROLLBACK SCRIPT
-- Strict No-Go: Execute only with explicit authorization in an isolated or approved environment.
--
-- SAFETY INVARIANTS:
-- 1. Never use CASCADE. Every DROP must specify RESTRICT or clean non-destructive rename.
-- 2. Fail closed if target archive table or indexes pre-exist (prevent silent collision).
-- 3. Fail closed if active 'pending' or 'processing' outbox items exist (prevent work abandonment).
-- 4. Preserve 100% of outbox records in public.publication_outbox_archive if table contains rows.
-- 5. Safe drop with RESTRICT only if public.publication_outbox contains exactly 0 rows.
-- 6. Restore baseline updated_at triggers calling set_updated_at() from Migration 002.
-- 7. Restore exact publisher_worker permissions on legacy Migration 030 functions.
-- ==============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PRECONDITION CHECKS (Fail-Closed Before Any Modifications)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_active_count INT := 0;
  v_row_count INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publication_outbox') THEN
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('pending', 'processing')),
      COUNT(*)
    INTO v_active_count, v_row_count
    FROM public.publication_outbox;

    -- Precondition 1: If rows exist, ensure archive target table does not collide
    IF v_row_count > 0 THEN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publication_outbox_archive') THEN
        RAISE EXCEPTION 'ROLLBACK_UNSAFE_PRECONDITION: Archive table public.publication_outbox_archive already exists. Manual inspection required to avoid collision.';
      END IF;

      -- Ensure archive indexes do not collide
      IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname IN ('idx_publication_outbox_archive_queue', 'idx_publication_outbox_archive_story')
      ) THEN
        RAISE EXCEPTION 'ROLLBACK_UNSAFE_PRECONDITION: Archive index public.idx_publication_outbox_archive_* already exists. Manual inspection required.';
      END IF;
    END IF;

    -- Precondition 2: Fail closed if active jobs are in-flight
    IF v_active_count > 0 THEN
      RAISE EXCEPTION 'ROLLBACK_UNSAFE_PRECONDITION: publication_outbox contains % active (pending/processing) records. Drain or cancel active jobs before executing rollback.', v_active_count;
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TRIGGER RESTORATION: Restore Baseline Migration 002 Triggers
-- ═══════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
DROP TRIGGER IF EXISTS trg_editorial_schedule_updated_at ON public.editorial_schedule;

CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editorial_schedule_updated_at
  BEFORE UPDATE ON public.editorial_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. DROP MIGRATION 033 RPC FUNCTIONS (RESTRICT, Zero CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.fn_block_schedule_entry_fenced(UUID, UUID, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID, UUID) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_discover_due_schedule_entries(INT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_publication_outbox(INT, INT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_complete_publication_outbox(UUID, UUID, TEXT, TEXT) RESTRICT;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. OUTBOX RETIREMENT & DATA PRESERVATION (RESTRICT, Zero CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_row_count INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publication_outbox') THEN
    SELECT COUNT(*) INTO v_row_count FROM public.publication_outbox;

    IF v_row_count > 0 THEN
      -- Archive table to preserve 100% of outbox audit records and payloads
      ALTER TABLE public.publication_outbox RENAME TO publication_outbox_archive;
      
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_publication_outbox_queue') THEN
        ALTER INDEX public.idx_publication_outbox_queue RENAME TO idx_publication_outbox_archive_queue;
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_publication_outbox_story') THEN
        ALTER INDEX public.idx_publication_outbox_story RENAME TO idx_publication_outbox_archive_story;
      END IF;
      
      RAISE NOTICE 'Preserved % publication_outbox records into public.publication_outbox_archive.', v_row_count;
    ELSE
      -- Clean drop for empty table: strict RESTRICT, never CASCADE
      DROP TABLE public.publication_outbox RESTRICT;
      RAISE NOTICE 'Retired empty public.publication_outbox table with RESTRICT.';
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. DROP MIGRATION 033 HELPER FUNCTION (RESTRICT, Zero CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.set_updated_at_clock() RESTRICT;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RESTORE LEGACY FUNCTION GRANTS (From Migration 030)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'fn_publish_story_with_audit'
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
      GRANT EXECUTE ON FUNCTION public.fn_publish_story_with_audit(UUID) TO publisher_worker;
    END IF;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'fn_claim_due_schedule_entry'
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
      GRANT EXECUTE ON FUNCTION public.fn_claim_due_schedule_entry() TO publisher_worker;
    END IF;
  END IF;
END $$;

COMMIT;
