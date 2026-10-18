-- ==============================================================================
-- The Breakdown OS - Migration 033
-- Atomic Scheduled Publication Lease Fence, Database-Authoritative Leases,
-- Timestamp Trigger Correctness & Durable Post-Commit Recovery (Phase 43)
--
-- STATUS: UNAPPLIED
-- This is a candidate release design artifact. DO NOT apply to live production
-- or staging databases without explicit human code review and authorization.
--
-- PURPOSE:
-- 1. Eliminates cross-table TOCTOU races between editorial_schedule lease
--    verification and stories publication via atomic single-transaction commit.
-- 2. Enforces deterministic lock ordering: editorial_schedule FOR UPDATE, then stories FOR UPDATE.
-- 3. Provides database-authoritative lease acquisition (fn_claim_schedule_entry_fenced)
--    eliminating caller clock skew and future-dated lease vulnerabilities.
-- 4. Replaces generic set_updated_at() trigger on stories and editorial_schedule
--    with set_updated_at_clock() to preserve authoritative database wall-clock
--    timestamps and prevent stale transaction-start now() overwrites.
-- 5. Implements a durable transactional outbox (publication_outbox) committed
--    atomically in the same transaction as publication, guaranteeing a resilient
--    recovery path for post-publication effects (cache revalidation, events).
-- 6. RPC authority hardening: restricts all sensitive functions strictly to service_role.
-- ==============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TRIGGER HARDENING: Table-Specific Clock Timestamp Triggers (Checkpoint B)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at_clock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If updated_at was explicitly modified and supplied by the caller/statement, preserve it.
  -- Otherwise, set to authoritative database wall clock (clock_timestamp()) instead of stale now().
  IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
    NEW.updated_at = clock_timestamp();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_clock();

DROP TRIGGER IF EXISTS trg_editorial_schedule_updated_at ON public.editorial_schedule;
CREATE TRIGGER trg_editorial_schedule_updated_at
  BEFORE UPDATE ON public.editorial_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_clock();

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. DURABLE TRANSACTIONAL OUTBOX: Post-Publication Recovery (Checkpoint C)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.publication_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.editorial_schedule(id) ON DELETE CASCADE,
    effect_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_publication_outbox_queue
    ON public.publication_outbox (status, created_at)
    WHERE status IN ('pending', 'processing', 'failed');

CREATE INDEX IF NOT EXISTS idx_publication_outbox_story
    ON public.publication_outbox (story_id, schedule_id);

ALTER TABLE public.publication_outbox ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.publication_outbox FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON TABLE public.publication_outbox FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON TABLE public.publication_outbox FROM authenticator;
    END IF;
END $$;
GRANT ALL ON TABLE public.publication_outbox TO service_role;

