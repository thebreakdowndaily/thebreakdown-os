-- ─── Migration 034: Retire Legacy Publisher RPC Privileges ────────────────────
--
-- The canonical publication route is the single publication authority. The old
-- publisher RPCs mutate publication state without executing that full contract.
-- Remove both the function grants and the API authenticator's ability to SET ROLE
-- to publisher_worker. Keep the functions in place for forensic/source history;
-- they are no longer an allowed publication path.
--
-- This migration is privilege-reduction only and does not change story data.

REVOKE EXECUTE ON FUNCTION public.fn_publish_story_with_audit(uuid) FROM PUBLIC, publisher_worker;
REVOKE EXECUTE ON FUNCTION public.fn_claim_due_schedule_entry() FROM PUBLIC, publisher_worker;
REVOKE publisher_worker FROM authenticator;
