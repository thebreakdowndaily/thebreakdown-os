-- The Breakdown OS - Migration 030
-- Cloudflare Publisher Privilege Reduction & RPC Execution

-- 1. Ensure the restricted publisher role exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'publisher_worker') THEN
        CREATE ROLE publisher_worker NOLOGIN;
    END IF;
END
$$;

-- 2. Create the function to claim a due schedule entry
CREATE OR REPLACE FUNCTION fn_claim_due_schedule_entry(
    OUT schedule_id UUID,
    OUT claimed_story_id UUID
)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.editorial_schedule
    SET status = 'validated'
    WHERE id = (
        SELECT id 
        FROM public.editorial_schedule
        WHERE status IN ('validated', 'ready') 
          AND slot_date <= CURRENT_DATE
        ORDER BY slot_date ASC, priority DESC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
    )
    RETURNING id, story_id INTO schedule_id, claimed_story_id;
END;
$$;

-- 3. Create the function to publish a story and audit it
CREATE OR REPLACE FUNCTION fn_publish_story_with_audit(
    p_story_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the story to published
    UPDATE public.stories
    SET status = 'published'::public.story_status,
        published_at = now()
    WHERE id = p_story_id;

    -- Insert into the publication gate log
    INSERT INTO public.publication_gate_log (
        story_id,
        gate_result,
        checks,
        checked_at,
        published_at,
        triggered_by
    ) VALUES (
        p_story_id,
        'pass',
        '[]'::jsonb,
        now(),
        now(),
        'cron'
    );
END;
$$;

-- 4. Apply strict execution privileges
-- Revoke execution from public (by default PUBLIC can execute functions)
REVOKE EXECUTE ON FUNCTION fn_claim_due_schedule_entry() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION fn_publish_story_with_audit(UUID) FROM PUBLIC;

-- Grant execution explicitly to the restricted publisher worker role
GRANT EXECUTE ON FUNCTION fn_claim_due_schedule_entry() TO publisher_worker;
GRANT EXECUTE ON FUNCTION fn_publish_story_with_audit(UUID) TO publisher_worker;