-- Outbox worker claim function: uses FOR UPDATE SKIP LOCKED for non-blocking concurrent worker safety
CREATE OR REPLACE FUNCTION public.fn_claim_publication_outbox(
    p_batch_size INT DEFAULT 10,
    p_lease_seconds INT DEFAULT 60
)
RETURNS SETOF public.publication_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH claimable AS (
        SELECT id
        FROM public.publication_outbox
        WHERE status = 'pending'
           OR (status = 'processing' AND updated_at < (clock_timestamp() - (p_lease_seconds || ' seconds')::INTERVAL))
           OR (status = 'failed' AND retry_count < 5 AND updated_at < (clock_timestamp() - (p_lease_seconds || ' seconds')::INTERVAL))
        ORDER BY created_at ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.publication_outbox o
    SET status = 'processing',
        updated_at = clock_timestamp()
    FROM claimable
    WHERE o.id = claimable.id
    RETURNING o.*;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_claim_publication_outbox(INT, INT) FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON FUNCTION public.fn_claim_publication_outbox(INT, INT) FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON FUNCTION public.fn_claim_publication_outbox(INT, INT) FROM authenticator;
    END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.fn_claim_publication_outbox(INT, INT) TO service_role;

-- Outbox worker completion function
CREATE OR REPLACE FUNCTION public.fn_complete_publication_outbox(
    p_outbox_id UUID,
    p_status TEXT,
    p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.publication_outbox
    SET status = p_status,
        last_error = p_error,
        retry_count = CASE WHEN p_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
        processed_at = CASE WHEN p_status = 'completed' THEN clock_timestamp() ELSE processed_at END,
        updated_at = clock_timestamp()
    WHERE id = p_outbox_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_complete_publication_outbox(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON FUNCTION public.fn_complete_publication_outbox(UUID, TEXT, TEXT) FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON FUNCTION public.fn_complete_publication_outbox(UUID, TEXT, TEXT) FROM authenticator;
    END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.fn_complete_publication_outbox(UUID, TEXT, TEXT) TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. DATABASE-AUTHORITATIVE SCHEDULE LEASE CLAIM (Checkpoint A)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_claim_schedule_entry_fenced(
    p_schedule_id UUID,
    p_story_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_record RECORD;
    v_now TIMESTAMPTZ;
    v_claimed_validated_at TIMESTAMPTZ;
    v_claimed_updated_at TIMESTAMPTZ;
BEGIN
    IF p_schedule_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'INVALID_ARGUMENT',
            'error', 'p_schedule_id cannot be null'
        );
    END IF;

    -- 1. Lock schedule row FOR UPDATE
    SELECT id, story_id, status, slot_date, validated_at
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

    -- Verify story_id if supplied
    IF p_story_id IS NOT NULL AND v_schedule_record.story_id <> p_story_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_STORY_MISMATCH',
            'error', 'Schedule entry references a different story_id'
        );
    END IF;

    -- Due date check: must be due on or before database CURRENT_DATE
    IF v_schedule_record.slot_date > CURRENT_DATE THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_NOT_DUE',
            'error', format('Schedule slot_date %s is in the future', v_schedule_record.slot_date)
        );
    END IF;

    -- Authoritative database clock
    v_now := clock_timestamp();

    -- State & Lease checks
    IF v_schedule_record.status = 'published' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_PUBLISHED',
            'error', 'Schedule entry is already published'
        );
    ELSIF v_schedule_record.status = 'ready' THEN
        -- Eligible for initial claim
        NULL;
    ELSIF v_schedule_record.status = 'validated' THEN
        -- Check if existing lease is still active (within 5 minutes of database clock)
        IF v_schedule_record.validated_at IS NOT NULL AND v_schedule_record.validated_at > (v_now - INTERVAL '5 minutes') THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'SCHEDULE_LEASE_ACTIVE',
                'error', 'Active schedule lease is held by another worker'
            );
        END IF;
        -- Otherwise lease is expired (or was null), so reclaiming is permitted
    ELSE
        -- 'planned', 'in_progress', 'blocked', 'skipped'
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_INELIGIBLE',
            'error', format('Schedule entry status %s is not eligible for publication claim', v_schedule_record.status)
        );
    END IF;

    -- Atomically update to validated with authoritative database clock
    UPDATE public.editorial_schedule
    SET status = 'validated',
        validated_at = v_now,
        updated_at = v_now
    WHERE id = p_schedule_id
    RETURNING validated_at, updated_at
    INTO v_claimed_validated_at, v_claimed_updated_at;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'CLAIMED',
        'schedule_id', p_schedule_id,
        'story_id', v_schedule_record.story_id,
        'status', 'validated',
        'validated_at', v_claimed_validated_at,
        'updated_at', v_claimed_updated_at
    );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_claim_schedule_entry_fenced(UUID, UUID) FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON FUNCTION public.fn_claim_schedule_entry_fenced(UUID, UUID) FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON FUNCTION public.fn_claim_schedule_entry_fenced(UUID, UUID) FROM authenticator;
    END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.fn_claim_schedule_entry_fenced(UUID, UUID) TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ATOMIC PUBLICATION LEASE FENCE & OUTBOX ENQUEUE
