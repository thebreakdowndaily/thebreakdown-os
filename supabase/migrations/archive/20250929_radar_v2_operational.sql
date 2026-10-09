-- ─── News Radar v2: Operational Sensing & Concurrency Migration ──────────────
-- Extends radar tables for scheduled polling, bounded backoff, concurrency leases, and run telemetry.

-- 1. Radar poll distributed locks (concurrency control)
create table if not exists public.radar_poll_locks (
  lock_key text primary key,
  owner_id text not null,
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- 2. Alter radar_source_health to add scheduling and lease fields
alter table public.radar_source_health
  add column if not exists last_checked_at timestamptz,
  add column if not exists next_eligible_poll_at timestamptz not null default now(),
  add column if not exists schedule_state text not null default 'READY',
  add column if not exists backoff_minutes int not null default 0,
  add column if not exists lease_owner text,
  add column if not exists lease_expires_at timestamptz;

-- 3. Alter radar_pipeline_runs to add operational metrics
alter table public.radar_pipeline_runs
  add column if not exists status text not null default 'completed',
  add column if not exists error text,
  add column if not exists sources_considered int not null default 0,
  add column if not exists successful int not null default 0,
  add column if not exists failed int not null default 0,
  add column if not exists new_artifacts int not null default 0,
  add column if not exists changed_artifacts int not null default 0,
  add column if not exists unchanged int not null default 0,
  add column if not exists events_or_signals_created int not null default 0,
  add column if not exists median_detection_latency_ms bigint,
  add column if not exists p90_detection_latency_ms bigint;

-- 4. Alter radar_latency_records for explicit timestamp semantics
alter table public.radar_latency_records
  add column if not exists first_seen_at timestamptz not null default now();

-- 5. RLS Policies
alter table public.radar_poll_locks enable row level security;

create policy "Allow authenticated all radar_poll_locks" on public.radar_poll_locks for all to authenticated using (true);
create policy "Allow authenticated read radar_poll_locks" on public.radar_poll_locks for select to authenticated using (true);

-- 6. Indexes
create index if not exists idx_radar_schedule_due on public.radar_source_health(next_eligible_poll_at, schedule_state);
create index if not exists idx_radar_locks_expires on public.radar_poll_locks(expires_at);
