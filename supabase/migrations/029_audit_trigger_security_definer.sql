-- Fix Phase 4B-3S: archive_story_version failed for service_role without audit schema grants
-- Alter to SECURITY DEFINER with a hardened search path

CREATE OR REPLACE FUNCTION archive_story_version()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO audit.story_versions (story_id, version, snapshot, created_by)
  VALUES (OLD.id, OLD.version, row_to_json(OLD), OLD.updated_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