-- ═══════════════════════════════════════════════════════════════════════════
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
    v_db_now TIMESTAMPTZ;
    v_target_published_at TIMESTAMPTZ;
    v_story_published_at TIMESTAMPTZ;
    v_story_updated_at TIMESTAMPTZ;
    v_schedule_updated_at TIMESTAMPTZ;
    v_updated_by_uuid UUID;
    v_story_updated_by UUID;
    v_story_scheduled_by TEXT;
    v_story_slug TEXT;
BEGIN
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
    -- Explicitly reject NULL timestamps for both caller parameter and locked row
    IF p_expected_validated_at IS NULL OR v_schedule_record.validated_at IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SCHEDULE_LEASE_LOST',
            'error', 'Schedule lease validation timestamp is missing or null'
        );
    END IF;

    -- Verify schedule lease ownership timestamp exactly matches expected claim
    IF v_schedule_record.validated_at <> p_expected_validated_at THEN
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
    SELECT id, status, version, published_at, slug
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

    v_story_slug := v_story_record.slug;

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
    -- Evaluate authoritative database wall-clock time at the transaction boundary.
    v_db_now := clock_timestamp();

    -- Authoritative published_at selection:
    -- 1. If the story already has an intentional historical published_at (<= v_db_now),
    --    preserve it as part of the editorial archival data contract.
    -- 2. Otherwise (story has NULL published_at or an erroneous future timestamp):
    --    If caller provided p_published_at that is historical (<= v_db_now), accept it.
    --    Otherwise normalize strictly to v_db_now. A caller-supplied future p_published_at
    --    is never allowed to push publication into the future, guaranteeing immediate public visibility.
    IF v_story_record.published_at IS NOT NULL AND v_story_record.published_at <= v_db_now THEN
        v_target_published_at := v_story_record.published_at;
    ELSIF p_published_at IS NOT NULL AND p_published_at <= v_db_now THEN
        v_target_published_at := p_published_at;
    ELSE
        v_target_published_at := v_db_now;
    END IF;

    -- Update story to published status with exact field mapping and update attribution.
    -- Version is authoritatively bumped by trg_stories_version_bump trigger.
    -- Updated_at is preserved authoritatively by set_updated_at_clock trigger.
    UPDATE public.stories
    SET status = 'published'::public.story_status,
        published_at = v_target_published_at,
        updated_at = v_db_now,
        updated_by = v_updated_by_uuid,
        scheduled_by = COALESCE(stories.scheduled_by, p_updated_by)
    WHERE id = p_story_id
    RETURNING version, published_at, updated_at, updated_by, scheduled_by
    INTO v_new_version, v_story_published_at, v_story_updated_at, v_story_updated_by, v_story_scheduled_by;

    -- Update editorial schedule to published status using authoritative story published_at
    UPDATE public.editorial_schedule
    SET status = 'published',
        published_at = v_story_published_at,
        updated_at = v_db_now
    WHERE id = p_schedule_id
    RETURNING updated_at
    INTO v_schedule_updated_at;

    -- 5. Enqueue pending post-publication effects atomically in publication_outbox
    INSERT INTO public.publication_outbox (story_id, schedule_id, effect_type, payload)
    VALUES
        (p_story_id, p_schedule_id, 'cache_invalidation', jsonb_build_object(
            'story_id', p_story_id,
            'slug', v_story_slug,
            'published_at', v_story_published_at
        )),
        (p_story_id, p_schedule_id, 'event_dispatch', jsonb_build_object(
            'story_id', p_story_id,
            'schedule_id', p_schedule_id,
            'version', v_new_version,
            'published_at', v_story_published_at,
            'actor', p_updated_by
        ));

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
        'scheduled_by', v_story_scheduled_by
    );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. APPLY STRICT EXECUTION PRIVILEGES
-- ═══════════════════════════════════════════════════════════════════════════
REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM publisher_worker;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        REVOKE ALL ON FUNCTION public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT) FROM authenticator;
    END IF;
END $$;

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
