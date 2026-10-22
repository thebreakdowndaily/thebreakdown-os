---
name: publication-safety
description: >
  Enforces fail-closed story publication, evidence and editorial gates, safe scheduling,
  atomic transitions, draft isolation, and protected production operations.
---

# Publication Safety

Use when story drafts, scheduling, editorial actions, public routes, feeds, search, sitemap, graph projections, or publication database operations change.

1. **Default to private.** Missing/unknown status means draft/not public. Draft, review, scheduled, archived, test, or invalid content must not leak to readers.
2. **Verify each egress.** Check story/topic pages, APIs, feeds, sitemap, search indexes, graph/entity projections, caching, and static generation.
3. **Require server-side authority.** Roles must be server-controlled. Never trust client-supplied actor, role, publication timestamp, evidence score, or gate result.
4. **Re-run gates at the write boundary.** UI state or earlier validation is not authorization. Enforce current evidence, editorial review, transition rules, and embargoes at the canonical service/RPC boundary.
5. **Keep writes atomic.** Use a transaction or fenced publication mechanism where multiple records must change together. Inspect database errors; never report success on a failed write.
6. **Make transitions auditable.** Record actor, time, decision, and reason through existing audit contracts. Retries must not bypass gates.
7. **Test positive and negative paths.** Cover authorized/unauthorized publish, missing evidence, failed validation, duplicate calls, database failure, and public-egress exclusion.
8. **Protect environments.** Do not publish, run live migrations, alter production/staging data, send external messages, or deploy without explicit authorization.

Passing tests confirms only the tested contract. Human editorial authorization remains separate where policy requires it.
