-- ==============================================================================
-- The Breakdown OS - Migration 033
-- Atomic Scheduled Publication Lease Fence (Phase 35 Candidate Release)
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
SET search_path = public
AS $$
DECLARE
    v_schedule_record RECORD;
    v_story_record RECORD;
    v_new_version INT;
BEGIN
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

    -- 2. Lock target narrative row second
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
            'error', 'Story is already published'
        );
    END IF;

    -- Verify optimistic concurrency control (OCC) version
    IF v_story_record.version IS DISTINCT FROM p_expected_version THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'STORY_VERSION_CONFLICT',
            'error', format('Story version conflict: expected %s, found %s', p_expected_version, v_story_record.version)
        );
    END IF;

    -- 3. Atomic State Mutations
    v_new_version := v_story_record.version + 1;

    -- Update story to published status with incremented version
    UPDATE public.stories
    SET status = 'published'::public.story_status,
        published_at = p_published_at,
        version = v_new_version,
        updated_at = p_published_at
    WHERE id = p_story_id;

    -- Update editorial schedule to published status
    UPDATE public.editorial_schedule
    SET status = 'published',
        published_at = p_published_at,
        updated_at = p_published_at
    WHERE id = p_schedule_id;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PUBLISHED',
        'story_id', p_story_id,
        'schedule_id', p_schedule_id,
        'version', v_new_version,
        'published_at', p_published_at
    );
END;
$$;

-- 4. Apply strict execution privileges
REVOKE EXECUTE ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) TO authenticated, service_role;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        GRANT EXECUTE ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) TO publisher_worker;
    END IF;
END
$$;
