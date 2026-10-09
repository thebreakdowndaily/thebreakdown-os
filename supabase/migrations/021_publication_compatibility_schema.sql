-- The Breakdown OS — Migration 021 (Publication Compatibility Schema)
-- Publication Compatibility & Repository Contract Schema Alignment
-- ═══════════════════════════════════════════════════════════════════════
-- Governing documents:
--   - AGENTS.md (Platform Beta Doctrine — Zero Unused Infrastructure)
--   - Editorial Constitution v1.1
--   - .planning/ADR-001-SUPABASE-DATA-MODEL.md (Hybrid CQRS Architecture)
--   - .planning/PHASE1_DATA_DELTA.md & .planning/PHASE1_DATA_INVENTORY.md
--
-- Objective:
--   Add the exact 18 missing denormalized projection columns + 1 quarantine
--   column required by Supabase repository implementations across:
--     * public.stories   (7 projection columns + is_test_artifact + index)
--     * public.topics    (4 projection columns)
--     * public.entities  (3 projection columns)
--     * public.timelines (3 projection columns)
--
-- Non-Destructive Guarantees:
--   * Pure additive schema migration.
--   * NO DROP TABLE, NO DROP COLUMN, NO TRUNCATE, NO DELETE.
--   * Safe defaults for all columns (existing rows remain fully readable).
--   * Zero DML data mutation (quarantining test records is deferred to separate script).
--   * Existing PostgreSQL triggers (trg_stories_version_bump, trg_stories_archive)
--     remain completely untouched and will not fire on column additions.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Table: public.stories
-- ─────────────────────────────────────────────────────────────────────────────
-- Repository Provenance: services/repositories/supabase/story.ts
-- Read mapping: lines 104-111 | Upsert mapping: lines 129-136

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS charts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_story_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_entity_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_topic_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_test_artifact BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.stories.sources IS 'Denormalized array of SourceRef objects cited in the story';
COMMENT ON COLUMN public.stories.claims IS 'Denormalized array of ClaimRef objects asserted in the story';
COMMENT ON COLUMN public.stories.timeline IS 'Denormalized chronological TimelineEvent objects for the story';
COMMENT ON COLUMN public.stories.charts IS 'Denormalized ChartRef objects associated with the story';
COMMENT ON COLUMN public.stories.related_story_ids IS 'Array of related canonical story slugs or IDs';
COMMENT ON COLUMN public.stories.related_entity_ids IS 'Array of related entity slugs or IDs';
COMMENT ON COLUMN public.stories.related_topic_ids IS 'Array of related topic slugs or IDs';
COMMENT ON COLUMN public.stories.is_test_artifact IS 'Quarantine flag: true marks historical synthetic/test fixtures to exclude from public feeds';

-- Index for quarantine filtering across public reads
CREATE INDEX IF NOT EXISTS idx_stories_test_artifact ON public.stories (is_test_artifact);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Table: public.topics
-- ─────────────────────────────────────────────────────────────────────────────
-- Repository Provenance: services/repositories/supabase/topic.ts
-- Read mapping: lines 59-64 | Upsert mapping: lines 79-86

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS story_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_entity_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_story_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timeline JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.topics.story_ids IS 'Array of associated story slugs or IDs';
COMMENT ON COLUMN public.topics.related_entity_ids IS 'Array of associated entity slugs or IDs';
COMMENT ON COLUMN public.topics.featured_story_ids IS 'Array of featured story slugs or IDs for topic curation';
COMMENT ON COLUMN public.topics.timeline IS 'Denormalized chronological TimelineEvent objects for the topic';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Table: public.entities
-- ─────────────────────────────────────────────────────────────────────────────
-- Repository Provenance: services/repositories/supabase/entity.ts
-- Read mapping: lines 68-70 | Upsert mapping: lines 90-92
-- Note: timeline already exists on public.entities in 002_canonical_schema.sql (L143)

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS related_story_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_entity_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_topic_ids TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.entities.related_story_ids IS 'Array of associated story slugs or IDs';
COMMENT ON COLUMN public.entities.related_entity_ids IS 'Array of associated entity slugs or IDs';
COMMENT ON COLUMN public.entities.related_topic_ids IS 'Array of associated topic slugs or IDs';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Table: public.timelines
-- ─────────────────────────────────────────────────────────────────────────────
-- Repository Provenance: services/repositories/supabase/timeline.ts
-- Read mapping: lines 51-53 | Upsert mapping: lines 66-68

ALTER TABLE public.timelines
  ADD COLUMN IF NOT EXISTS story_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entity_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topic_ids TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.timelines.story_ids IS 'Array of associated story slugs or IDs';
COMMENT ON COLUMN public.timelines.entity_ids IS 'Array of associated entity slugs or IDs';
COMMENT ON COLUMN public.timelines.topic_ids IS 'Array of associated topic slugs or IDs';
