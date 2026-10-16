-- Migration 037: Harden function search paths and RPC execution grants.
--
-- Every object reference in the affected functions is schema-qualified, or the
-- function body is limited to built-ins/trigger records. Remove writable
-- application schemas from their runtime search paths to prevent object-shadowing.
--
-- The increment_rate_limit RPC is called only by PostgresRateLimitStore through
-- the server's service-role client. Public callers must not be able to choose
-- arbitrary bucket keys or limits and create unbounded rate-limit rows.

ALTER FUNCTION public.set_updated_at()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.bump_story_version()
  SET search_path = pg_catalog, pg_temp;

CREATE OR REPLACE FUNCTION public.enforce_completed_protocol_for_not_found()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.gap_status = 'NOT_FOUND' THEN
    IF NEW.search_protocol_id IS NULL THEN
      RAISE EXCEPTION 'gap_status_not_found_requires_protocol: NOT_FOUND requires a search_protocol_id';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.research_search_protocols
      WHERE id = NEW.search_protocol_id
        AND search_completed_at IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'gap_status_not_found_requires_completed_protocol: NOT_FOUND requires a COMPLETED search protocol';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.enforce_story_publication_invariants()
  SET search_path = pg_catalog, pg_temp;

DO $$
BEGIN
  IF to_regprocedure('newsroom.prevent_archived_artifact_mutation()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION newsroom.prevent_archived_artifact_mutation() SET search_path = pg_catalog, pg_temp';
  END IF;
  -- This trigger-only helper may be present in long-lived projects even when
  -- it is not part of the reproducible root migration chain.
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END;
$$;

ALTER FUNCTION public.increment_rate_limit(text, integer, integer)
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.current_app_role()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.is_staff()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.is_editor()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.is_admin()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.fn_claim_due_schedule_entry()
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.fn_publish_story_with_audit(uuid)
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.radar_claim_notification_delivery(
  text, text, text, text, text, integer, integer
)
  SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.publish_reader_correction(
  uuid, text, text, text, text, text
)
  SET search_path = pg_catalog, pg_temp;

-- Trigger functions should be invoked by their triggers, not exposed as RPCs.
REVOKE EXECUTE ON FUNCTION public.archive_story_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_story_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_completed_protocol_for_not_found() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_story_publication_invariants() FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
  IF to_regprocedure('newsroom.prevent_archived_artifact_mutation()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION newsroom.prevent_archived_artifact_mutation() FROM PUBLIC, anon, authenticated';
  END IF;
END; $$;

-- Privileged worker RPCs retain their explicit least-privilege role grants.
REVOKE EXECUTE ON FUNCTION public.fn_claim_due_schedule_entry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_publish_story_with_audit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.radar_claim_notification_delivery(
  text, text, text, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_reader_correction(
  uuid, text, text, text, text, text
) FROM PUBLIC, anon, authenticated;

-- Distributed rate limiting is backend-only. Keep this RPC out of the public
-- PostgREST surface and grant execution to the service role used by the app.
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, integer, integer)
  TO service_role;

NOTIFY pgrst, 'reload schema';
