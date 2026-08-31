# TASK-25 — DYNAMIC TRUST COMPUTATION & FRESHNESS BADGES

Current Ticket:
TASK-25

Status:
Completed

Objective:
Implement dynamic trust metrics calculations (average trust score, evidence debt, last verified date), integrate homepage TrustBar, upgrade trust dashboard to display live values, and add proper freshness/verification badges to Fixes and Datasets.

Blocked By:
None

Depends On:
Frozen MVP Specification v1.1

Acceptance Criteria:
✓ Dynamic trust metrics calculated safely in `lib/knowledge/trust-metrics.ts`
✓ Homepage TrustBar integrated under Hero with dynamic fallbacks
✓ Trust Dashboard (/trust) updated to show computed values without hardcoded defaults
✓ FixHeroStrip verified/updated freshness badges implemented dynamically
✓ DatasetHero verified/updated freshness badges implemented dynamically
✓ Unit tests added and passing cleanly in `tests/trust-metrics.test.ts`
✓ Full test suite and TypeScript compilations passing cleanly

Definition of Done:
All acceptance criteria satisfied.
No scope expansion.
