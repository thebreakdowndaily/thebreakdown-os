-- Public API compatibility views for canonical editorial/search schemas.
-- Keep editorial records private by default and expose only evidence attached to
-- currently public, non-test stories. Writes go through permission-checking RPCs.
BEGIN;

-- Search index: expose a reader-safe projection without requiring the private
-- schema itself to be configured as a PostgREST API schema.
ALTER TABLE search.index_entries
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_search_entries_search_vector
  ON search.index_entries USING GIN (search_vector);

GRANT USAGE ON SCHEMA search TO anon, authenticated;
GRANT SELECT ON search.index_entries TO anon, authenticated;

CREATE OR REPLACE VIEW public.index_entries
WITH (security_invoker = true)
AS
SELECT
  id,
  ref_type,
  ref_id,
  ref_slug,
  title,
  description,
  content,
  tags,
  score,
  updated_at,
  search_vector
FROM search.index_entries;

GRANT SELECT ON public.index_entries TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, REFERENCES, TRIGGER
  ON public.index_entries FROM anon, authenticated;

-- The canonical editorial tables are not directly exposed as public API tables.
-- RLS filters them to verified evidence attached to published, non-test stories.
ALTER TABLE editorial.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial.claim_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial.story_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_story_claim_links ON editorial.story_claims;
CREATE POLICY public_read_story_claim_links
  ON editorial.story_claims FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.stories s
      WHERE s.id = story_claims.story_id
        AND s.status = 'published'
        AND s.is_test_artifact = false
        AND s.published_at IS NOT NULL
        AND s.published_at <= now()
    )
  );

DROP POLICY IF EXISTS public_read_verified_story_claims ON editorial.claims;
CREATE POLICY public_read_verified_story_claims
  ON editorial.claims FOR SELECT TO anon, authenticated
  USING (
    status IN ('verified', 'strong', 'moderate')
    AND EXISTS (
      SELECT 1
      FROM editorial.story_claims sc
      JOIN public.stories s ON s.id = sc.story_id
      WHERE sc.claim_id = claims.id
        AND s.status = 'published'
        AND s.is_test_artifact = false
        AND s.published_at IS NOT NULL
        AND s.published_at <= now()
    )
  );

DROP POLICY IF EXISTS public_read_citations_for_public_claims ON editorial.claim_citations;
CREATE POLICY public_read_citations_for_public_claims
  ON editorial.claim_citations FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM editorial.claims c
      JOIN editorial.story_claims sc ON sc.claim_id = c.id
      JOIN public.stories s ON s.id = sc.story_id
      WHERE c.id = claim_citations.claim_id
        AND c.status IN ('verified', 'strong', 'moderate')
        AND s.status = 'published'
        AND s.is_test_artifact = false
        AND s.published_at IS NOT NULL
        AND s.published_at <= now()
    )
  );

DROP POLICY IF EXISTS public_read_sources_for_public_claims ON editorial.sources;
CREATE POLICY public_read_sources_for_public_claims
  ON editorial.sources FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM editorial.claim_citations cc
      JOIN editorial.claims c ON c.id = cc.claim_id
      JOIN editorial.story_claims sc ON sc.claim_id = c.id
      JOIN public.stories s ON s.id = sc.story_id
      WHERE cc.source_id = sources.id
        AND c.status IN ('verified', 'strong', 'moderate')
        AND s.status = 'published'
        AND s.is_test_artifact = false
        AND s.published_at IS NOT NULL
        AND s.published_at <= now()
    )
  );

GRANT USAGE ON SCHEMA editorial TO anon, authenticated;
GRANT SELECT ON editorial.claims, editorial.sources, editorial.claim_citations, editorial.story_claims
  TO anon, authenticated;

-- Preserve authenticated staff read access to internal editorial records while
-- keeping the public views constrained to published evidence relationships.
DROP POLICY IF EXISTS staff_read_editorial_claims ON editorial.claims;
CREATE POLICY staff_read_editorial_claims ON editorial.claims
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS staff_read_editorial_sources ON editorial.sources;
CREATE POLICY staff_read_editorial_sources ON editorial.sources
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS staff_read_editorial_claim_citations ON editorial.claim_citations;
CREATE POLICY staff_read_editorial_claim_citations ON editorial.claim_citations
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS staff_read_editorial_story_claims ON editorial.story_claims;
CREATE POLICY staff_read_editorial_story_claims ON editorial.story_claims
  FOR SELECT TO authenticated USING (public.is_staff());

CREATE OR REPLACE VIEW public.claims
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.claim,
  c.data,
  c.source_text,
  c.status,
  c.confidence,
  c.explanation,
  c.created_at,
  c.updated_at
