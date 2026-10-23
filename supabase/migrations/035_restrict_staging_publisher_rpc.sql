-- 035_restrict_staging_publisher_rpc.sql
-- Reassert the least-privilege publisher-worker contract across environments.
-- Production already has the intended scheduler ACL; staging has drifted and
-- currently permits anon/authenticated to call SECURITY DEFINER publish RPCs.
-- This migration is additive and makes no story/content data changes.

BEGIN;

REVOKE ALL ON FUNCTION public.fn_claim_due_schedule_entry()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_claim_due_schedule_entry()
  TO publisher_worker;
ALTER FUNCTION public.fn_claim_due_schedule_entry()
  SET search_path = pg_catalog;

REVOKE ALL ON FUNCTION public.fn_publish_story_with_audit(UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_publish_story_with_audit(UUID)
  TO publisher_worker;
ALTER FUNCTION public.fn_publish_story_with_audit(UUID)
  SET search_path = pg_catalog;

-- delete_story_cascading exists in staging but not the sampled production DB.
-- No application caller was found. It bypasses publication/auth checks and
-- deletes the story plus evidence/audit records, so leave it owner-only. The
-- guard keeps this migration portable to databases where it does not exist.
DO $migration$
BEGIN
  IF pg_catalog.to_regprocedure('public.delete_story_cascading(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.delete_story_cascading(uuid) FROM PUBLIC, anon, authenticated, service_role';
    EXECUTE 'ALTER FUNCTION public.delete_story_cascading(uuid) SET search_path = pg_catalog';
  END IF;
END;
$migration$;

COMMIT;

NOTIFY pgrst, 'reload schema';
