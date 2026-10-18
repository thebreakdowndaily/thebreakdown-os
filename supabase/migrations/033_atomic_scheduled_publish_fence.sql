-- ==============================================================================
-- The Breakdown OS - Migration 033
-- Atomic Scheduled Publication Lease Fence, State Consistency & RPC Closure (Phase 37)
--
-- STATUS: UNAPPLIED
-- This is a candidate release design artifact. DO NOT apply to live production
-- or staging databases without explicit human code review and authorization.
--
-- PURPOSE:
-- Eliminates the cross-table Time-of-Check / Time-of-Use (TOCTOU) race condition
-- between `editorial_schedule` lease verification and `stories` table publication.
-- Guarantees that publication of a story row and finalization of the schedule
-- lease happen atomically within a single database transaction. If the schedule
-- lease was stolen or expired, or if the story version was modified concurrently,
-- the entire transaction fails closed and no state changes are committed.
--
-- DETERMINISTIC LOCK ORDERING:
-- 1. editorial_schedule (parent schedule lease entity) FOR UPDATE
-- 2. stories (child narrative entity) FOR UPDATE
--
-- RPC AUTHORITY HARDENING:
-- - Revokes EXECUTE from PUBLIC, anon, authenticated, and publisher_worker.
-- - Grants EXECUTE strictly to service_role (trusted server-side execution context).
-- - Direct RPC publication bypasses by standard authenticated or worker users are impossible.
--
-- LEASE EXPIRY AT TRANSACTION BOUNDARY:
-- - Evaluates lease validity against authoritative database clock (clock_timestamp())
--   AFTER acquiring row locks, ensuring lock contention delays cannot allow an
--   expired lease to commit. Boundary: age >= 5 minutes is strictly expired.
--
-- AUTHORITATIVE TIMESTAMPS & RETURNING:
-- - Preserves distinct authoritative timestamps for stories.published_at,
--   stories.updated_at, and editorial_schedule.updated_at.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_publish_story_fenced(
    p_schedule_id UUID,
    p_story_id UUID,
    p_expected_validated_at TIMESTAMPTZ,
    p_expected_version INT,
    p_published_at TIMESTAMPTZ,
    p_updated_by TEXT DEFAULT 'system-scheduler'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_record RECORD;
    v_story_record RECORD;
    v_new_version INT;
    v_publish_time TIMESTAMPTZ;
    v_story_published_at TIMESTAMPTZ;
    v_story_updated_at TIMESTAMPTZ;
    v_schedule_updated_at TIMESTAMPTZ;
    v_updated_by_uuid UUID;
    v_story_updated_by UUID;
BEGIN
    v_publish_time := COALESCE(p_published_at, clock_timestamp());

    -- Parse updated_by attribution safely into UUID
    IF p_updated_by IS NOT NULL AND p_updated_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_updated_by_uuid := p_updated_by::UUID;
    ELSIF p_updated_by = 'system-scheduler' THEN
        -- Standard deterministic system scheduler UUID
        v_updated_by_uuid := '00000000-0000-0000-0000-000000000001'::UUID;
    ELSE
        v_updated_by_uuid := NULL;
    END IF;

    -- 1. Lock parent lease entity first (deterministic lock order)
    SELECT id, status, validated_at, story_id
    INTO v_schedule_record
    FROM public.editorial_schedule
    WHERE id = p_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_NOT_FOUND',
            'error', 'Editorial schedule entry not found'
        );
    END IF;

    -- Verify schedule entry is in validated state
    IF v_schedule_record.status <> 'validated' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_NOT_VALIDATED',
            'error', format('Schedule entry status is %s, expected validated', v_schedule_record.status)
        );
    END IF;

    -- Verify schedule lease ownership timestamp
    IF v_schedule_record.validated_at IS DISTINCT FROM p_expected_validated_at THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_LEASE_LOST',
            'error', 'Schedule lease was claimed or modified by another worker'
        );
    END IF;

    -- Verify story_id consistency
    IF v_schedule_record.story_id <> p_story_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_STORY_MISMATCH',
            'error', 'Schedule entry references a different story_id'
        );
    END IF;

    -- 2. Lock target narrative row second (deterministic lock order)
    SELECT id, status, version
    INTO v_story_record
    FROM public.stories
    WHERE id = p_story_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'STORY_NOT_FOUND',
            'error', 'Story row not found'
        );
    END IF;

    -- Prevent re-publishing already published stories
    IF v_story_record.status = 'published' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_PUBLISHED',
            'error', 'Story is already published in database',
            'version', v_story_record.version
        );
    END IF;

    -- Verify optimistic concurrency control (OCC) version
    IF v_story_record.version IS DISTINCT FROM p_expected_version THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'STORY_VERSION_CONFLICT',
            'error', format('Story version conflict: expected %s, found %s', p_expected_version, v_story_record.version),
            'version', v_story_record.version
        );
    END IF;

    -- 3. Check authoritative lease expiry against database wall-clock time AFTER acquiring row locks
    -- Evaluated after acquiring row locks so any lock contention delay does not let an expired lease commit
    -- Boundary: age >= 5 minutes is strictly expired
    IF v_schedule_record.validated_at <= (clock_timestamp() - INTERVAL '5 minutes') THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_LEASE_EXPIRED',
            'error', 'Schedule lease expired (>= 5 minutes old)'
        );
    END IF;

    -- 4. Atomic State Mutations
    -- Update story to published status with exact field mapping and update attribution.
    -- Version is authoritatively bumped by trg_stories_version_bump trigger.
    -- published_at contract:
    --   Preserves historical date if non-null and <= v_publish_time.
    --   Normalizes NULL or future dates (> v_publish_time) to v_publish_time to guarantee immediate public visibility.
    UPDATE public.stories
    SET status = 'published'::public.story_status,
        published_at = CASE
            WHEN stories.published_at IS NOT NULL AND stories.published_at <= v_publish_time THEN stories.published_at
            ELSE v_publish_time
        END,
        updated_at = v_publish_time,
        updated_by = v_updated_by_uuid,
        scheduled_by = COALESCE(scheduled_by, p_updated_by)
    WHERE id = p_story_id
    RETURNING version, published_at, updated_at, updated_by
    INTO v_new_version, v_story_published_at, v_story_updated_at, v_story_updated_by;

    -- Update editorial schedule to published status using authoritative story published_at
    UPDATE public.editorial_schedule
    SET status = 'published',
        published_at = v_story_published_at,
        updated_at = clock_timestamp()
    WHERE id = p_schedule_id
    RETURNING updated_at
    INTO v_schedule_updated_at;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PUBLISHED',
        'story_id', p_story_id,
        'schedule_id', p_schedule_id,
        'status', 'published',
        'version', v_new_version,
        'published_at', v_story_published_at,
        'updated_at', v_story_updated_at,
        'schedule_published_at', v_story_published_at,
        'schedule_updated_at', v_schedule_updated_at,
        'updated_by', v_story_updated_by,
        'actor', p_updated_by,
        'scheduled_by', p_updated_by
    );
