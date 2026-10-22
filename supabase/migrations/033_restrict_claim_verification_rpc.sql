-- Migration 033: Restrict direct execution of the claim verification RPC.
--
-- The fact-check database contains editorial.record_claim_verification_atomic(),
-- a SECURITY DEFINER function that records verification and audit events using
-- caller-supplied verifier identity. Client roles must not be able to call it
-- directly. The production-named database does not currently contain this
-- function, so this migration is deliberately conditional and safe on both
-- schema histories. It does not change schema USAGE or unrelated RPC grants.
--
-- Trusted application servers may call the function using service_role. Any
-- authenticated staff workflow must go through a server route that verifies
-- the principal's fact_checker/editor role before invoking the RPC.

DO $migration$
DECLARE
  function_signature regprocedure;
BEGIN
  function_signature := to_regprocedure(
    'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])'
  );

  IF function_signature IS NULL THEN
    RAISE NOTICE 'Migration 033: claim verification RPC absent; no privilege changes required.';
    RETURN;
  END IF;

  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', function_signature);
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', function_signature);
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', function_signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', function_signature);
END
$migration$;

NOTIFY pgrst, 'reload schema';
