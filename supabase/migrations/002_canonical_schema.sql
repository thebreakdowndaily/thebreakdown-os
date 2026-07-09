-- The Breakdown OS — Migration 002: Canonical Schema
-- Replaces flat TEXT-PK tables with proper normalized, versioned, multi-schema design.
-- Drops prior tables (001) and rebuilds under public, editorial, graph, audit, identity, search schemas.

-- ═══════════════════════════════════════════════════════════════════════════
-- Drop old tables from 001
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS dataset_observations CASCADE;
DROP TABLE IF EXISTS dataset_series CASCADE;
DROP TABLE IF EXISTS dataset_dimensions CASCADE;
DROP TABLE IF EXISTS dataset_metrics CASCADE;
DROP TABLE IF EXISTS dataset_versions CASCADE;
DROP TABLE IF EXISTS dataset_visualizations CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS fixes CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS media_items CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- Extension setup
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════
-- Enums
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE entity_kind AS ENUM (
  'person', 'organization', 'policy', 'scheme', 'budget',
  'report', 'dataset', 'source', 'country'
);

CREATE TYPE story_status AS ENUM (
  'draft', 'review', 'fact_check', 'scheduled', 'published', 'updated'
);

CREATE TYPE relation_type AS ENUM (
  'mentions', 'belongs_to', 'implemented_by', 'announced_by',
  'funded_by', 'affects', 'related_to', 'part_of', 'located_in',
  'published_by', 'criticized_by', 'supports', 'opposes',
  'covers', 'analyzes', 'references'
);

CREATE TYPE confidence_tier AS ENUM ('t1', 't2', 't3', 't4', 't5');

CREATE TYPE claim_status AS ENUM ('verified', 'strong', 'moderate', 'unverified', 'disputed');

CREATE TYPE media_type AS ENUM ('image', 'video', 'chart', 'document', 'svg', 'map');

CREATE TYPE dataset_category AS ENUM (
  'economy', 'climate', 'health', 'education', 'demographics',
  'energy', 'trade', 'governance', 'technology', 'military',
  'infrastructure', 'social', 'environment', 'finance'
);

CREATE TYPE dataset_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'adhoc');

CREATE TYPE data_type AS ENUM ('number', 'percentage', 'currency', 'ratio', 'index', 'count', 'text');

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'writer', 'researcher', 'designer', 'reader');

CREATE TYPE event_type AS ENUM (
  'story:created', 'story:updated', 'story:published', 'story:deleted',
  'topic:created', 'topic:updated', 'topic:deleted',
  'entity:created', 'entity:updated', 'entity:deleted',
  'timeline:created', 'timeline:updated', 'timeline:deleted',
  'fix:created', 'fix:updated', 'fix:deleted',
  'dataset:created', 'dataset:updated', 'dataset:deleted',
  'media:uploaded', 'media:updated', 'media:deleted',
  'search:indexed', 'graph:updated'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: public — Core content
-- ═══════════════════════════════════════════════════════════════════════════

-- Stories
CREATE TABLE public.stories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id     TEXT,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  headline      TEXT NOT NULL DEFAULT '',
  summary       TEXT NOT NULL DEFAULT '',
  hero_image    TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT '',
  status        story_status NOT NULL DEFAULT 'draft',
  evidence_score REAL NOT NULL DEFAULT 0,
  reading_time  INT NOT NULL DEFAULT 0,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  blocks        JSONB NOT NULL DEFAULT '[]',
  faq           JSONB NOT NULL DEFAULT '[]',
  notes         TEXT,
  version       INT NOT NULL DEFAULT 1,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID,

  CONSTRAINT uq_stories_slug UNIQUE (slug)
);

-- Topics
CREATE TABLE public.topics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id     TEXT,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  overview      TEXT,
  image         TEXT NOT NULL DEFAULT '',
  countries     TEXT[] NOT NULL DEFAULT '{}',
  faq           JSONB NOT NULL DEFAULT '[]',
  statistics    JSONB NOT NULL DEFAULT '[]',
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID,

  CONSTRAINT uq_topics_slug UNIQUE (slug)
);

