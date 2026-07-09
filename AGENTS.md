# AGENTS.md — The Breakdown OS

> Agent operating context and rules for **The Breakdown OS**.
> This file is read by AI coding agents (Antigravity, Cursor, Copilot, etc.) at the start of every session.
> Keep it accurate, concise, and scannable.

---

## ⚡ THE BREAKDOWN AI RULES

> These rules override everything else. Read them first. Follow them without exception.

### Mission

**Transform information into understanding.**

### Hard Prohibitions — Never Do These

| Rule | Detail |
|------|--------|
| 🚫 **Never optimize for speed over quality** | Correctness and clarity always win |
| 🚫 **Never rewrite architecture** | Evolve incrementally via ADR + RFC |
| 🚫 **Never change public APIs** | `/api/v1/*` contracts are stable; propose changes via RFC |
| 🚫 **Never change the database schema** | Schema changes require a migration plan and explicit approval |
| 🚫 **Never delete files without approval** | Deprecate and propose; do not unilaterally remove |

### Mandatory Checks — Always Run Before Finishing

```bash
npm run lint        # zero lint errors
npm run typecheck   # zero TypeScript errors  
npm test            # all tests pass
```

Additionally, every change must:

- ✅ **Preserve accessibility** — ARIA attributes, keyboard nav, semantic HTML
- ✅ **Preserve SEO** — title tags, meta descriptions, canonical URLs, structured data
- ✅ **Preserve performance** — no bundle size regressions, no new render-blocking resources

### Uncertainty Protocol

> **When uncertain — STOP.**
> Ask the user. Do not guess. Do not assume. Do not proceed.

If you are unsure about intent, scope, correctness, or consequences: surface the question clearly and wait for an explicit answer before writing any code.

---

## Project Identity

**The Breakdown OS** is an AI-powered editorial operating system for investigative journalism.
- Live site: **thebreakdown.in**
- Repo: `thebreakdowndaily/thebreakdown-os`
- Stack: **Next.js 15.5 App Router · TypeScript · Tailwind CSS · Cloudflare Pages**
- Build target: **207 pages, 0 errors** (CI enforces this — never regress it)

---

## Mandatory Rules for Agents

1. **Never break the build.** Run `npm run build` mentally before proposing any change. 0 errors is a hard contract.
2. **Never hardcode data in pages.** All data flows through `bootstrapServices()` → view-model → page props. Components receive typed props only.
3. **Never add `'use client'` without justification.** Default to React Server Components. Add `'use client'` only for browser APIs, state, or effects.
4. **Never invent domain types.** All canonical types live in `types/canonical.ts`. Extend them there, not locally.
5. **Never add `any` or `@ts-ignore`** without a comment explaining why. Strict TypeScript is enforced.
6. **Never fetch data inside a component.** Use view-models in `features/*/view-model.ts`.
7. **Never duplicate mock data.** Seed data lives in `utils/cms-store.ts` and is bootstrapped once via `lib/bootstrap.ts`.
8. **Follow the block system** when adding story content. Register new block types in `registry.tsx` and `types/canonical.ts`.
9. **Document architecture decisions** in `adr/` when making cross-cutting or irreversible changes.
10. **Preserve all existing comments and docstrings** unless the change explicitly modifies the documented behaviour.

---

## Architecture at a Glance

```
Request → Next.js App Router (RSC by default)
              ↓
         bootstrapServices()     ← lib/bootstrap.ts (idempotent)
              ↓
         services registry       ← services/registry.ts
         (Memory* pattern)       ← services/*/service.ts
              ↓
         view-model              ← features/*/view-model.ts
              ↓
         page.tsx (props only)
              ↓
         components (no data fetching)
                  ↓
             BlockRenderer       ← components/story/blocks/registry.tsx
             EvidenceEngine      ← components/story/evidence/
             ForceGraph          ← components/graph/
```

---

## Key Files — Read These First

| File | Role |
|------|------|
| `types/canonical.ts` | **Single source of truth** — all domain types |
| `services/registry.ts` | Service locator singleton |
| `services/init.ts` | Wires all `Memory*` services |
| `lib/bootstrap.ts` | `bootstrapServices()` — call before any view-model |
| `components/story/blocks/types.ts` | Block data interfaces |
| `components/story/blocks/registry.tsx` | `getBlockComponent()` + `BlockRenderer` |
| `utils/cms-store.ts` | In-memory seed data store |
| `tailwind.config.ts` | Design tokens (colors, spacing, typography) |

---

## Design Tokens (Use These — Never Hardcode Hex)

| Token | Value | Use |
|-------|-------|-----|
| `background` | `#0A0A0A` | Page background |
| `surface` | `#151515` | Cards, panels |
| `gold` | `#D4A843` | Primary accent |
| `green` | `#22C55E` | Positive / verified |
| `text` | `#F5F5F5` | Primary text |
| `secondary` | `#A1A1AA` | Muted / metadata |
| `border` | `#2A2A2A` | Dividers |

---

