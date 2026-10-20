# Phase 51.7 — Migration 033 Rollback Plan & Operational Runbook

**Document ID:** `DOC-P51.7-MIG033-ROLLBACK`  
**Applicable Migration:** `supabase/migrations/033_atomic_scheduled_publish_fence.sql`  
**Target Repository:** `thebreakdowndaily/thebreakdown-os`  
**Candidate Branch:** `candidate/scheduled-publish-clean-history-2026-10-18` (PR #93)  
**Verification Suite:** `tests/security/database-enforcement.test.ts` (Section 12)  
**Safety Status:** STRICT NO-GO. Pre-authorization only. Do NOT execute on live environments without explicit executive and editorial signoff.

---

## 1. Architectural Strategy & Operational Separation

The Breakdown OS distinguishes three separate operational layers during any rollback event. These layers must never be conflated:

1. **Layer 1: Behavioral Deactivation (Zero DDL, Zero Downtime)**
   - Disable the publication-fence feature flag in application configuration (`NEXT_PUBLIC_ENABLE_SCHEDULED_PUBLISH_FENCE=false` or runtime environment configuration).
   - When disabled, application runners instantly bypass `fn_publish_story_fenced` and `fn_claim_schedule_entry_fenced`, reverting application traffic to legacy publication mechanisms (`fn_claim_due_schedule_entry` and `fn_publish_story_with_audit`).
   - Requires zero database mutations, avoids transactional lock contention, and leaves the schema, triggers, and all outbox data completely untouched and queryable.

2. **Layer 2: Data-Preserving Schema Rollback with Outbox Archival (Default Rollback Path)**
   - If Migration 033 DDL must be reversed after being active and processing stories, all records in `public.publication_outbox` (pending, processing, completed, and failed) **MUST BE PRESERVED**.
   - Fails closed if active `pending` or `processing` rows exist, requiring workers to drain or abort prior to schema changes.
   - Renames `public.publication_outbox` to `public.publication_outbox_archive` without dropping table or records.
   - Reverts triggers `trg_stories_updated_at` and `trg_editorial_schedule_updated_at` to call baseline `public.set_updated_at()`.
   - Drops Migration 033 functions using `RESTRICT` (never `CASCADE`).
   - Restores exact legacy permissions for `publisher_worker` on `fn_claim_due_schedule_entry()` and `fn_publish_story_with_audit(UUID)`.

3. **Layer 3: Safe Empty Table Drop Rollback (Clean Environment Rollback)**
   - Used only when Migration 033 is rolled back immediately after application where `publication_outbox` contains exactly 0 records.
   - Drops `public.publication_outbox` with `RESTRICT` (never `CASCADE`). If any rows or external dependencies exist, the drop fails closed immediately.

---

## 2. Tested Rollback DDL: Data-Preserving Archive Path (Layer 2)

The following DDL is verified in Section 12 of `tests/security/database-enforcement.test.ts`:

```sql
BEGIN;

-- ============================================================================
-- 1. PRECONDITION & ACTIVE WORKER SAFETY CHECK
-- Fail closed if active pending or processing records exist to prevent data loss
-- ============================================================================
DO $$
DECLARE
  v_active_count INT := 0;
  v_total_count INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publication_outbox') THEN
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('pending', 'processing')),
      COUNT(*)
    INTO v_active_count, v_total_count
    FROM public.publication_outbox;

    IF v_active_count > 0 THEN
      RAISE EXCEPTION 'ROLLBACK_UNSAFE_PRECONDITION: publication_outbox contains % active (pending/processing) records. Drain or cancel active jobs before schema reversal.', v_active_count;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. DROP MIGRATION 033 TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
DROP TRIGGER IF EXISTS trg_editorial_schedule_updated_at ON public.editorial_schedule;

-- ============================================================================
-- 3. RESTORE BASELINE TRIGGERS FROM MIGRATION 002
-- Original names: trg_<table>_updated_at, calling set_updated_at() which uses now()
-- ============================================================================
CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editorial_schedule_updated_at
  BEFORE UPDATE ON public.editorial_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. DROP MIGRATION 033 STORED PROCEDURES & RPC FUNCTIONS (RESTRICT, no CASCADE)
-- ============================================================================
DROP FUNCTION IF EXISTS public.fn_block_schedule_entry_fenced(UUID, UUID, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID, UUID) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_discover_due_schedule_entries(INT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_claim_publication_outbox(INT, INT) RESTRICT;
DROP FUNCTION IF EXISTS public.fn_complete_publication_outbox(UUID, UUID, TEXT, TEXT) RESTRICT;

-- ============================================================================
-- 5. PRESERVE & ARCHIVE OUTBOX DATA (NO CASCADE, ZERO DATA LOSS)
-- ============================================================================
DO $$
DECLARE
  v_row_count INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publication_outbox') THEN
    SELECT COUNT(*) INTO v_row_count FROM public.publication_outbox;

    IF v_row_count > 0 THEN
      -- Archive the active table and its queue index to preserve audit trail
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
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 6. DROP MIGRATION 033 HELPER FUNCTION (RESTRICT, no CASCADE)
-- ============================================================================
DROP FUNCTION IF EXISTS public.set_updated_at_clock() RESTRICT;

-- ============================================================================
-- 7. RESTORE LEGACY FUNCTION GRANTS (revoked by Migration 033 lines 886-917)
-- ============================================================================
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
```

---

## 3. Operational Step-by-Step Runbook

### Step 3.1: Pre-Execution Triage & Drain
1. **Pause Workers:**
   Pause background publisher runners and cron jobs:
   ```bash
   kubectl scale deployment publisher-worker --replicas=0
   ```
2. **Inspect Outbox Status:**
   ```sql
   SELECT status, count(*) 
   FROM public.publication_outbox 
   GROUP BY status;
   ```
3. **Handle Active Items:**
   - If rows are in `processing`, wait up to 30 seconds for workers to complete.
   - If rows remain in `pending`, decide whether to let workers drain them or transition them to terminal status (`failed`) before executing schema rollback.
   - The rollback script strictly enforces this: it **refuses** to proceed if any `pending` or `processing` rows exist.

### Step 3.2: Execution
Execute the transactional rollback script as a superuser or schema owner:
```bash
psql "$SUPABASE_DB_URL" -f rollback_migration_033.sql
```

### Step 3.3: Post-Rollback Verification Assertions
Run these queries immediately following execution:

1. **Verify outbox table is archived (data preserved) or cleanly dropped:**
   ```sql
   SELECT to_regclass('public.publication_outbox') AS active_outbox,
          to_regclass('public.publication_outbox_archive') AS archived_outbox;
   -- Expected: active_outbox = NULL; archived_outbox != NULL if records were preserved.
   ```

2. **Verify archived records match pre-rollback counts:**
   ```sql
   SELECT status, count(*) 
   FROM public.publication_outbox_archive 
   GROUP BY status;
   ```

3. **Verify all 033 RPC functions are removed:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
     AND routine_name IN (
       'fn_publish_story_fenced',
       'fn_block_schedule_entry_fenced',
       'fn_claim_schedule_entry_fenced',
       'fn_discover_due_schedule_entries',
       'fn_claim_publication_outbox',
       'fn_complete_publication_outbox',
       'set_updated_at_clock'
     );
   -- Expected: 0 rows returned
   ```

4. **Verify baseline triggers restored and active:**
   ```sql
   SELECT t.tgname, p.proname as func_name
   FROM pg_trigger t
   JOIN pg_proc p ON t.tgfoid = p.oid
   JOIN pg_class c ON t.tgrelid = c.oid
   JOIN pg_namespace n ON c.relnamespace = n.oid
   WHERE n.nspname = 'public' AND c.relname IN ('stories', 'editorial_schedule')
     AND t.tgname LIKE 'trg_%_updated_at'
     AND NOT t.tgisinternal;
   -- Expected: 2 rows with func_name = 'set_updated_at'
   ```

5. **Verify publisher_worker permissions restored on legacy functions:**
   ```sql
   SELECT routine_name, grantee, privilege_type
   FROM information_schema.routine_privileges
   WHERE routine_schema = 'public'
     AND routine_name IN ('fn_publish_story_with_audit', 'fn_claim_due_schedule_entry')
     AND grantee = 'publisher_worker';
   -- Expected: EXECUTE privilege granted on both routines.
   ```

---

## 4. Verification Evidence & Automated Testing

This rollback plan is directly exercised in `tests/security/database-enforcement.test.ts` (Section 12):
- Seeds representative outbox rows (`pending`, `processing`, `completed`, `failed`).
- Asserts that rollback fails closed if active `pending`/`processing` rows are present when unsafe drop is attempted.
- Asserts that Migration 033 fails closed if conflicting legacy function signatures pre-exist.
- Executes real schema rollback DDL outside of an ephemeral rollback transaction.
- Proves 100% preservation of all seeded outbox rows in `publication_outbox_archive`.
- Proves baseline trigger recreation and functional `updated_at` advancement.
- Proves complete elimination of `CASCADE` and absence of orphaned objects.
