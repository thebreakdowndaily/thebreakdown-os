-- Migration 024: Durable Notification Deliveries & Cross-Instance Idempotency
-- Governing Document: .planning/PHASE-4B-1A-DURABLE-NOTIFICATION-IDEMPOTENCY.md
-- Operating Doctrine: AGENTS.md (Operational Observability, Security, Durability)
-- Status: HARDENED LEAST-PRIVILEGE SECURITY MODEL
--
-- Objective:
-- Guarantees the invariant:
--   same incident + same event + same destination -> exactly one delivery identity
-- across repeated cron runs, concurrent serverless executions, process restarts,
-- and separate Vercel instances.
--
-- Security Model:
-- - PUBLIC / anon: Zero table access, zero RPC execute access.
-- - authenticated: Zero table access, zero RPC execute access (no ledger forgery or deletion).
-- - service_role: Exclusive backend table access and claim RPC execution.
-- - search_path: Hardened to 'public, pg_temp' on SECURITY DEFINER function.

-- 1. Create durable notification deliveries ledger
CREATE TABLE IF NOT EXISTS public.radar_notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_key text NOT NULL,
  alert_id text NOT NULL,
  event_type text NOT NULL,
  destination text NOT NULL,
  delivery_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('CLAIMED', 'DELIVERED', 'FAILED', 'RETRYABLE')),
  attempt_count int NOT NULL DEFAULT 1,
  claim_expires_at timestamptz NOT NULL,
  last_http_status int,
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_radar_notification_incident_dest UNIQUE (incident_key, event_type, destination)
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_radar_notif_status ON public.radar_notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_radar_notif_claim_expires ON public.radar_notification_deliveries(claim_expires_at) WHERE status = 'CLAIMED';
CREATE INDEX IF NOT EXISTS idx_radar_notif_incident ON public.radar_notification_deliveries(incident_key, event_type);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.radar_notification_deliveries ENABLE ROW LEVEL SECURITY;

-- 4. Revoke all default table privileges from PUBLIC, anon, and authenticated
REVOKE ALL ON TABLE public.radar_notification_deliveries FROM PUBLIC;
REVOKE ALL ON TABLE public.radar_notification_deliveries FROM anon;
REVOKE ALL ON TABLE public.radar_notification_deliveries FROM authenticated;

-- Grant table privileges exclusively to service_role (backend notification dispatcher)
GRANT ALL ON TABLE public.radar_notification_deliveries TO service_role;

-- 5. Strict Service-Role Only RLS Policy
DO $$
BEGIN
  -- Drop any legacy permissive policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated read radar_notification_deliveries" ON public.radar_notification_deliveries;
  DROP POLICY IF EXISTS "Allow authenticated all radar_notification_deliveries" ON public.radar_notification_deliveries;
  DROP POLICY IF EXISTS "Allow service_role all radar_notification_deliveries" ON public.radar_notification_deliveries;

  -- Create strict service_role policy
  CREATE POLICY "Allow service_role all radar_notification_deliveries" 
    ON public.radar_notification_deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- 6. Atomic Claim Function (Multi-Worker Concurrency, Terminal Failure, & Crash Safety)
DROP FUNCTION IF EXISTS public.radar_claim_notification_delivery(text, text, text, text, text, int);

