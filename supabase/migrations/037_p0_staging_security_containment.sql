-- ─── Migration 037: P0 staging security containment (Issue #90) ───────────────
--
-- Scope: least-privilege containment for the DB objects that are reachable from
-- the exposed PostgREST schemas in the fact-check/staging project
-- (lvfovvidtowadmnggzzf). The same file is written to be portable to the
-- production-named project (mskyhaunnlwtwvsqcmav), where several of these
-- objects do not exist, but it must be applied to production only after the
-- staging verification in docs/security/2026-11-10-p0-staging-containment.md.
--
-- What this migration does:
--   1. Makes public.delete_story_cascading(uuid) owner-only. It is a destructive
--      SECURITY DEFINER function with no authentication check and no known
--      application caller.
--   2. Restricts editorial.record_claim_verification_atomic(...) to service_role.
--      Its body trusts caller-supplied verifier identity, so it must never be
--      callable by anon/authenticated through PostgREST.
--   3. Closes anonymous/authenticated reads of internal editorial research,
--      claim-verification and audit tables (privilege revoke + RLS + an explicit
--      restrictive deny policy, so a future stray GRANT cannot silently reopen
--      the data).
--   4. Retires direct client/server access to the legacy publication RPCs.
--      The scheduled-publish RPCs remain executable only by publisher_worker.
--      The canonical publication path (fn_publish_story_fenced and the
--      application publication contract) is intentionally untouched.
--
-- Safety properties:
--   * No data changes (no INSERT/UPDATE/DELETE/TRUNCATE).
--   * No object is dropped.
--   * Every object change is guarded by existence checks, so the file applies
--     cleanly on both schema histories and is idempotent.
--   * Does not enable RLS without a policy: each table gets a restrictive
--     deny-client policy for anon/authenticated.
--
-- Migration ledger note: staging records out-of-band versions 034–036 that are
-- not present on main. This file deliberately uses 037 and does not reproduce
-- or claim to own those versions. See the containment document for details.

BEGIN;

-- ─── 1. Destructive story deletion is owner-only ──────────────────────────────
DO $containment$
BEGIN
  IF to_regprocedure('public.delete_story_cascading(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.delete_story_cascading(uuid) FROM PUBLIC, anon, authenticated, service_role';
  END IF;
END
$containment$;

-- ─── 2. Claim verification is server-side only ────────────────────────────────
DO $containment$
BEGIN
  IF to_regprocedure('editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[]) FROM PUBLIC, anon, authenticated, publisher_worker';
    EXECUTE 'GRANT EXECUTE ON FUNCTION editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[]) TO service_role';
  END IF;
END
$containment$;

-- ─── 3. Internal research, verification and audit tables ──────────────────────
DO $containment$
DECLARE
  target RECORD;
  relation REGCLASS;
BEGIN
  FOR target IN
    SELECT * FROM (VALUES
      ('editorial', 'sources'),
      ('editorial', 'claims'),
      ('editorial', 'claim_citations'),
      ('editorial', 'claim_verifications'),
      ('editorial', 'claim_verification_evidence'),
      ('editorial', 'story_claims'),
      ('editorial', 'evidence_items'),
      ('audit', 'published_story_snapshots'),
      ('audit', 'story_versions'),
      ('audit', 'activity_log')
    ) AS t(schema_name, table_name)
  LOOP
    relation := to_regclass(format('%I.%I', target.schema_name, target.table_name));
    CONTINUE WHEN relation IS NULL;

    -- Privilege boundary: clients lose the table entirely.
    EXECUTE format('REVOKE ALL ON TABLE %s FROM PUBLIC, anon, authenticated', relation);

    -- Defense in depth: deny-by-default even if a future migration re-grants.
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', relation);
    EXECUTE format('DROP POLICY IF EXISTS p0_deny_client_access ON %s', relation);
    EXECUTE format(
      'CREATE POLICY p0_deny_client_access ON %s AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      relation
    );
  END LOOP;

  -- Schema USAGE is the outer boundary. Keep it open only for the trusted
  -- server role; the application does not read these schemas with user JWTs.
  IF to_regnamespace('editorial') IS NOT NULL THEN
    EXECUTE 'REVOKE USAGE ON SCHEMA editorial FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT USAGE ON SCHEMA editorial TO service_role';
  END IF;

  IF to_regnamespace('audit') IS NOT NULL THEN
    EXECUTE 'REVOKE USAGE ON SCHEMA audit FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT USAGE ON SCHEMA audit TO service_role';
  END IF;
END
$containment$;

-- ─── 4. Legacy publication RPCs ───────────────────────────────────────────────
-- publish_story_atomic bypasses the canonical application publication contract
-- and accepts a caller-supplied actor id. No application caller exists; retire
-- it for every application role (owner/postgres retains ownership access).
DO $containment$
BEGIN
  IF to_regprocedure('public.publish_story_atomic(uuid,uuid,integer)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.publish_story_atomic(uuid,uuid,integer) FROM PUBLIC, anon, authenticated, service_role, publisher_worker';
  END IF;
END
$containment$;

-- Scheduled-publish RPCs: reassert the migration-030 contract and undo drift.
DO $containment$
BEGIN
  IF to_regprocedure('public.fn_publish_story_with_audit(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.fn_publish_story_with_audit(uuid) FROM PUBLIC, anon, authenticated, service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.fn_publish_story_with_audit(uuid) TO publisher_worker';
  END IF;
END
$containment$;

DO $containment$
BEGIN
  IF to_regprocedure('public.fn_claim_due_schedule_entry()') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.fn_claim_due_schedule_entry() FROM PUBLIC, anon, authenticated, service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.fn_claim_due_schedule_entry() TO publisher_worker';
  END IF;
END
$containment$;

COMMIT;

-- Make PostgREST drop cached privileges for the affected schemas.
NOTIFY pgrst, 'reload schema';
