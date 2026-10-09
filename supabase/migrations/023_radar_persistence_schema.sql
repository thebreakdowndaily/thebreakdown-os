-- Migration 023: Radar Persistence Schema Reproducibility
-- Consolidates archived radar sensing migrations:
--   - archive/20250929_radar_tables.sql
--   - archive/20250929_radar_v2_operational.sql
-- Restores full root migration reproducibility (001 -> 023).
-- Fully idempotent: safe on fresh databases and pre-existing staging schemas.

-- 1. Radar source health tracking (persistent, extends in-memory)
CREATE TABLE IF NOT EXISTS public.radar_source_health (
  source_id text PRIMARY KEY,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_changed_at timestamptz,
  last_http_status int,
  last_error text,
  consecutive_failures int NOT NULL DEFAULT 0,
  total_fetches int NOT NULL DEFAULT 0,
  total_failures int NOT NULL DEFAULT 0,
  total_changes int NOT NULL DEFAULT 0,
  average_fetch_ms double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unknown',
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  next_eligible_poll_at timestamptz NOT NULL DEFAULT now(),
  schedule_state text NOT NULL DEFAULT 'READY',
  backoff_minutes int NOT NULL DEFAULT 0,
  lease_owner text,
  lease_expires_at timestamptz
);

-- Ensure v2 columns exist if table was created in an earlier partial state
ALTER TABLE public.radar_source_health
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_eligible_poll_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS schedule_state text NOT NULL DEFAULT 'READY',
  ADD COLUMN IF NOT EXISTS backoff_minutes int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lease_owner text,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz;

-- 2. Content fingerprints for change detection
CREATE TABLE IF NOT EXISTS public.radar_content_fingerprints (
  source_id text NOT NULL,
  resource_url text NOT NULL,
  content_hash text NOT NULL,
  previous_hash text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_changed_at timestamptz,
  change_count int NOT NULL DEFAULT 0,
  PRIMARY KEY (source_id, resource_url)
);

-- 3. Radar latency tracking
CREATE TABLE IF NOT EXISTS public.radar_latency_records (
  cluster_id text PRIMARY KEY,
  source_published_at timestamptz,
  first_detected_at timestamptz NOT NULL,
  first_verified_at timestamptz,
  published_at timestamptz,
  detection_latency_ms bigint,
  verification_latency_ms bigint,
  publication_latency_ms bigint,
  first_seen_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure v2 columns exist if table was created in an earlier partial state
ALTER TABLE public.radar_latency_records
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now();

-- 4. Radar pipeline run log
CREATE TABLE IF NOT EXISTS public.radar_pipeline_runs (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at timestamptz NOT NULL DEFAULT now(),
  cycle_duration_ms int NOT NULL,
  sources_polled int NOT NULL DEFAULT 0,
  sources_failed int NOT NULL DEFAULT 0,
  artifacts_collected int NOT NULL DEFAULT 0,
  changes_detected int NOT NULL DEFAULT 0,
  events_extracted int NOT NULL DEFAULT 0,
  duplicates_detected int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  error text,
  sources_considered int NOT NULL DEFAULT 0,
  successful int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  new_artifacts int NOT NULL DEFAULT 0,
  changed_artifacts int NOT NULL DEFAULT 0,
  unchanged int NOT NULL DEFAULT 0,
  events_or_signals_created int NOT NULL DEFAULT 0,
  median_detection_latency_ms bigint,
  p90_detection_latency_ms bigint
);

-- Ensure v2 columns exist if table was created in an earlier partial state
ALTER TABLE public.radar_pipeline_runs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS error text,
  ADD COLUMN IF NOT EXISTS sources_considered int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS successful int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_artifacts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS changed_artifacts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unchanged int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS events_or_signals_created int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS median_detection_latency_ms bigint,
  ADD COLUMN IF NOT EXISTS p90_detection_latency_ms bigint;

-- 5. Radar poll distributed locks (concurrency control)
CREATE TABLE IF NOT EXISTS public.radar_poll_locks (
  lock_key text PRIMARY KEY,
  owner_id text NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- 6. Enable Row Level Security on all 5 tables
ALTER TABLE public.radar_source_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_content_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_latency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_poll_locks ENABLE ROW LEVEL SECURITY;

-- 7. Idempotent Policy Creation (10 total policies)
DO $$
BEGIN
  -- radar_source_health
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_source_health' AND policyname = 'Allow authenticated read radar_source_health'
  ) THEN
    CREATE POLICY "Allow authenticated read radar_source_health" ON public.radar_source_health FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_source_health' AND policyname = 'Allow authenticated all radar_source_health'
  ) THEN
    CREATE POLICY "Allow authenticated all radar_source_health" ON public.radar_source_health FOR ALL TO authenticated USING (true);
  END IF;

  -- radar_content_fingerprints
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_content_fingerprints' AND policyname = 'Allow authenticated read radar_content_fingerprints'
  ) THEN
    CREATE POLICY "Allow authenticated read radar_content_fingerprints" ON public.radar_content_fingerprints FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_content_fingerprints' AND policyname = 'Allow authenticated all radar_content_fingerprints'
  ) THEN
    CREATE POLICY "Allow authenticated all radar_content_fingerprints" ON public.radar_content_fingerprints FOR ALL TO authenticated USING (true);
  END IF;

  -- radar_latency_records
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_latency_records' AND policyname = 'Allow authenticated read radar_latency_records'
  ) THEN
    CREATE POLICY "Allow authenticated read radar_latency_records" ON public.radar_latency_records FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_latency_records' AND policyname = 'Allow authenticated all radar_latency_records'
  ) THEN
    CREATE POLICY "Allow authenticated all radar_latency_records" ON public.radar_latency_records FOR ALL TO authenticated USING (true);
  END IF;

  -- radar_pipeline_runs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_pipeline_runs' AND policyname = 'Allow authenticated read radar_pipeline_runs'
  ) THEN
    CREATE POLICY "Allow authenticated read radar_pipeline_runs" ON public.radar_pipeline_runs FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_pipeline_runs' AND policyname = 'Allow authenticated all radar_pipeline_runs'
  ) THEN
    CREATE POLICY "Allow authenticated all radar_pipeline_runs" ON public.radar_pipeline_runs FOR ALL TO authenticated USING (true);
  END IF;

  -- radar_poll_locks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_poll_locks' AND policyname = 'Allow authenticated read radar_poll_locks'
  ) THEN
    CREATE POLICY "Allow authenticated read radar_poll_locks" ON public.radar_poll_locks FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'radar_poll_locks' AND policyname = 'Allow authenticated all radar_poll_locks'
  ) THEN
    CREATE POLICY "Allow authenticated all radar_poll_locks" ON public.radar_poll_locks FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 8. Indexes (5 secondary indexes)
CREATE INDEX IF NOT EXISTS idx_radar_health_status ON public.radar_source_health(status);
CREATE INDEX IF NOT EXISTS idx_radar_schedule_due ON public.radar_source_health(next_eligible_poll_at, schedule_state);
CREATE INDEX IF NOT EXISTS idx_radar_fingerprints_seen ON public.radar_content_fingerprints(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_radar_pipeline_runs_time ON public.radar_pipeline_runs(generated_at);
CREATE INDEX IF NOT EXISTS idx_radar_locks_expires ON public.radar_poll_locks(expires_at);
