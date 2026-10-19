# Phase 51.3 — Migration 033 Rollback Plan & Operational Runbook

**Document ID:** `DOC-P51.3-MIG033-ROLLBACK`  
**Applicable Migration:** `supabase/migrations/033_atomic_scheduled_publish_fence.sql`  
**Target Repository:** `thebreakdowndaily/thebreakdown-os`  
**Candidate Branch:** `candidate/scheduled-publish-clean-history-2026-10-18` (PR #93)  
**Verification Suite:** `tests/security/database-enforcement.test.ts` (Section 12)  
**Safety Status:** STRICT NO-GO. Pre-authorization only. Do NOT execute on live environments without explicit executive and editorial signoff.

---

## 1. Overview and Pre-flight Conditions

Migration 033 introduces the atomic publication fence, database-authoritative lease claiming, atomic publication and blocking functions, and transactional `publication_outbox` queue.

If Migration 033 must be rolled back due to an unforeseen defect or operational emergency during staged deployment:
1. **Worker Pre-emption:** Publisher workers (cron jobs and background runners executing `validateAndPublishDueStories` or `processPendingPublicationOutbox`) must be paused or stopped immediately before executing this rollback.
2. **Transaction Isolation:** The entire rollback must be executed within a single transactional block (`BEGIN ... COMMIT`).
3. **Trigger Restoration:** Dropping the atomic fence triggers (`trg_stories_updated_at` and `trg_editorial_schedule_updated_at`, which Migration 033 replaced to call `set_updated_at_clock()`) leaves the tables without automatic `updated_at` timestamp updates unless the original triggers from Migration 002 (same names `trg_stories_updated_at` and `trg_editorial_schedule_updated_at`, but calling the original `set_updated_at()` function which uses `now()`) are restored. This rollback explicitly restores those baseline triggers and drops the `set_updated_at_clock()` helper introduced by Migration 033.

---

## 2. Tested Rollback DDL

The following DDL has been adversarially verified against live PostgreSQL instances in Section 12 of `tests/security/database-enforcement.test.ts`:

```sql
BEGIN;

-- ============================================================================
-- 1. DROP MIGRATION 033 TRIGGERS (same names as originals, but calling set_updated_at_clock())
-- ============================================================================
DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
DROP TRIGGER IF EXISTS trg_editorial_schedule_updated_at ON public.editorial_schedule;

-- ============================================================================
-- 2. RESTORE BASELINE TRIGGERS FROM MIGRATION 002
-- Original names: trg_<table>_updated_at, calling set_updated_at() which uses now()
-- ============================================================================
CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editorial_schedule_updated_at
  BEFORE UPDATE ON public.editorial_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. DROP MIGRATION 033 STORED PROCEDURES & RPC FUNCTIONS (exact signatures)
-- ============================================================================
DROP FUNCTION IF EXISTS public.fn_block_schedule_entry_fenced(UUID, UUID, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID, UUID);
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID);
DROP FUNCTION IF EXISTS public.fn_discover_due_schedule_entries(INT);
DROP FUNCTION IF EXISTS public.fn_claim_publication_outbox(INT, INT);
DROP FUNCTION IF EXISTS public.fn_complete_publication_outbox(UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.fn_complete_publication_outbox(UUID, TEXT, TEXT);

-- ============================================================================
-- 4. DROP MIGRATION 033 OUTBOX TABLE (uses CHECK constraint, not enum type)
-- ============================================================================
DROP TABLE IF EXISTS public.publication_outbox CASCADE;

-- ============================================================================
-- 5. DROP MIGRATION 033 HELPER FUNCTION
-- ============================================================================
DROP FUNCTION IF EXISTS public.set_updated_at_clock();

-- ============================================================================
-- 6. RESTORE LEGACY FUNCTION GRANTS (revoked by Migration 033 lines 886-917)
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

### Step 3.1: Pre-Execution Drain & Triage
1. Pause publisher cron triggers:
   ```bash
   # If running via Kubernetes / CronJob / Systemd:
   kubectl scale deployment publisher-worker --replicas=0
   ```
2. Inspect pending outbox entries to ensure no inflight transactional mutations are abandoned:
   ```sql
   SELECT count(*), status FROM public.publication_outbox GROUP BY status;
   ```
   If entries are in `processing`, wait up to 30 seconds for current handlers to complete.

### Step 3.2: Execution
Run the tested DDL within `psql` or the Supabase SQL Editor as a superuser or migration role.
```bash
psql "$SUPABASE_DB_URL" -f rollback_migration_033.sql
```

### Step 3.3: Post-Rollback Verification Queries
Run these verification assertions immediately after execution:

1. **Verify outbox table is dropped:**
   ```sql
   SELECT to_regclass('public.publication_outbox') AS table_exists;
   -- Expected: NULL
   ```

2. **Verify 033 RPC functions and helpers are dropped:**
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

3. **Verify baseline triggers restored and operational:**
   ```sql
   SELECT trigger_name, event_manipulation, action_statement 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'public' 
     AND event_object_table IN ('stories', 'editorial_schedule');
   -- Expected: trg_stories_updated_at and trg_editorial_schedule_updated_at calling set_updated_at()
   ```

4. **Verify baseline row update behavior:**
   ```sql
   DO $$
   DECLARE
     v_test_id UUID := gen_random_uuid();
     v_t0 TIMESTAMPTZ;
     v_t1 TIMESTAMPTZ;
   BEGIN
     INSERT INTO public.stories (id, title, slug, status, updated_at)
     VALUES (v_test_id, 'Rollback Test', 'rollback-test', 'draft', NOW() - INTERVAL '1 hour');
     
     SELECT updated_at INTO v_t0 FROM public.stories WHERE id = v_test_id;
     
     UPDATE public.stories SET title = 'Rollback Updated' WHERE id = v_test_id;
     
     SELECT updated_at INTO v_t1 FROM public.stories WHERE id = v_test_id;
     
     IF v_t1 <= v_t0 THEN
       RAISE EXCEPTION 'Restored trigger failed to bump updated_at';
     END IF;
     
     DELETE FROM public.stories WHERE id = v_test_id;
   END $$;
   ```

---

## 4. Automated Test Proof

This rollback script is continuously verified in the repository test suite via:
`tests/security/database-enforcement.test.ts` (Section 12: `Phase 51.3: Migration 033 Rollback Script Verification`).

The automated test verifies:
- Clean dropping of Migration 033 triggers (`trg_stories_updated_at`, `trg_editorial_schedule_updated_at` calling `set_updated_at_clock()`).
- Clean restoration of baseline triggers with correct original names calling `set_updated_at()` (not `set_updated_at_clock()`).
- Exactly one `updated_at` trigger per table after rollback, verified by name and backing function.
- Clean dropping of all Migration 033 functions including `fn_discover_due_schedule_entries`, `fn_complete_publication_outbox` (both overloads), `fn_claim_publication_outbox`, and `set_updated_at_clock()`.
- Clean cascade dropping of `publication_outbox` table (no enum type to drop — uses CHECK constraint).
- Correct execution of the restored baseline trigger on `stories` updates (timestamp actually advances).
- Zero leftover database artifacts.