FROM editorial.claims c
WHERE c.status IN ('verified', 'strong', 'moderate')
  AND EXISTS (
    SELECT 1
    FROM editorial.story_claims sc
    JOIN public.stories s ON s.id = sc.story_id
    WHERE sc.claim_id = c.id
      AND s.status = 'published'
      AND s.is_test_artifact = false
      AND s.published_at IS NOT NULL
      AND s.published_at <= now()
  );

CREATE OR REPLACE VIEW public.sources
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.title,
  s.url,
  s.type,
  s.tier,
  s.description,
  s.publisher,
  s.published_at,
  s.accessed_at,
  s.created_at,
  s.updated_at
FROM editorial.sources s
WHERE EXISTS (
  SELECT 1
  FROM editorial.claim_citations cc
  JOIN editorial.claims c ON c.id = cc.claim_id
  JOIN editorial.story_claims sc ON sc.claim_id = c.id
  JOIN public.stories st ON st.id = sc.story_id
  WHERE cc.source_id = s.id
    AND c.status IN ('verified', 'strong', 'moderate')
    AND st.status = 'published'
    AND st.is_test_artifact = false
    AND st.published_at IS NOT NULL
    AND st.published_at <= now()
);

GRANT SELECT ON public.claims, public.sources TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, REFERENCES, TRIGGER
  ON public.claims, public.sources FROM anon, authenticated;

-- Writes are deliberately narrow, session-authenticated and never publish a
-- claim implicitly. New claims start unverified; sources remain non-public
-- until linked to a qualifying public claim.
CREATE OR REPLACE FUNCTION public.create_editorial_claim(
  p_claim TEXT,
  p_data TEXT DEFAULT '',
  p_source_text TEXT DEFAULT '',
  p_explanation TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, editorial
AS $$
DECLARE
  row_data editorial.claims;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff() THEN
    RAISE EXCEPTION 'Insufficient privileges' USING ERRCODE = '42501';
  END IF;
  IF p_claim IS NULL OR length(btrim(p_claim)) = 0 THEN
    RAISE EXCEPTION 'Claim text is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO editorial.claims (claim, data, source_text, status, confidence, explanation)
  VALUES (btrim(p_claim), coalesce(p_data, ''), coalesce(p_source_text, ''), 'unverified', 0, coalesce(p_explanation, ''))
  RETURNING * INTO row_data;

  RETURN jsonb_build_object(
    'id', row_data.id,
    'claim', row_data.claim,
    'data', row_data.data,
    'source_text', row_data.source_text,
    'status', row_data.status,
    'confidence', row_data.confidence,
    'explanation', row_data.explanation,
    'created_at', row_data.created_at,
    'updated_at', row_data.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_editorial_source(
  p_title TEXT,
  p_url TEXT,
  p_type TEXT DEFAULT '',
  p_tier TEXT DEFAULT 't3',
  p_description TEXT DEFAULT '',
  p_publisher TEXT DEFAULT '',
  p_published_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, editorial
AS $$
DECLARE
  row_data editorial.sources;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor() THEN
    RAISE EXCEPTION 'Insufficient privileges' USING ERRCODE = '42501';
  END IF;
  IF p_title IS NULL OR length(btrim(p_title)) = 0 OR p_url IS NULL OR length(btrim(p_url)) = 0 THEN
    RAISE EXCEPTION 'Source title and URL are required' USING ERRCODE = '22023';
  END IF;
  IF btrim(p_url) !~* '^https?://' THEN
    RAISE EXCEPTION 'Source URL must use HTTP or HTTPS' USING ERRCODE = '22023';
  END IF;
  IF p_tier NOT IN ('t1', 't2', 't3', 't4', 't5') THEN
    RAISE EXCEPTION 'Invalid source tier' USING ERRCODE = '22023';
  END IF;

  INSERT INTO editorial.sources (title, url, type, tier, description, publisher, published_at)
  VALUES (btrim(p_title), btrim(p_url), coalesce(p_type, ''), p_tier::confidence_tier,
          coalesce(p_description, ''), coalesce(p_publisher, ''), p_published_at)
  RETURNING * INTO row_data;

  RETURN jsonb_build_object(
    'id', row_data.id,
    'title', row_data.title,
    'url', row_data.url,
    'type', row_data.type,
    'tier', row_data.tier,
    'description', row_data.description,
    'publisher', row_data.publisher,
    'published_at', row_data.published_at,
    'accessed_at', row_data.accessed_at,
    'created_at', row_data.created_at,
    'updated_at', row_data.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_editorial_claim(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_editorial_claim(TEXT, TEXT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.create_editorial_source(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_editorial_source(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;

COMMIT;