## Domain Services (Memory* Pattern)

Each service has a typed interface and a `Memory*` implementation that can be swapped for a real backend without touching pages.

| Service | Interface | Bootstrap |
|---------|-----------|-----------|
| Stories | `StoryService` | seeded from cms-store |
| Topics | `TopicService` | seeded from cms-store |
| Entities | `EntityService` | seeded from cms-store |
| Timelines | `TimelineService` | seeded from cms-store |
| Fixes | `FixService` | seeded from cms-store |
| Media | `MediaService` | seeded from cms-store |
| Search | `SearchService` | rebuilt from all above |
| Analytics | `AnalyticsService` | in-memory event store |

---

## View-Model Pattern

Every page calls one view-model builder. View-models are pure async functions — no React, no JSX.

```typescript
// Correct
export async function buildStoryPage(services: ServiceRegistry, slug: string): Promise<StoryPageViewModel>

// Incorrect — never do this
export default function StoryPage() {
  const story = await fetchStory(slug) // ❌ data in component
}
```

---

## Block System

Story pages are assembled from typed blocks. To add a new block:

1. Define `MyBlockData` in `components/story/blocks/types.ts`
2. Create `MyBlock.tsx` in `components/story/blocks/`
3. Register in `registry.tsx` → `getBlockComponent()`
4. Add `StoryBlockDef` case to `types/canonical.ts`
5. Map in `storyToBlocks()` in `features/story/view-model.ts`

Current block types: `executive-summary` · `evidence-panel` · `key-numbers` · `comparison` · `interactive-timeline` · `chart` · `faq` · `sources` · `related-intelligence`

---

## AI Layer

Both AI modules are **deterministic, graph-powered** — no LLM runtime dependency.

| Module | Location | Methods |
|--------|----------|---------|
| `EditorialAI` | `features/ai/editorial.ts` | `suggestHeadlines` · `suggestMissingEntities` · `detectSourceGaps` · `suggestFAQs` · `flagUnsupportedClaims` · `suggestTimelineEvents` |
| `ReaderAI` | `features/ai/reader.ts` | `simplify` (3 audiences) · `extractVerifiedClaims` · `summarize` · `comparePolicies` · `timelineSummary` |

---

## Knowledge Graph

`GraphService` in `lib/graph/graphService.ts`:

- `build()` — full graph from all services
- `getConnections(nodeId, depth, filter)` — BFS traversal
- `getPath(fromId, toId)` — shortest BFS path
- `getTrending()` — highest-confidence edges

---

## Event System

`EventBus` singleton in `lib/events/event-bus.ts`:

- 20 typed event types: `story:created/published/updated/deleted`, `topic:*`, `entity:*`, `timeline:*`, `fix:*`, `media:*`, `search:indexed`, `graph:updated`
- `subscribe(type | '*', handler)` → returns `unsubscribe`
- `publish(event)` → dispatches to type-specific + wildcard handlers
- 500-event rotating history

---

## Deployment

| Command | Effect |
|---------|--------|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Static generation — must produce 0 errors |
| `pwsh scripts/deploy-static.ps1` | Extracts HTML → `dist-static/` |
| `wrangler pages deploy dist-static` | Pushes to Cloudflare Pages |

Cloudflare free plan → **3 MiB Worker limit** → static-only. API routes are pre-rendered stubs only; runtime API calls are not served from Cloudflare Pages.

---

## Route Count (Build Baseline)

| Category | Count |
|----------|-------|
| Stories (SSG) | 15+ |
| Topics (SSG) | 12 |
| Entities (SSG) | 12 |
| Organizations (SSG) | 5 |
| Countries (SSG) | 2 |
| The Fix (SSG) | 6 |
| Datasets (SSG) | 5 |
| API v1 endpoints | 14 |
| CMS pages | 14 |
| Static / misc | 16+ |
| **Total** | **207** |

---

## Knowledge Directories (Don't Ignore These)

| Directory | Purpose |
|-----------|---------|
| `adr/` | Architecture Decision Records — why we built it this way |
| `rfc/` | Proposals for significant changes |
| `specs/` | Feature specifications (FR/TR/AC) |
| `docs/` | Engineering, editorial, ops, innovation guides |
| `workflows/` | Workflow definitions (editorial, operational, technical) |
| `prompts/` | AI prompt templates with variable contracts |
| `wiki/` | Team knowledge base |
| `.agents/` | Agent registry (`agents.md`) and skill registry (`skills.md`) |

---

## Open Work Items

| Priority | Item |
|----------|------|
| ⬜ Medium | Organization/Country pages — refactor to view-model pattern |
| ⬜ Medium | Search page — migrate from `semanticSearch` to `services.search.search()` |
| ⬜ High | Connect CMS store to real API backend + database |
| ⬜ High | Sync CMS ↔ public data store |
| ⬜ Low | Replace placeholder images with real editorial photography |
| ⬜ Low | Set GitHub repo secrets for CI/CD auto-deploy |

---

*Last updated: 2026-07-09*
