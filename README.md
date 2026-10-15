# The Breakdown OS

> An AI-powered Editorial Operating System for investigative journalism, data journalism, and evidence-based storytelling.

[![Build](https://github.com/thebreakdowndaily/thebreakdown-os/actions/workflows/production-deploy.yml/badge.svg)](https://github.com/thebreakdowndaily/thebreakdown-os/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-gold.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org)
[![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black)](https://thebreakdown.in)

---

## What Is This?

The Breakdown OS transforms raw information into structured, interconnected knowledge. Instead of producing isolated articles, it builds a living intelligence platform where every story, entity, and timeline contributes to a shared knowledge graph.

**Live site → [thebreakdown.in](https://thebreakdown.in)**

---

## Vision

| Principle | What It Means |
|-----------|--------------|
| **Truth before speed** | Verification is not optional — it is the product |
| **Context before conclusions** | Every claim is linked to its evidence and source tier |
| **Evidence before opinions** | Confidence scores are computed, not asserted |
| **Understanding before engagement** | Depth over clicks |
| **Quality before quantity** | Fewer, better stories |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15.5](https://nextjs.org) — App Router, React Server Components |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + design tokens |
| Deployment | Vercel (Next.js SSR) |
| CDN / Edge | Cloudflare Edge (Security & Caching) |
| Analytics | Sentry (edge + server) |
| Search | In-memory scored full-text index |
| Graph | SVG force-directed — zero runtime dependencies |
| Events | Typed pub/sub `EventBus` — 20 event types |

---

## Project Structure

The repository includes application, platform, research, audit, and agent-tooling modules. Use the [repository boundary and change map](docs/architecture/repository-boundaries-and-change-map.md) for the more complete navigation guide.

```text
app/                  Next.js App Router entry points
components/           Reusable UI components
design-system/        Shared visual tokens
features/             Feature-oriented logic and view models
services/             Domain/application service layer
lib/                  Shared infrastructure and utilities
packages/             Package-like modules and dedicated tests
plugins/              Extension-oriented modules
types/ schemas/       Shared domain and data contracts
stories/ data/ registry/
                      Story data, domain data, and registries
supabase/ migrations/ Database clients and migration assets
tests/ scripts/       Test suites and developer/CI tooling
audit/                Audit framework/tooling
docs/ adr/ rfc/       Documentation and decision records
.agents/ .ai/ .opencode/
                      Coding-agent instructions and skills
```

These labels are navigation hints, not proof that every import follows these boundaries. Verify callers before moving code. Multiple migration and ADR locations exist; do not create parallel homes.

## Getting Started

### Prerequisites

- Node.js ≥ 22 (matches `package.json`, `.nvmrc`, and CI)
- npm ≥ 10

### Install

```bash
npm ci
```

### Run locally

```bash
npm run dev
# → http://localhost:3000
```

### Build

```bash
npm run build
```

### Deploy (Vercel)

The project is natively deployed on Vercel. Pushing to the `main` branch will automatically trigger a deployment.
Alternatively, deploy manually via the Vercel CLI:

```bash
vercel deploy --prod
```

---

## Key Concepts

### Block System

Every story page is assembled from typed `StoryBlock<T>` blocks registered in a central registry. `BlockRenderer` resolves the right component at render time — no monolithic story templates.

```
types/blocks → registry.tsx → BlockRenderer → React components
```

### Service Layer (Memory* Pattern)

All data flows through typed service interfaces. In-memory implementations (`Memory*`) seed from the CMS store at build time. Swap to a real database by replacing the `Memory*` class only — pages and view-models are unaffected.

```
bootstrapServices() → services.{stories,topics,...} → view-model → page
```

### Knowledge Graph

The platform exclusively uses the `GraphProjectionService` to dynamically project nodes and edges from the canonical `Services` locator registry. This eliminates legacy manual data parsing and ensures the graph is a pure reflection of the underlying entity, topic, and story data. BFS traversal, shortest-path, and trending connections are available at any depth.

### AI Layer

`EditorialAI` and `ReaderAI` are deterministic, graph-powered engines — no LLM runtime dependency. Suggestions are computed from the knowledge graph and structured content data.

---

## Routes (207 pages, 0 build errors)

| Type | Count | Examples |
|------|-------|---------|
| Stories (SSG) | 15+ | `/story/aadhaar-data-breach` |
| Topics (SSG) | 12 | `/topic/agriculture` |
| Entities (SSG) | 12 | `/entity/mgnrega` |
| Organizations | 5 | `/organization/rbi` |
| Countries | 2 | `/country/india` |
| The Fix (SSG) | 6 | `/fix/mgnrega-reform` |
| Datasets (SSG) | 5 | `/dataset/pm-kisan` |
| API v1 | 14 | `/api/v1/stories` |
| CMS | 14 | `/cms/stories` |
| Graph explorer | 1 | `/graph` |
| Research workspace | 1 | `/workspace` |

---

## Engineering Navigation

- [Current agent and engineering contract](./AGENTS.md)
- [Repository architecture audit](./docs/architecture/repository-audit-2026-10-15.md)
- [Repository boundaries and change map](./docs/architecture/repository-boundaries-and-change-map.md)
- [Developer workflow and verification commands](./docs/engineering/developer-workflow.md)
- [Feature-to-module and test map](./docs/engineering/feature-module-test-map.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Architecture Decisions

See [adr/](./adr/) for the full ADR log.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## License

[MIT](./LICENSE) — © The Breakdown Daily