CREATE OR REPLACE FUNCTION public.radar_claim_notification_delivery(
  p_incident_key text,
  p_alert_id text,
  p_event_type text,
  p_destination text,
  p_delivery_id text,
  p_lease_duration_seconds int DEFAULT 300,
  p_max_attempts int DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing record;
  v_now timestamptz := now();
  v_lease_expiry timestamptz := v_now + (p_lease_duration_seconds || ' seconds')::interval;
  v_prior_failure record;
BEGIN
  -- Row lock on existing incident record if present
  SELECT * INTO v_existing
  FROM public.radar_notification_deliveries
  WHERE incident_key = p_incident_key
    AND event_type = p_event_type
    AND destination = p_destination
  FOR UPDATE;

  -- Recovery verification: must have a prior delivered failure/stale event
  IF p_event_type = 'SOURCE_HEALTH_RECOVERY' THEN
    SELECT * INTO v_prior_failure
    FROM public.radar_notification_deliveries
    WHERE incident_key = p_incident_key
      AND event_type IN ('SOURCE_HEALTH_FAILURE', 'SOURCE_HEALTH_STALE')
      AND status = 'DELIVERED';

    IF NOT FOUND THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'RECOVERY_NOT_APPLICABLE');
    END IF;
  END IF;

  IF v_existing.id IS NOT NULL THEN
    -- A. Already delivered for the same alert instance ID (or recovery already delivered)
    IF v_existing.status = 'DELIVERED' THEN
      IF p_event_type = 'SOURCE_HEALTH_RECOVERY' OR v_existing.alert_id = p_alert_id THEN
        RETURN jsonb_build_object(
          'claimed', false,
          'reason', 'ALREADY_DELIVERED',
          'delivery_id', v_existing.delivery_id
        );
      END IF;

      -- New incident cycle after resolution (new alert_id)
      UPDATE public.radar_notification_deliveries
      SET alert_id = p_alert_id,
          delivery_id = p_delivery_id,
          status = 'CLAIMED',
          attempt_count = 1,
          claim_expires_at = v_lease_expiry,
          delivered_at = NULL,
          last_error = NULL,
          updated_at = v_now
      WHERE id = v_existing.id;

      RETURN jsonb_build_object('claimed', true, 'reason', 'NEW_CLAIM', 'delivery_id', p_delivery_id);
    END IF;

    -- B. Terminal failure for the same alert instance ID (suppress infinite resend loops)
    IF v_existing.status = 'FAILED' THEN
      IF p_event_type = 'SOURCE_HEALTH_RECOVERY' OR v_existing.alert_id = p_alert_id THEN
        RETURN jsonb_build_object(
          'claimed', false,
          'reason', 'TERMINAL_FAILURE',
          'delivery_id', v_existing.delivery_id
        );
      END IF;

      -- New incident cycle after resolution (new alert_id)
      UPDATE public.radar_notification_deliveries
      SET alert_id = p_alert_id,
          delivery_id = p_delivery_id,
          status = 'CLAIMED',
          attempt_count = 1,
          claim_expires_at = v_lease_expiry,
          delivered_at = NULL,
          last_error = NULL,
          updated_at = v_now
      WHERE id = v_existing.id;

      RETURN jsonb_build_object('claimed', true, 'reason', 'NEW_CLAIM', 'delivery_id', p_delivery_id);
    END IF;

    -- C. Currently claimed by an active worker
    IF v_existing.status = 'CLAIMED' AND v_existing.claim_expires_at > v_now THEN
      RETURN jsonb_build_object(
        'claimed', false,
        'reason', 'CONCURRENT_IN_FLIGHT',
        'delivery_id', v_existing.delivery_id
      );
    END IF;

    -- D. Check maximum retry attempts across cron runs / workers
    IF v_existing.attempt_count >= p_max_attempts THEN
      -- Mark as terminally failed if attempts exhausted
      UPDATE public.radar_notification_deliveries
      SET status = 'FAILED',
          last_error = 'Maximum delivery attempts exhausted (' || p_max_attempts || '/' || p_max_attempts || ')' || COALESCE(': ' || v_existing.last_error, ''),
          updated_at = v_now
      WHERE id = v_existing.id;

      RETURN jsonb_build_object(
        'claimed', false,
        'reason', 'MAX_ATTEMPTS_EXHAUSTED',
        'delivery_id', v_existing.delivery_id
      );
    END IF;

    -- E. Reclaim expired lease or retry RETRYABLE delivery
    UPDATE public.radar_notification_deliveries
    SET alert_id = p_alert_id,
        delivery_id = p_delivery_id,
        status = 'CLAIMED',
        attempt_count = v_existing.attempt_count + 1,
        claim_expires_at = v_lease_expiry,
        last_error = NULL,
        updated_at = v_now
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'claimed', true,
      'reason', CASE WHEN v_existing.status = 'CLAIMED' THEN 'LEASE_RECLAIMED' ELSE 'NEW_CLAIM' END,
      'delivery_id', p_delivery_id
    );
  ELSE
    -- F. First claim for this incident and destination
    INSERT INTO public.radar_notification_deliveries (
      incident_key, alert_id, event_type, destination, delivery_id, status, attempt_count, claim_expires_at, created_at, updated_at
    ) VALUES (
      p_incident_key, p_alert_id, p_event_type, p_destination, p_delivery_id, 'CLAIMED', 1, v_lease_expiry, v_now, v_now
    );

    RETURN jsonb_build_object('claimed', true, 'reason', 'NEW_CLAIM', 'delivery_id', p_delivery_id);
  END IF;
END;
$$;

-- 7. Hardened Function Execution Privileges
REVOKE ALL ON FUNCTION public.radar_claim_notification_delivery(text, text, text, text, text, int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.radar_claim_notification_delivery(text, text, text, text, text, int, int) FROM anon;
REVOKE ALL ON FUNCTION public.radar_claim_notification_delivery(text, text, text, text, text, int, int) FROM authenticated;

-- Grant execute exclusively to service_role
GRANT EXECUTE ON FUNCTION public.radar_claim_notification_delivery(text, text, text, text, text, int, int) TO service_role;
