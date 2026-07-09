-- ─── The Breakdown OS — CMS Content Schema ────────────────────────────
-- Stories, Topics, Entities, Timelines, Fixes, Media, Users, Activity, Revisions

CREATE TABLE IF NOT EXISTS cms_stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  hero_image TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  blocks_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS cms_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  overview TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  story_ids TEXT NOT NULL DEFAULT '[]',
  related_entity_ids TEXT NOT NULL DEFAULT '[]',
  featured_story_ids TEXT NOT NULL DEFAULT '[]',
  countries TEXT NOT NULL DEFAULT '[]',
  faq TEXT NOT NULL DEFAULT '[]',
  timeline TEXT NOT NULL DEFAULT '[]',
  statistics TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'organization',
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  aliases TEXT NOT NULL DEFAULT '[]',
  image TEXT NOT NULL DEFAULT '',
  story_count INTEGER NOT NULL DEFAULT 0,
  evidence_score INTEGER NOT NULL DEFAULT 0,
  related_entity_ids TEXT NOT NULL DEFAULT '[]',
  related_story_ids TEXT NOT NULL DEFAULT '[]',
  related_topic_ids TEXT NOT NULL DEFAULT '[]',
  statistics TEXT NOT NULL DEFAULT '[]',
  timeline TEXT NOT NULL DEFAULT '[]',
  faq TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_timelines (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  story_ids TEXT NOT NULL DEFAULT '[]',
  entity_ids TEXT NOT NULL DEFAULT '[]',
  topic_ids TEXT NOT NULL DEFAULT '[]',
  events TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_fixes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  problem TEXT NOT NULL DEFAULT '',
  root_causes TEXT NOT NULL DEFAULT '[]',
  existing_solutions TEXT NOT NULL DEFAULT '[]',
  global_examples TEXT NOT NULL DEFAULT '[]',
  recommended_actions TEXT NOT NULL DEFAULT '[]',
  citizen_actions TEXT NOT NULL DEFAULT '[]',
  government_actions TEXT NOT NULL DEFAULT '[]',
  metrics TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_media (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'image',
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  credit TEXT NOT NULL DEFAULT '',
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'writer',
  avatar TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_activity (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  user_id TEXT,
  link TEXT
);

CREATE TABLE IF NOT EXISTS cms_revisions (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES cms_stories(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id TEXT,
  message TEXT NOT NULL DEFAULT ''
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_stories_slug ON cms_stories(slug);
CREATE INDEX IF NOT EXISTS idx_cms_stories_status ON cms_stories(status);
CREATE INDEX IF NOT EXISTS idx_cms_topics_slug ON cms_topics(slug);
CREATE INDEX IF NOT EXISTS idx_cms_entities_slug ON cms_entities(slug);
CREATE INDEX IF NOT EXISTS idx_cms_fixes_slug ON cms_fixes(slug);
CREATE INDEX IF NOT EXISTS idx_cms_activity_timestamp ON cms_activity(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_story ON cms_revisions(story_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_cms_media_tags ON cms_media(tags);
