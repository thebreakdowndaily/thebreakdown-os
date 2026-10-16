-- Bounded public topic summaries. Counts remain exact while only two story
-- previews per topic are serialized; the route no longer downloads every story.
BEGIN;

CREATE INDEX IF NOT EXISTS idx_stories_related_topic_ids_gin
  ON public.stories USING GIN (related_topic_ids);

CREATE INDEX IF NOT EXISTS idx_story_topics_topic_story
  ON public.story_topics (topic_id, story_id);

CREATE OR REPLACE FUNCTION public.list_public_topic_summaries(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  topic_id UUID,
  topic_slug TEXT,
  topic_name TEXT,
  topic_description TEXT,
  story_count BIGINT,
  recent_stories JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH topic_rows AS (
    SELECT t.id, t.slug, t.name, t.description, t.story_ids, t.featured_story_ids
    FROM public.topics t
    ORDER BY t.name
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 100))
  )
  SELECT
    t.id,
    t.slug,
    t.name,
    t.description,
    (
      SELECT count(DISTINCT s.id)
      FROM public.stories s
      WHERE s.status = 'published'
        AND s.is_test_artifact = false
        AND s.published_at IS NOT NULL
        AND s.published_at <= now()
        AND (
          s.related_topic_ids @> ARRAY[t.id::text]
          OR s.related_topic_ids @> ARRAY[t.slug]
          OR t.story_ids @> ARRAY[s.id::text]
          OR t.story_ids @> ARRAY[s.slug]
          OR t.featured_story_ids @> ARRAY[s.id::text]
          OR t.featured_story_ids @> ARRAY[s.slug]
          OR EXISTS (
            SELECT 1
            FROM public.story_topics st
            WHERE st.topic_id = t.id
              AND st.story_id = s.id
          )
        )
    ) AS story_count,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'slug', recent.slug,
          'headline', recent.headline,
          'published_at', recent.published_at
        )
        ORDER BY recent.published_at DESC, recent.id
      )
      FROM (
        SELECT s.id, s.slug, s.headline, s.published_at
        FROM public.stories s
        WHERE s.status = 'published'
          AND s.is_test_artifact = false
          AND s.published_at IS NOT NULL
          AND s.published_at <= now()
          AND (
            s.related_topic_ids @> ARRAY[t.id::text]
            OR s.related_topic_ids @> ARRAY[t.slug]
            OR t.story_ids @> ARRAY[s.id::text]
            OR t.story_ids @> ARRAY[s.slug]
            OR t.featured_story_ids @> ARRAY[s.id::text]
            OR t.featured_story_ids @> ARRAY[s.slug]
            OR EXISTS (
              SELECT 1
              FROM public.story_topics st
              WHERE st.topic_id = t.id
                AND st.story_id = s.id
            )
          )
        ORDER BY s.published_at DESC, s.id
        LIMIT 2
      ) recent
    ), '[]'::jsonb) AS recent_stories
  FROM topic_rows t
  ORDER BY t.name;
$$;

REVOKE ALL ON FUNCTION public.list_public_topic_summaries(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_topic_summaries(INTEGER) TO anon, authenticated;

COMMIT;
