# TASK-23 — Walkthrough: Citation & External Reference System

## Summary

TASK-23 implements the Citation & External Reference System for The Breakdown Knowledge Platform. This system enables editors to attach, moderate, and manage external citations linked to stories.

## Architecture

The citation system follows the established architecture pattern:

```
Citation (types/citation.ts)
→ CitationService (services/interfaces/citation.ts)
→ MemoryCitationService (services/repositories/memory/citation.ts)
→ RepositoryFactory (services/factory/repository.ts)
→ Services Registry (services/registry.ts)
→ Bootstrap (services/init.ts)
```

### Type Definition

`types/citation.ts` defines the `Citation` interface with:
- `id`, `storySlug`, `title`, `url`, `accessedAt`
- `tier` (1–5 confidence assigned by editor)
- `sourceId` (optional link to existing Source record)
- `archiveHash` (optional snapshot hash)
- `status`: `'pending' | 'approved' | 'rejected'`
- `note`, `createdAt`, `updatedAt`

Re-exported from `types/canonical.ts` via `export type { Citation } from './citation'`.

### Service Interface

`services/interfaces/citation.ts` provides:
- `listByStory(storySlug, includePending?)` → `APIResponse<Citation[]>`
- `getCitation(id)` → `Citation | undefined`
- `createCitation(citation)` → `Citation` (editor only)
- `updateCitation(id, updates)` → `Citation` (editor only)
- `deleteCitation(id)` → `void` (editor only)

### Memory Repository

`services/repositories/memory/citation.ts`:
- Primary Map storage keyed by id
- Secondary index for storySlug → Set<id>
- URL validation (http/https only)
- Duplicate detection per story
- Max 10 approved citations per story enforced on approval
- Status defaults to 'pending' on creation

### Integration Points

- **Registry**: `services/registry.ts` includes `citations: CitationService` on the `Services` interface
- **Factory**: `services/factory/repository.ts` has `getCitationRepository()` returning `MemoryCitationService`
- **Bootstrap**: Both `initDefaultServices` and `initCanonicalServices` in `services/init.ts` wire up `citations`

## Key Design Decisions

1. **Citations ≠ Backlinks**: Citations are editor-curated external references. They are a distinct domain from backlinks.
2. **Editor-only mutations**: Only editors can create, update, or delete citations. Public readers see only approved citations.
3. **No Evidence Score manipulation**: Adding citations does not automatically change a story's evidence score.
4. **Moderation workflow**: All citations start as `pending` and must be explicitly approved or rejected.
5. **10-citation cap**: A maximum of 10 approved citations per story prevents citation spam.

## TypeScript Error Fixes (2026-08-31 Synchronization)

During synchronization, the following errors were fixed:
- `services/registry.ts`: All service type imports had been stripped — restored 13 missing imports
- `types/canonical.ts`: Changed `export { Citation }` to `export type { Citation }` for `isolatedModules` compatibility
- `types/citation.ts`: Added missing `storySlug` field
- `services/interfaces/citation.ts`: Fixed `Omit` syntax (bare identifiers → string literals)
- `services/repositories/memory/citation.ts`: Fixed `APIResponse<Citation>` → `APIResponse<Citation[]>`, added `page`/`pageSize` to meta, removed constructor parameter
- `services/factory/repository.ts`: Removed `initialData` argument from `getCitationRepository()`

Additionally, 148 TS7006 (implicit any) errors across pipeline files were fixed during the same synchronization pass.

## Evidence Trail

- Type: `types/citation.ts`
- Interface: `services/interfaces/citation.ts`
- Repository: `services/repositories/memory/citation.ts`
- Factory: `services/factory/repository.ts`
- Registry: `services/registry.ts`
- Bootstrap: `services/init.ts`
- Canonical re-export: `types/canonical.ts` (line 2160)
