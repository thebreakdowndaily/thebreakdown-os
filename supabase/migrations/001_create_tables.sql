-- The Breakdown OS — Database Migration 001
-- Creates all base tables with TEXT primary keys (to match mock data IDs)

-- 1. Stories
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  author_id TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Topics
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  related_entity_ids TEXT[] DEFAULT '{}',
  related_story_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Entities
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  image TEXT DEFAULT '',
  story_count INTEGER DEFAULT 0,
  evidence_score REAL DEFAULT 0,
  related_entity_ids TEXT[] DEFAULT '{}',
  related_story_ids TEXT[] DEFAULT '{}',
  related_topic_ids TEXT[] DEFAULT '{}',
  statistics JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Timelines
CREATE TABLE IF NOT EXISTS timelines (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  events JSONB DEFAULT '[]',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  story_ids TEXT[] DEFAULT '{}',
  entity_ids TEXT[] DEFAULT '{}',
  topic_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Fixes
CREATE TABLE IF NOT EXISTS fixes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  problem TEXT DEFAULT '',
  root_causes JSONB DEFAULT '[]',
  existing_solutions JSONB DEFAULT '[]',
  global_examples JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  citizen_actions JSONB DEFAULT '[]',
  government_actions JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Media items
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  credit TEXT DEFAULT '',
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Datasets
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  unit_label TEXT DEFAULT '',
  source TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  methodology TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  related_entity_ids TEXT[] DEFAULT '{}',
  related_story_ids TEXT[] DEFAULT '{}',
  related_topic_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dataset sub-tables (keep UUID for auto-generated sub-rows)
CREATE TABLE IF NOT EXISTS dataset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT REFERENCES datasets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  notes TEXT DEFAULT '',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataset_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  data_type TEXT DEFAULT 'number',
  unit TEXT DEFAULT '',
  decimal_places INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS dataset_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  values TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS dataset_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  metric_id UUID REFERENCES dataset_metrics(id) ON DELETE CASCADE,
  dimension_filters JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS dataset_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES dataset_series(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  value REAL,
  annotation TEXT
);

CREATE TABLE IF NOT EXISTS dataset_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT REFERENCES datasets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  metric_ids TEXT[] DEFAULT '{}',
  dimension_filter JSONB,
  config JSONB DEFAULT '{}'
);

-- 8. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','editor','writer','researcher','designer','viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  story_slug TEXT NOT NULL,
  story_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_fixes_slug ON fixes(slug);
CREATE INDEX IF NOT EXISTS idx_datasets_slug ON datasets(slug);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
