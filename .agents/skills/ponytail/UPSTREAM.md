# Ponytail upstream source and attribution

- Project: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
- Upstream URL: https://github.com/DietrichGebert/ponytail
- Pinned commit: [`09c434ab73ca43761c5d8b0c5d341926c2fba710`](https://github.com/DietrichGebert/ponytail/commit/09c434ab73ca43761c5d8b0c5d341926c2fba710)
- License: MIT; full upstream license text is stored in this directory as `LICENSE`.
- Integrated skills:
  - `ponytail` (`skills/ponytail/SKILL.md`)
  - `ponytail-review` (`skills/ponytail-review/SKILL.md`)
  - `ponytail-audit` (`skills/ponytail-audit/SKILL.md`)
  - `ponytail-debt` (`skills/ponytail-debt/SKILL.md`)
  - `ponytail-gain` (`skills/ponytail-gain/SKILL.md`)
  - `ponytail-help` (`skills/ponytail-help/SKILL.md`)

This is a vendored integration of the official Ponytail coding-agent skills into The Breakdown OS. Review diffs and compatibility notes before updating the pinned commit.

## Integration & Compatibility Notes

1. **Subordinate Engineering Contract:** Ponytail principles operate strictly within and subordinate to the repository's root `AGENTS.md` and `docs/editorial/editorial-constitution.md`.
2. **Editorial Protection:** No lean rule may be used to justify bypassing source verification, the Evidence Spine, editorial peer review, Gold Standard Review, or publication gates.
3. **Security Safeguards:** Database constraints, Row Level Security (RLS), atomic publishing gates (`fn_publish_story_with_audit`), migration safety, authorization checks, and secret containment cannot be skipped or simplified away.
4. **Architecture Boundaries:** The Breakdown OS enforces the Service Layer and Repository Pattern (`services/repositories/memory/` and `services/repositories/supabase/`). Audit skills must respect these dual-provider architecture patterns rather than classifying them as unneeded wrappers.
5. **No Runtime Dependencies:** This integration introduces pure agent skill workflows, documentation, and registry metadata. No npm dependencies, build scripts, migrations, or application code are modified.
