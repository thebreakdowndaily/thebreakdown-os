-- =====================================================================
-- Migration 016: Persistent API Keys, Row-Level Security & Distributed Rate Limiting
--
-- 1. Create public.api_keys table with secure hashing and lifecycle metadata
-- 2. Create public.rate_limit_buckets table for distributed rate limiting
-- 3. Create atomic rate limiting function increment_rate_limit()
-- 4. Enable RLS and author granular policies
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Persistent API Keys
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix VARCHAR(32) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'contributor', 'reporter', 'editor', 'admin', 'owner')),
  rate_limit_tier TEXT NOT NULL DEFAULT 'standard' CHECK (rate_limit_tier IN ('tier_low', 'standard', 'tier_high', 'unlimited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- Indexing for high-throughput lookup by hash and owner
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner_id ON public.api_keys(owner_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked_at ON public.api_keys(revoked_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON public.api_keys(expires_at);

-- ---------------------------------------------------------------------
-- 2. Distributed Rate Limiting Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires_at ON public.rate_limit_buckets(expires_at);

-- ---------------------------------------------------------------------
-- 3. Atomic Rate Limiting Function
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_bucket_key TEXT,
  p_window_seconds INT DEFAULT 60,
  p_max_limit INT DEFAULT 100
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INT,
  remaining INT,
  reset_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_window_start TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_current_count INT;
  v_reset_sec INT;
BEGIN
  -- Align window start to discrete interval boundary
  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );
  v_expires_at := v_window_start + (p_window_seconds || ' seconds')::INTERVAL;
  v_reset_sec := GREATEST(1, ceil(extract(epoch from (v_expires_at - v_now)))::INT);

  -- Atomic upsert to increment request count
  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, request_count, expires_at)
  VALUES (p_bucket_key, v_window_start, 1, v_expires_at)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET request_count = public.rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_current_count;

  -- Opportunistic cleanup of expired buckets (1% sample rate to prevent table bloat)
  IF random() < 0.02 THEN
    DELETE FROM public.rate_limit_buckets WHERE expires_at < v_now - INTERVAL '10 seconds';
  END IF;

  RETURN QUERY SELECT
    (v_current_count <= p_max_limit) AS allowed,
    v_current_count AS current_count,
    GREATEST(0, p_max_limit - v_current_count) AS remaining,
    v_reset_sec AS reset_seconds;
END;
$$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security for API Keys
-- ---------------------------------------------------------------------

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS api_keys_read_own ON public.api_keys;
DROP POLICY IF EXISTS api_keys_admin_all ON public.api_keys;
DROP POLICY IF EXISTS rate_limit_admin_all ON public.rate_limit_buckets;

-- Users can read their own API keys (omits key_hash via application select)
CREATE POLICY api_keys_read_own ON public.api_keys
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = owner_id
  );

-- Admins and Owners can manage all API keys
CREATE POLICY api_keys_admin_all ON public.api_keys
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Rate limit buckets are managed via SECURITY DEFINER function or service role
CREATE POLICY rate_limit_admin_all ON public.rate_limit_buckets
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
