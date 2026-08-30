Current Ticket:
TASK-23 — Citation & External Reference System

Status:
Complete (implementation verified, tests passing)

Objective:
Build a Citation system that allows editors to attach external references to stories. Citations are editor-managed (create/approve/reject), separate from backlinks, and limited to 10 approved per story. No automatic Evidence Score manipulation.

Blocked By:
None

Depends On:
- Frozen MVP Specification v1.1
- Existing Service Layer / Repository Pattern / Registry architecture

Acceptance Criteria:
✓ Citation type defined in types/citation.ts with storySlug, title, url, accessedAt, tier, sourceId, archiveHash, status, note
✓ CitationService interface in services/interfaces/citation.ts
✓ MemoryCitationService in services/repositories/memory/citation.ts
✓ Repository factory integration (services/factory/repository.ts)
✓ Service registry integration (services/registry.ts) — citations field on Services interface
✓ Bootstrap integration (services/init.ts) — both initDefaultServices and initCanonicalServices
✓ Re-export from types/canonical.ts using `export type`
✓ Editor-only mutations (create/update/delete)
✓ Moderation workflow (pending → approved → rejected)
✓ Max 10 approved citations per story enforced
✓ URL validation (http/https only)
✓ Duplicate detection per story
✓ No automatic Evidence Score manipulation
✓ Citations ≠ backlinks (separate domain)

Definition of Done:
All acceptance criteria satisfied.
No scope expansion.
TypeScript compiles with 0 errors.
