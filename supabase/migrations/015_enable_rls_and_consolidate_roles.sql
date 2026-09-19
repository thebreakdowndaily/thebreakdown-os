-- The Breakdown OS — Migration 015
-- Enable Row Level Security (RLS), Consolidate Roles & Establish Authoritative user_roles Table
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create Authoritative user_roles Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'owner',
        'managing_editor',
        'editor',
        'reporter',
        'researcher',
        'analyst',
        'fact_checker',
        'guest'
    )),
    organization_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_roles_user_id UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON public.user_roles(status);

-- 2. Consolidate Roles on Existing public.users Table (Preserving Existing Data)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Relax constraint to accept both legacy and canonical IntelRole values
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
        ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
            role IN (
                'owner', 'managing_editor', 'editor', 'reporter', 'researcher', 'analyst', 'fact_checker', 'guest',
                'admin', 'writer', 'viewer', 'reader', 'designer'
            )
        );

        -- Deterministically seed user_roles from existing valid UUID user records
        INSERT INTO public.user_roles (user_id, role, status, created_at, updated_at)
        SELECT 
            id::uuid,
            CASE 
                WHEN role = 'admin' THEN 'owner'
                WHEN role = 'writer' THEN 'reporter'
                WHEN role IN ('reader', 'viewer', 'designer') THEN 'guest'
                WHEN role IN ('owner', 'managing_editor', 'editor', 'reporter', 'researcher', 'analyst', 'fact_checker', 'guest') THEN role
                ELSE 'guest'
            END,
            'active',
            COALESCE(created_at, now()),
            COALESCE(updated_at, now())
        FROM public.users
        WHERE id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- 3. Secure PostgreSQL Authorization Helper Functions (SECURITY DEFINER)
-- ═══════════════════════════════════════════════════════════════════════════

-- Current application role lookup: queries authoritative user_roles, fallback to app_metadata claim
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_role TEXT;
    v_status TEXT;
BEGIN
    -- Unauthenticated callers are guest
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    -- 1. Authoritative database lookup
    SELECT role, status INTO v_role, v_status
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;

    -- Suspended or revoked accounts fail closed
    IF v_status IS NOT NULL AND v_status <> 'active' THEN
        RETURN 'guest';
    END IF;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 2. Fallback to server-verified app_metadata claim (convenience cache)
    v_role := auth.jwt() -> 'app_metadata' ->> 'role';
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    RETURN 'guest';
END;
$$;

-- Staff role check (editorial & intelligence contributors)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT public.current_app_role() IN (
        'owner', 'managing_editor', 'editor', 'reporter', 'researcher', 'analyst', 'fact_checker'
    );
$$;

-- Editorial authority check (can edit and publish stories)
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT public.current_app_role() IN ('owner', 'managing_editor', 'editor');
$$;

-- Administrative authority check (can delete stories, manage keys & grant roles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT public.current_app_role() IN ('owner', 'managing_editor');
$$;

-- Restrict function execution
REVOKE EXECUTE ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated, anon;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon;

REVOKE EXECUTE ON FUNCTION public.is_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated, anon;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 4. Enable Row Level Security on Base Tables
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dataset_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.story_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.story_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topic_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.story_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entity_relationships ENABLE ROW LEVEL SECURITY;

-- Enable RLS on identity schema tables if present
DO $$
DECLARE
    tbl text;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'identity') THEN
        FOR tbl IN SELECT unnest(ARRAY['users', 'reader_profiles', 'bookmarks', 'reading_history', 'follows']) LOOP
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'identity' AND table_name = tbl) THEN
                EXECUTE format('ALTER TABLE identity.%I ENABLE ROW LEVEL SECURITY', tbl);
            END IF;
        END LOOP;
    END IF;
END $$;

-- 5. Explicit Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- A. Stories: Public sees published; Staff sees all drafts; Editor writes; Admin deletes
DROP POLICY IF EXISTS public_read_published_stories ON public.stories;
CREATE POLICY public_read_published_stories ON public.stories
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS staff_read_all_stories ON public.stories;
CREATE POLICY staff_read_all_stories ON public.stories
    FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS staff_insert_stories ON public.stories;
CREATE POLICY staff_insert_stories ON public.stories
    FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS staff_update_stories ON public.stories;
CREATE POLICY staff_update_stories ON public.stories
    FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS admin_delete_stories ON public.stories;
CREATE POLICY admin_delete_stories ON public.stories
    FOR DELETE USING (public.is_admin());

-- B. Topics: Public read; Editor write
DROP POLICY IF EXISTS public_read_topics ON public.topics;
CREATE POLICY public_read_topics ON public.topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS editor_insert_topics ON public.topics;
CREATE POLICY editor_insert_topics ON public.topics
    FOR INSERT WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS editor_update_topics ON public.topics;
CREATE POLICY editor_update_topics ON public.topics
    FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS admin_delete_topics ON public.topics;
CREATE POLICY admin_delete_topics ON public.topics
    FOR DELETE USING (public.is_admin());

-- C. Entities: Public read; Editor write
DROP POLICY IF EXISTS public_read_entities ON public.entities;
CREATE POLICY public_read_entities ON public.entities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS editor_insert_entities ON public.entities;
CREATE POLICY editor_insert_entities ON public.entities
    FOR INSERT WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS editor_update_entities ON public.entities;
CREATE POLICY editor_update_entities ON public.entities
    FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS admin_delete_entities ON public.entities;
CREATE POLICY admin_delete_entities ON public.entities
    FOR DELETE USING (public.is_admin());