-- Entities
CREATE TABLE public.entities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id       TEXT,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  type            entity_kind NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  aliases         TEXT[] NOT NULL DEFAULT '{}',
  image           TEXT NOT NULL DEFAULT '',
  story_count     INT NOT NULL DEFAULT 0,
  evidence_score  REAL NOT NULL DEFAULT 0,
  statistics      JSONB NOT NULL DEFAULT '[]',
  timeline        JSONB NOT NULL DEFAULT '[]',
  faq             JSONB NOT NULL DEFAULT '[]',
  version         INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID,

  CONSTRAINT uq_entities_slug UNIQUE (slug)
);

-- Timelines
CREATE TABLE public.timelines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id     TEXT,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT '',
  events        JSONB NOT NULL DEFAULT '[]',
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID,

  CONSTRAINT uq_timelines_slug UNIQUE (slug)
);

-- Fixes
CREATE TABLE public.fixes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id           TEXT,
  slug                TEXT NOT NULL,
  title               TEXT NOT NULL,
  problem             TEXT NOT NULL DEFAULT '',
  root_causes         JSONB NOT NULL DEFAULT '[]',
  existing_solutions  JSONB NOT NULL DEFAULT '[]',
  global_examples     JSONB NOT NULL DEFAULT '[]',
  recommended_actions JSONB NOT NULL DEFAULT '[]',
  citizen_actions     JSONB NOT NULL DEFAULT '[]',
  government_actions  JSONB NOT NULL DEFAULT '[]',
  metrics             JSONB NOT NULL DEFAULT '[]',
  status              story_status NOT NULL DEFAULT 'draft',
  version             INT NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by          UUID,

  CONSTRAINT uq_fixes_slug UNIQUE (slug)
);

-- Media items
CREATE TABLE public.media_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL,
  type        media_type NOT NULL,
  src         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  caption     TEXT NOT NULL DEFAULT '',
  credit      TEXT NOT NULL DEFAULT '',
  width       INT,
  height      INT,
  file_size   INT,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  version     INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID,

  CONSTRAINT uq_media_slug UNIQUE (slug)
);

-- Datasets
CREATE TABLE public.datasets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  category            dataset_category,
  frequency           dataset_frequency,
  unit_label          TEXT NOT NULL DEFAULT '',
  source              TEXT NOT NULL DEFAULT '',
  source_url          TEXT NOT NULL DEFAULT '',
  methodology         TEXT NOT NULL DEFAULT '',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  version             INT NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by          UUID,

  CONSTRAINT uq_datasets_slug UNIQUE (slug)
);

