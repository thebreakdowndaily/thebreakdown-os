# Instagram skill integration and validation

## What changed

Ten project-local skills were added under .agents/skills/ and catalogued in .agents/skills.md. Existing Instagram command and channel formatter files were not replaced.

## Validate

From the repository root:

1. Run python scripts/validate-skills.py.
2. Run git diff --check.
3. Inspect git status --short and the complete diff.
4. Exercise the skills with test drafts and synthetic example source briefs; do not publish content while testing.
5. Resolve the existing Instagram brand/format conflicts separately through the project's normal decision process.

## Known configuration conflict

The existing .opencode/commands/instagram.md specifies gold #D4A843, near-black #0A0A0F and text #F5F5F5, with Bebas Neue and Source Sans 3. The existing .opencode Instagram formatter also differs from the command in primary aspect ratio and slide-density guidance. Other notes may mention a black/grey/yellow palette. The new skills deliberately preserve this uncertainty: they require agents to flag conflicts instead of guessing or mutating brand files.

## Human approval gate

Skills produce drafts and review artifacts only. They do not publish, schedule, log into the account, manage credentials, send comments/DMs, or change account settings. READY FOR HUMAN APPROVAL is not a publishing authorization.
