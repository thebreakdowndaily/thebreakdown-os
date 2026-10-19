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
3. **Trigger Restoration:** Dropping the atomic fence triggers (`trg_stories_atomic_fence` and `trg_editorial_schedule_atomic_fence`) leaves the tables without automatic `updated_at` timestamp updates unless baseline triggers from Migration 002 (`trg_stories_set_updated_at` and `trg_editorial_schedule_set_updated_at`) are restored. This rollback explicitly restores those baseline triggers.

---

## 2. Tested Rollback DDL

The following DDL has been adversarially verified against live PostgreSQL instances in Section 12 of `tests/security/database-enforcement.test.ts`:

```sql
BEGIN;

-- ============================================================================
-- 1. DROP MIGRATION 033 ATOMIC FENCE TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trg_stories_atomic_fence ON public.stories;
DROP TRIGGER IF EXISTS trg_editorial_schedule_atomic_fence ON public.editorial_schedule;

-- ============================================================================
-- 2. RESTORE BASELINE TRIGGERS FROM MIGRATION 002
-- ============================================================================
-- Ensure set_updated_at() trigger function handles updated_at mutations
CREATE TRIGGER trg_stories_set_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editorial_schedule_set_updated_at
  BEFORE UPDATE ON public.editorial_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. DROP MIGRATION 033 STORED PROCEDURES & RPC FUNCTIONS
-- ============================================================================
DROP FUNCTION IF EXISTS public.fn_block_schedule_entry_fenced(UUID, UUID, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT, JSONB, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID, UUID);
DROP FUNCTION IF EXISTS public.fn_claim_schedule_entry_fenced(UUID);
DROP FUNCTION IF EXISTS public.fn_touch_updated_at_unfenced();
DROP FUNCTION IF EXISTS public.fn_reap_abandoned_leases_fenced();
DROP FUNCTION IF EXISTS public.fn_drain_publication_outbox_fenced(INT);
DROP FUNCTION IF EXISTS public.fn_claim_publication_outbox(INT, INT);
DROP FUNCTION IF EXISTS public.fn_complete_publication_outbox(UUID, TEXT, TEXT, TEXT);

-- ============================================================================
-- 4. DROP MIGRATION 033 OUTBOX TABLE AND ENUM
-- ============================================================================
DROP TABLE IF EXISTS public.publication_outbox CASCADE;
DROP TYPE IF EXISTS public.publication_outbox_status CASCADE;

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

1. **Verify outbox table and type are dropped:**
   ```sql
   SELECT to_regclass('public.publication_outbox') AS table_exists,
          to_regtype('public.publication_outbox_status') AS type_exists;
   -- Expected: NULL, NULL
   ```

2. **Verify 033 RPC functions are dropped:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
     AND routine_name IN (
       'fn_publish_story_fenced',
       'fn_block_schedule_entry_fenced',
       'fn_claim_schedule_entry_fenced',
       'fn_claim_publication_outbox',
       'fn_complete_publication_outbox'
     );
   -- Expected: 0 rows returned
   ```

3. **Verify baseline triggers restored and operational:**
   ```sql
   SELECT trigger_name, event_manipulation, action_statement 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'public' 
     AND event_object_table IN ('stories', 'editorial_schedule');
   -- Expected: trg_stories_set_updated_at and trg_editorial_schedule_set_updated_at calling set_updated_at()
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
- Clean dropping of atomic fence triggers.
- Clean restoration of baseline `set_updated_at` triggers.
- Clean dropping of all 10 functions and overloads.
- Clean cascade dropping of `publication_outbox` table and `publication_outbox_status` enum.
- Correct execution of the restored baseline trigger on `stories` updates.
- Zero leftover database artifacts.