CREATE TABLE public.dataset_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id  UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  version     TEXT NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dataset_metrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id    UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  data_type     data_type NOT NULL DEFAULT 'number',
  unit          TEXT NOT NULL DEFAULT '',
  decimal_places INT NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.dataset_dimensions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id  UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  label       TEXT NOT NULL,
  values      TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE public.dataset_series (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id        UUID NOT NULL REFERENCES public.dataset_versions(id) ON DELETE CASCADE,
  metric_id         UUID NOT NULL REFERENCES public.dataset_metrics(id) ON DELETE CASCADE,
  dimension_filters JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE public.dataset_observations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id   UUID NOT NULL REFERENCES public.dataset_series(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,
  value       REAL,
  annotation  TEXT
);

CREATE TABLE public.dataset_visualizations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id        UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  type              TEXT NOT NULL,
  metric_ids        TEXT[] NOT NULL DEFAULT '{}',
  dimension_filter  JSONB,
  config            JSONB NOT NULL DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Relationship tables (normalized many-to-many)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.story_topics (
  story_id  UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  topic_id  UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,

  PRIMARY KEY (story_id, topic_id)
);

CREATE TABLE public.story_entities (
  story_id    UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  entity_id   UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,

  PRIMARY KEY (story_id, entity_id)
);

CREATE TABLE public.topic_entities (
  topic_id    UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  entity_id   UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,

  PRIMARY KEY (topic_id, entity_id)
);

CREATE TABLE public.story_timelines (
  story_id    UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  timeline_id UUID NOT NULL REFERENCES public.timelines(id) ON DELETE CASCADE,

  PRIMARY KEY (story_id, timeline_id)
);

CREATE TABLE public.entity_relationships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  relation        relation_type NOT NULL,
  confidence      REAL NOT NULL DEFAULT 1.0,
  metadata        JSONB,

  CONSTRAINT uq_entity_relationship UNIQUE (source_entity_id, target_entity_id, relation)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: editorial — Claims, evidence, sources, citations
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS editorial;

CREATE TABLE editorial.sources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT '',
  tier         confidence_tier NOT NULL DEFAULT 't3',
  description  TEXT NOT NULL DEFAULT '',
  publisher    TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  accessed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE editorial.claims (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim         TEXT NOT NULL,
  data          TEXT NOT NULL DEFAULT '',
  source_text   TEXT NOT NULL DEFAULT '',
  status        claim_status NOT NULL DEFAULT 'unverified',
  confidence    REAL NOT NULL DEFAULT 0,
  explanation   TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE editorial.claim_citations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id    UUID NOT NULL REFERENCES editorial.claims(id) ON DELETE CASCADE,
  source_id   UUID NOT NULL REFERENCES editorial.sources(id) ON DELETE CASCADE,
  relevance   TEXT NOT NULL DEFAULT 'supports',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_claim_citation UNIQUE (claim_id, source_id)
);

CREATE TABLE editorial.story_claims (
  story_id  UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  claim_id  UUID NOT NULL REFERENCES editorial.claims(id) ON DELETE CASCADE,

  PRIMARY KEY (story_id, claim_id)
);

CREATE TABLE editorial.evidence_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id      UUID NOT NULL REFERENCES editorial.claims(id) ON DELETE CASCADE,
  source_id     UUID REFERENCES editorial.sources(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL DEFAULT 'supporting',
  content       TEXT NOT NULL DEFAULT '',
  weight        REAL NOT NULL DEFAULT 1.0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: graph — Knowledge graph projection
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS graph;

CREATE TABLE graph.nodes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_type  TEXT NOT NULL,
  ref_id    TEXT NOT NULL,
  title     TEXT NOT NULL,
  slug      TEXT NOT NULL,
  subtype   TEXT,
  weight    REAL NOT NULL DEFAULT 1.0,
  metadata  JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_graph_node UNIQUE (ref_type, ref_id)
);

CREATE TABLE graph.edges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id   UUID NOT NULL REFERENCES graph.nodes(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL REFERENCES graph.nodes(id) ON DELETE CASCADE,
  relation    relation_type NOT NULL,
  confidence  REAL NOT NULL DEFAULT 1.0,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_graph_edge UNIQUE (source_id, target_id, relation)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: audit — Versioning and activity log
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.story_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id    UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  version     INT NOT NULL,
  snapshot    JSONB NOT NULL,
  created_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_story_version UNIQUE (story_id, version)
);

CREATE TABLE audit.activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  event_type NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  entity_slug TEXT NOT NULL DEFAULT '',
  user_id     UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: identity — Users and auth
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'reader',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE identity.reader_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  bio         TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT uq_reader_profile UNIQUE (user_id)
);

CREATE TABLE identity.bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  story_id    UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  story_slug  TEXT NOT NULL,
  story_title TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.reading_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  story_id    UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  story_slug  TEXT NOT NULL,
  story_title TEXT NOT NULL,
  progress    REAL NOT NULL DEFAULT 0,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  entity_id    TEXT,
  entity_type  TEXT,
  entity_slug  TEXT,
  entity_name  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema: search — Full-text search index
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS search;

CREATE TABLE search.index_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_type    TEXT NOT NULL,
  ref_id      TEXT NOT NULL,
  ref_slug    TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  score       REAL NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_search_entry UNIQUE (ref_type, ref_id)
);

