-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Migration 014: Editorial Calendar & Scheduled Publishing
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add scheduling columns to the existing stories table
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_by TEXT,
  ADD COLUMN IF NOT EXISTS block_reason TEXT,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fallback_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stories_scheduled_at ON public.stories(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_status_scheduled ON public.stories(status) WHERE status = 'scheduled';

-- 2. Editorial Schedule — the calendar itself
CREATE TABLE IF NOT EXISTS public.editorial_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_position SMALLINT NOT NULL DEFAULT 1 CHECK (slot_position BETWEEN 1 AND 7),
  priority SMALLINT NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  category TEXT NOT NULL DEFAULT 'explainer',
  rationale TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned',      -- assigned to slot, story not yet written
    'in_progress',  -- writer actively working
    'ready',        -- story complete, awaiting validation
    'validated',    -- publication gate passed
    'published',    -- successfully published
    'blocked',      -- gate failed, blocked with reason
    'skipped',      -- intentionally not published (e.g., event cancelled)
    'rescheduled'   -- moved to a different slot
  )),
  validated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,
  block_reason TEXT,
  fallback_schedule_id UUID REFERENCES public.editorial_schedule(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One story per slot position per date
  CONSTRAINT uq_schedule_slot UNIQUE (slot_date, slot_position),
  -- One slot per story per week
  CONSTRAINT uq_schedule_story UNIQUE (story_id, slot_date)
);

CREATE INDEX IF NOT EXISTS idx_editorial_schedule_date ON public.editorial_schedule(slot_date);
CREATE INDEX IF NOT EXISTS idx_editorial_schedule_status ON public.editorial_schedule(status);
CREATE INDEX IF NOT EXISTS idx_editorial_schedule_story_id ON public.editorial_schedule(story_id);

-- 3. Publication Gate Log — auditable record of every gate check
CREATE TABLE IF NOT EXISTS public.publication_gate_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.editorial_schedule(id) ON DELETE SET NULL,
  gate_result TEXT NOT NULL CHECK (gate_result IN ('pass', 'fail')),
  checks JSONB NOT NULL DEFAULT '[]',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  triggered_by TEXT NOT NULL DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual', 'fallback'))
);

CREATE INDEX IF NOT EXISTS idx_gate_log_story_id ON public.publication_gate_log(story_id);
CREATE INDEX IF NOT EXISTS idx_gate_log_checked_at ON public.publication_gate_log(checked_at DESC);

-- 4. Triggers
CREATE TRIGGER trg_editorial_schedule_updated_at
BEFORE UPDATE ON public.editorial_schedule
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS SECURITY PASS
-- ═══════════════════════════════════════════════════════════════════════════

-- editorial_schedule: internal read/write, no anon access (editorial tool)
ALTER TABLE public.editorial_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_editorial_schedule ON public.editorial_schedule
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator')
);
CREATE POLICY internal_insert_editorial_schedule ON public.editorial_schedule
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator')
);
CREATE POLICY internal_update_editorial_schedule ON public.editorial_schedule
FOR UPDATE USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator')
) WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator')
);

-- publication_gate_log: internal read, service-role write (cron uses service key)
ALTER TABLE public.publication_gate_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_read_gate_log ON public.publication_gate_log
FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator')
);
CREATE POLICY internal_insert_gate_log ON public.publication_gate_log
FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
    IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
);