-- D. Timelines: Public read; Editor write
DROP POLICY IF EXISTS public_read_timelines ON public.timelines;
CREATE POLICY public_read_timelines ON public.timelines
    FOR SELECT USING (true);

DROP POLICY IF EXISTS editor_insert_timelines ON public.timelines;
CREATE POLICY editor_insert_timelines ON public.timelines
    FOR INSERT WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS editor_update_timelines ON public.timelines;
CREATE POLICY editor_update_timelines ON public.timelines
    FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS admin_delete_timelines ON public.timelines;
CREATE POLICY admin_delete_timelines ON public.timelines
    FOR DELETE USING (public.is_admin());

-- E. Fixes: Public sees published; Staff sees all; Editor writes
DROP POLICY IF EXISTS public_read_published_fixes ON public.fixes;
CREATE POLICY public_read_published_fixes ON public.fixes
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS staff_read_all_fixes ON public.fixes;
CREATE POLICY staff_read_all_fixes ON public.fixes
    FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS editor_insert_fixes ON public.fixes;
CREATE POLICY editor_insert_fixes ON public.fixes
    FOR INSERT WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS editor_update_fixes ON public.fixes;
CREATE POLICY editor_update_fixes ON public.fixes
    FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS admin_delete_fixes ON public.fixes;
CREATE POLICY admin_delete_fixes ON public.fixes
    FOR DELETE USING (public.is_admin());

-- F. Media items: Public read; Staff write
DROP POLICY IF EXISTS public_read_media ON public.media_items;
CREATE POLICY public_read_media ON public.media_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS staff_insert_media ON public.media_items;
CREATE POLICY staff_insert_media ON public.media_items
    FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS staff_update_media ON public.media_items;
CREATE POLICY staff_update_media ON public.media_items
    FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS admin_delete_media ON public.media_items;
CREATE POLICY admin_delete_media ON public.media_items
    FOR DELETE USING (public.is_admin());

-- G. Datasets & Sub-tables: Public read; Staff write
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'datasets', 'dataset_versions', 'dataset_metrics', 'dataset_dimensions',
        'dataset_series', 'dataset_observations', 'dataset_visualizations'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('DROP POLICY IF EXISTS public_read_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY public_read_%I ON public.%I FOR SELECT USING (true)', tbl, tbl);

            EXECUTE format('DROP POLICY IF EXISTS staff_insert_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY staff_insert_%I ON public.%I FOR INSERT WITH CHECK (public.is_staff())', tbl, tbl);

            EXECUTE format('DROP POLICY IF EXISTS staff_update_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY staff_update_%I ON public.%I FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff())', tbl, tbl);

            EXECUTE format('DROP POLICY IF EXISTS admin_delete_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY admin_delete_%I ON public.%I FOR DELETE USING (public.is_admin())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- H. Users: User reads & updates own profile; Admin reads all
DROP POLICY IF EXISTS self_read_user ON public.users;
CREATE POLICY self_read_user ON public.users
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (auth.uid()::text = id OR public.is_admin())
    );

DROP POLICY IF EXISTS self_update_user ON public.users;
CREATE POLICY self_update_user ON public.users
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (auth.uid()::text = id OR public.is_admin())
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND (auth.uid()::text = id OR public.is_admin())
    );

DROP POLICY IF EXISTS admin_insert_user ON public.users;
CREATE POLICY admin_insert_user ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (auth.uid()::text = id OR public.is_admin())
    );

-- I. Bookmarks: Strictly user-owned; User A cannot read or modify User B's bookmarks
DROP POLICY IF EXISTS self_select_bookmarks ON public.bookmarks;
CREATE POLICY self_select_bookmarks ON public.bookmarks
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND auth.uid()::text = user_id
    );

DROP POLICY IF EXISTS self_insert_bookmarks ON public.bookmarks;
CREATE POLICY self_insert_bookmarks ON public.bookmarks
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid()::text = user_id
    );

DROP POLICY IF EXISTS self_update_bookmarks ON public.bookmarks;
CREATE POLICY self_update_bookmarks ON public.bookmarks
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND auth.uid()::text = user_id
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid()::text = user_id
    );

DROP POLICY IF EXISTS self_delete_bookmarks ON public.bookmarks;
CREATE POLICY self_delete_bookmarks ON public.bookmarks
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND auth.uid()::text = user_id
    );

-- J. User Roles: User reads own role; Admins manage roles; Regular users cannot self-escalate
DROP POLICY IF EXISTS self_select_user_roles ON public.user_roles;
CREATE POLICY self_select_user_roles ON public.user_roles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin())
    );

DROP POLICY IF EXISTS admin_insert_user_roles ON public.user_roles;
CREATE POLICY admin_insert_user_roles ON public.user_roles
    FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_user_roles ON public.user_roles;
CREATE POLICY admin_update_user_roles ON public.user_roles
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_delete_user_roles ON public.user_roles;
CREATE POLICY admin_delete_user_roles ON public.user_roles
    FOR DELETE USING (public.is_admin());

-- K. Relationship Join Tables: Public read; Editor write
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'story_topics', 'story_entities', 'topic_entities', 'story_timelines', 'entity_relationships'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('DROP POLICY IF EXISTS public_read_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY public_read_%I ON public.%I FOR SELECT USING (true)', tbl, tbl);

            EXECUTE format('DROP POLICY IF EXISTS editor_write_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY editor_write_%I ON public.%I FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