CREATE INDEX idx_search_entries_ref ON search.index_entries(ref_type, ref_id);
CREATE INDEX idx_search_entries_fts ON search.index_entries USING GIN(to_tsvector('english', title || ' ' || description || ' ' || content));

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_stories_slug ON public.stories(slug);
CREATE INDEX idx_stories_status ON public.stories(status);
CREATE INDEX idx_stories_published_at ON public.stories(published_at DESC);
CREATE INDEX idx_stories_category ON public.stories(category);
CREATE INDEX idx_stories_tags ON public.stories USING GIN(tags);

CREATE INDEX idx_topics_slug ON public.topics(slug);
CREATE INDEX idx_topics_name ON public.topics(name);

CREATE INDEX idx_entities_slug ON public.entities(slug);
CREATE INDEX idx_entities_type ON public.entities(type);
CREATE INDEX idx_entities_name ON public.entities(name);
CREATE INDEX idx_entities_aliases ON public.entities USING GIN(aliases);

CREATE INDEX idx_timelines_slug ON public.timelines(slug);
CREATE INDEX idx_fixes_slug ON public.fixes(slug);
CREATE INDEX idx_media_slug ON public.media_items(slug);
CREATE INDEX idx_media_type ON public.media_items(type);
CREATE INDEX idx_datasets_slug ON public.datasets(slug);

CREATE INDEX idx_story_topics_story ON public.story_topics(story_id);
CREATE INDEX idx_story_topics_topic ON public.story_topics(topic_id);
CREATE INDEX idx_story_entities_story ON public.story_entities(story_id);
CREATE INDEX idx_story_entities_entity ON public.story_entities(entity_id);
CREATE INDEX idx_topic_entities_topic ON public.topic_entities(topic_id);
CREATE INDEX idx_topic_entities_entity ON public.topic_entities(entity_id);
CREATE INDEX idx_story_timelines_story ON public.story_timelines(story_id);
CREATE INDEX idx_story_timelines_timeline ON public.story_timelines(timeline_id);
CREATE INDEX idx_entity_relationships_source ON public.entity_relationships(source_entity_id);
CREATE INDEX idx_entity_relationships_target ON public.entity_relationships(target_entity_id);

CREATE INDEX idx_claim_citations_claim ON editorial.claim_citations(claim_id);
CREATE INDEX idx_claim_citations_source ON editorial.claim_citations(source_id);
CREATE INDEX idx_story_claims_story ON editorial.story_claims(story_id);
CREATE INDEX idx_story_claims_claim ON editorial.story_claims(claim_id);
CREATE INDEX idx_evidence_items_claim ON editorial.evidence_items(claim_id);

CREATE INDEX idx_graph_nodes_ref ON graph.nodes(ref_type, ref_id);
CREATE INDEX idx_graph_edges_source ON graph.edges(source_id);
CREATE INDEX idx_graph_edges_target ON graph.edges(target_id);
CREATE INDEX idx_graph_edges_relation ON graph.edges(relation);

CREATE INDEX idx_activity_log_event ON audit.activity_log(event_type);
CREATE INDEX idx_activity_log_entity ON audit.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON audit.activity_log(created_at DESC);

CREATE INDEX idx_bookmarks_user ON identity.bookmarks(user_id);
CREATE INDEX idx_reading_history_user ON identity.reading_history(user_id);
CREATE INDEX idx_follows_user ON identity.follows(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Auto-update trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl text;
  schemas text[] := ARRAY['public'];
  sch text;
BEGIN
  FOREACH sch IN ARRAY schemas
  LOOP
    FOR tbl IN
      SELECT tablename FROM pg_tables
      WHERE schemaname = sch AND tablename NOT LIKE 'dataset_%'
    LOOP
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
        tbl, sch, tbl
      );
    END LOOP;
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Version bump trigger for stories
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION bump_story_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stories_version_bump
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION bump_story_version();

-- ═══════════════════════════════════════════════════════════════════════════
-- Story version archival on update
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION archive_story_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.story_versions (story_id, version, snapshot, created_by)
  VALUES (OLD.id, OLD.version, row_to_json(OLD), OLD.updated_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stories_archive
  AFTER UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION archive_story_version();
