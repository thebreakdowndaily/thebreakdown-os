-- Migration 034: Explicit API privileges for durable correction tables.
--
-- Row Level Security policies filter rows but do not grant SQL table privileges.
-- Supabase projects/branches with secure defaults do not automatically expose
-- new public-schema tables through the Data API. Keep these grants explicit and
-- narrow so corrections publication works consistently across projects.
--
-- The append-only public ledger is readable by readers, editable only through
-- authenticated editorial policies/service operations, and never deletable by
-- the API roles. The private submission queue allows submissions from readers,
-- editorial reads/triage through RLS, and service-role cleanup for synthetic
-- staging smoke records.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Public story metadata is embedded in the public corrections projection query.
-- The existing stories RLS policies still limit readers to published stories.
GRANT SELECT ON TABLE public.stories TO anon, authenticated, service_role;

-- Reset inherited/default grants so the intended access matrix is deterministic.
REVOKE ALL PRIVILEGES ON TABLE public.corrections FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.reader_corrections FROM PUBLIC, anon, authenticated, service_role;

-- Public ledger: readers can SELECT; authenticated editorial callers can write
-- only when the existing RLS role-claim policies permit them; service_role can
-- operate on records without DELETE, preserving the correction history.
GRANT SELECT ON TABLE public.corrections TO anon, authenticated, service_role;
GRANT INSERT, UPDATE ON TABLE public.corrections TO authenticated, service_role;
REVOKE DELETE ON TABLE public.corrections FROM PUBLIC, anon, authenticated, service_role;

-- Private queue: readers may submit, but anon cannot query submission contents.
-- Authenticated editorial reads/updates remain subject to the existing RLS rules.
GRANT INSERT ON TABLE public.reader_corrections TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.reader_corrections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reader_corrections TO service_role;