END;
$$;

-- 5. Apply strict execution privileges
-- Revoke execution from PUBLIC, anon, and authenticated to eliminate direct RPC bypasses.
REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM authenticator;
    END IF;
END $$;

-- Grant execution strictly to service_role (the trusted server-side execution context)
GRANT EXECUTE ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) TO service_role;

-- Revoke execution from legacy publishing and claiming RPCs if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'fn_publish_story_with_audit'
    ) THEN
        REVOKE ALL ON FUNCTION public.fn_publish_story_with_audit(UUID) FROM PUBLIC, anon, authenticated;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
            REVOKE ALL ON FUNCTION public.fn_publish_story_with_audit(UUID) FROM publisher_worker;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
            REVOKE ALL ON FUNCTION public.fn_publish_story_with_audit(UUID) FROM authenticator;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'fn_claim_due_schedule_entry'
    ) THEN
        REVOKE ALL ON FUNCTION public.fn_claim_due_schedule_entry() FROM PUBLIC, anon, authenticated;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
            REVOKE ALL ON FUNCTION public.fn_claim_due_schedule_entry() FROM publisher_worker;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
            REVOKE ALL ON FUNCTION public.fn_claim_due_schedule_entry() FROM authenticator;
        END IF;
    END IF;
END
$$;
