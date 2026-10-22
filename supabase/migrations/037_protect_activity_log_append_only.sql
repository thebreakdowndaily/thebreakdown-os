-- Migration 037: Protect audit.activity_log as an append-only institutional audit trail
--
-- APPROVED_DESTRUCTIVE: Revoking TRUNCATE and mutation privileges on audit.activity_log to enforce append-only security
--
-- Secures the audit.activity_log table against unauthorized modification, tampering, or deletion:
-- 1. Enables Row Level Security (RLS) on audit.activity_log.
-- 2. Revokes UPDATE, DELETE, and TRUNCATE from PUBLIC, anon, authenticated, and service_role.
-- 3. Grants SELECT and INSERT to authenticated staff and service_role.
-- 4. Installs a defense-in-depth trigger (trg_activity_log_append_only) that raises an exception
--    on any attempted UPDATE or DELETE.
-- 5. Defines explicit RLS policies for SELECT and INSERT (with default-deny for UPDATE/DELETE).

BEGIN;

DO $migration$
BEGIN
  IF to_regclass('audit.activity_log') IS NOT NULL THEN
    -- 1. Grant schema usage and enable Row Level Security
    EXECUTE 'GRANT USAGE ON SCHEMA audit TO anon, authenticated, service_role';
    EXECUTE 'ALTER TABLE audit.activity_log ENABLE ROW LEVEL SECURITY';

    -- 2. Revoke permissions (least privilege)
    EXECUTE 'REVOKE ALL ON TABLE audit.activity_log FROM PUBLIC, anon';
    EXECUTE 'REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit.activity_log FROM authenticated';
    EXECUTE 'REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit.activity_log FROM service_role';
    EXECUTE 'GRANT SELECT, INSERT ON TABLE audit.activity_log TO authenticated, service_role';

    -- 3. Create or replace tamper-prevention trigger function
    CREATE OR REPLACE FUNCTION audit.fn_prevent_activity_log_tamper()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog
    AS $$
    BEGIN
      RAISE EXCEPTION 'audit.activity_log is append-only: % operations are strictly prohibited.', TG_OP;
    END;
    $$;

    REVOKE ALL ON FUNCTION audit.fn_prevent_activity_log_tamper() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION audit.fn_prevent_activity_log_tamper() TO service_role;

    -- 4. Attach trigger
    DROP TRIGGER IF EXISTS trg_activity_log_append_only ON audit.activity_log;
    CREATE TRIGGER trg_activity_log_append_only
      BEFORE UPDATE OR DELETE ON audit.activity_log
      FOR EACH ROW
      EXECUTE FUNCTION audit.fn_prevent_activity_log_tamper();

    -- 5. Explicit RLS Policies
    DROP POLICY IF EXISTS staff_read_activity_log ON audit.activity_log;
    CREATE POLICY staff_read_activity_log ON audit.activity_log
      FOR SELECT
      TO authenticated, service_role
      USING (
        (auth.jwt() ->> 'role' = 'service_role') OR
        (public.is_staff())
      );

    DROP POLICY IF EXISTS staff_insert_activity_log ON audit.activity_log;
    CREATE POLICY staff_insert_activity_log ON audit.activity_log
      FOR INSERT
      TO authenticated, service_role
      WITH CHECK (
        (auth.jwt() ->> 'role' = 'service_role') OR
        (public.is_staff())
      );
  ELSE
    RAISE NOTICE 'Migration 037: audit.activity_log does not exist; skipping.';
  END IF;
END
$migration$;

COMMIT;

NOTIFY pgrst, 'reload schema';
