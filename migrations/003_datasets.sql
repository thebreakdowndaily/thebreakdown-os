-- ─── The Breakdown OS — Dataset Database Schema ──────────────────────────────
-- Sprint 16: Dataset & Intelligence Engine

CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'annual',
  unit_label TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  methodology TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  related_entity_ids TEXT NOT NULL DEFAULT '[]',
  related_story_ids TEXT NOT NULL DEFAULT '[]',
  related_topic_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS dataset_metrics (
  id TEXT NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  data_type TEXT NOT NULL DEFAULT 'number',
  unit TEXT NOT NULL DEFAULT '',
  decimal_places INTEGER NOT NULL DEFAULT 1,
  is_primary INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, dataset_id)
);

CREATE TABLE IF NOT EXISTS dataset_dimensions (
  id TEXT NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  values TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (id, dataset_id)
);

CREATE TABLE IF NOT EXISTS dataset_series (
  id TEXT NOT NULL,
  version_id TEXT NOT NULL REFERENCES dataset_versions(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  dimension_filters TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, version_id)
);

CREATE TABLE IF NOT EXISTS dataset_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  series_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  period TEXT NOT NULL,
  value REAL,
  annotation TEXT,
  FOREIGN KEY (series_id, version_id) REFERENCES dataset_series(id, version_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dataset_visualizations (
  id TEXT NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'line',
  metric_ids TEXT NOT NULL DEFAULT '[]',
  dimension_filter TEXT,
  config TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, dataset_id)
);

CREATE TABLE IF NOT EXISTS dataset_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  tier INTEGER NOT NULL DEFAULT 3,
  type TEXT NOT NULL DEFAULT 'primary',
  accessed_at TEXT
);

CREATE TABLE IF NOT EXISTS dataset_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'csv',
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  download_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_datasets_slug ON datasets(slug);
CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);
CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset ON dataset_versions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_observations_series ON dataset_observations(series_id, version_id);
CREATE INDEX IF NOT EXISTS idx_dataset_observations_period ON dataset_observations(period);
