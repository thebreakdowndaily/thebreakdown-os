-- Radar source health tracking (persistent, extends in-memory)
create table if not exists public.radar_source_health (
  source_id text primary key,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_changed_at timestamptz,
  last_http_status int,
  last_error text,
  consecutive_failures int not null default 0,
  total_fetches int not null default 0,
  total_failures int not null default 0,
  total_changes int not null default 0,
  average_fetch_ms float not null default 0,
  status text not null default 'unknown',
  updated_at timestamptz not null default now()
);

-- Content fingerprints for change detection
create table if not exists public.radar_content_fingerprints (
  source_id text not null,
  resource_url text not null,
  content_hash text not null,
  previous_hash text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_changed_at timestamptz,
  change_count int not null default 0,
  primary key (source_id, resource_url)
);

-- Radar latency tracking
create table if not exists public.radar_latency_records (
  cluster_id text primary key,
  source_published_at timestamptz,
  first_detected_at timestamptz not null,
  first_verified_at timestamptz,
  published_at timestamptz,
  detection_latency_ms bigint,
  verification_latency_ms bigint,
  publication_latency_ms bigint
);

-- Radar pipeline run log
create table if not exists public.radar_pipeline_runs (
  id text primary key,
  generated_at timestamptz not null default now(),
  cycle_duration_ms int not null,
  sources_polled int not null default 0,
  sources_failed int not null default 0,
  artifacts_collected int not null default 0,
  changes_detected int not null default 0,
  events_extracted int not null default 0,
  duplicates_detected int not null default 0
);

-- RLS Policies
alter table public.radar_source_health enable row level security;
alter table public.radar_content_fingerprints enable row level security;
alter table public.radar_latency_records enable row level security;
alter table public.radar_pipeline_runs enable row level security;

create policy "Allow authenticated read radar_source_health" on public.radar_source_health for select to authenticated using (true);
create policy "Allow authenticated all radar_source_health" on public.radar_source_health for all to authenticated using (true);

create policy "Allow authenticated read radar_content_fingerprints" on public.radar_content_fingerprints for select to authenticated using (true);
create policy "Allow authenticated all radar_content_fingerprints" on public.radar_content_fingerprints for all to authenticated using (true);

create policy "Allow authenticated read radar_latency_records" on public.radar_latency_records for select to authenticated using (true);
create policy "Allow authenticated all radar_latency_records" on public.radar_latency_records for all to authenticated using (true);

create policy "Allow authenticated read radar_pipeline_runs" on public.radar_pipeline_runs for select to authenticated using (true);
create policy "Allow authenticated all radar_pipeline_runs" on public.radar_pipeline_runs for all to authenticated using (true);

-- Indexes
create index if not exists idx_radar_health_status on public.radar_source_health(status);
create index if not exists idx_radar_fingerprints_seen on public.radar_content_fingerprints(last_seen_at);
create index if not exists idx_radar_pipeline_runs_time on public.radar_pipeline_runs(generated_at);
