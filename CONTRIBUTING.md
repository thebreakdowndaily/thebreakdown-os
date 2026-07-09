# Contributing to The Breakdown OS

Thank you for investing time in this project. This guide covers everything you need to contribute effectively — whether you're writing code, content, documentation, or agent workflows.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching & Commits](#branching--commits)
- [Pull Request Process](#pull-request-process)
- [Adding a Story](#adding-a-story)
- [Adding a Component](#adding-a-component)
- [Adding a Service](#adding-a-service)
- [Writing Tests](#writing-tests)
- [Documentation](#documentation)
- [Architecture Decisions](#architecture-decisions)
- [Style Guide](#style-guide)

---

## Code of Conduct

Be direct, be kind, be rigorous. We hold our code and our journalism to the same standard: evidence-first, well-sourced, and honest about uncertainty.

---

## Ways to Contribute

| Type | Where to start |
|------|---------------|
| Bug fix | Open an issue, reference it in your PR |
| Feature | Open an RFC in [`rfc/`](./rfc/) first for anything cross-cutting |
| New story / content | Follow [Adding a Story](#adding-a-story) |
| Documentation | Edit files in [`docs/`](./docs/) or the [`wiki/`](./wiki/) |
| Architecture change | Write an ADR in [`adr/`](./adr/) |
| Agent / workflow | Add to `.agents/agents.md` or `workflows/` |
| Prompt template | Add to `prompts/` |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/thebreakdowndaily/thebreakdown-os.git
cd thebreakdown-os

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in any required values

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

### Verify the build

```bash
npm run build
# Should complete with 0 errors across all routes
```

---

## Development Workflow

```
feature branch → local dev → build verify → PR → review → merge → deploy
```

1. Pull the latest `main`.
2. Create a feature branch (see [Branching & Commits](#branching--commits)).
3. Make your changes.
4. Run `npm run build` — **zero build errors is a hard requirement**.
5. Run tests: `npm test`.
6. Open a pull request.

---

## Branching & Commits

### Branch names

```
feature/<short-description>     # new feature
fix/<short-description>         # bug fix
docs/<short-description>        # documentation only
chore/<short-description>       # tooling, deps, config
content/<story-slug>            # new editorial content
```

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add InteractiveTimelineBlock zoom controls
fix: correct relatedTopicIds mapping in apiStoryToCanonical
docs: add ADR for memory service pattern
content: add aadhaar-data-breach investigative story
chore: bump Next.js to 15.5
```

---

## Pull Request Process

1. **Title** — follow the commit message format above.
2. **Description** — explain *what* changed and *why*. Link to the relevant issue, RFC, or ADR.
3. **Checklist** — include this in your PR body:

```markdown
- [ ] `npm run build` passes (0 errors)
- [ ] `npm test` passes
- [ ] New code follows the [Style Guide](#style-guide)
- [ ] Documentation updated if needed
- [ ] ADR written if an architectural decision was made
```

4. **Reviewers** — request at least one review before merging.
5. **Merge** — squash-merge onto `main`. Delete the feature branch after merge.

---

## Adding a Story

Stories are the core editorial unit. Follow these steps:

### 1. Create the story data

Add a new entry to the CMS store in `utils/cms-store.ts` (or the appropriate seed file). Follow the `APIStory` type in `types/canonical.ts`.

Required fields:

```typescript
{
  slug: 'my-story-slug',          // URL-safe, unique
  title: 'Story Title',
  summary: 'One-paragraph lead',
  publishedAt: '2026-07-09',
  status: 'published',
  author: 'Author Name',
  topics: ['topic-slug'],
  relatedEntityIds: ['entity-slug'],
  heroImage: '/public/stories/my-story.jpg',
  blocks: [],                      // see Block System below
  evidence: [],                    // see Evidence below
  sources: [],
}
```

### 2. Add blocks

Blocks are typed objects in `blocks[]`. Available block types are defined in `components/story/blocks/types.ts`:

| Block Type | Purpose |
|------------|---------|
| `executive-summary` | TL;DR at the top of the story |
| `evidence-panel` | Evidence engine with scored claims |
| `key-numbers` | Stat callouts |
| `comparison` | Side-by-side policy/data comparison |
| `interactive-timeline` | Zoomable interactive timeline |
| `chart` | SVG line or bar chart |
| `faq` | Expandable Q&A |
| `sources` | Formatted source list |
| `related-intelligence` | Cross-links to entities, topics, fixes |

### 3. Add evidence

Each claim in `evidence[]` needs:
- `text` — the claim being made
- `verdict` — `true | false | misleading | unverifiable`
- `confidence` — 0–100
- `sources[]` — array of source slugs supporting the claim

### 4. Wire to topics and entities

Add the story's `slug` to `relatedStoryIds` in the relevant topic and entity records so cross-links are built into the knowledge graph.

### 5. Verify

```bash
npm run build
# Check: your story slug appears in the build output
# Check: /story/<your-slug> returns 200
```

---

## Adding a Component

### Design system primitives (`components/ui/`)

Primitives must:
- Accept a `className` prop for extension
- Use design tokens (not hardcoded colors)
- Be server-component-compatible by default; add `'use client'` only if required

### Feature components (`components/story/`, `components/[section]/`)

- One component per file
- Export as named export (not default)
- Keep data out — accept typed props, delegate data fetching to the view-model

### Block components

To add a new block type:

1. Define the data interface in `components/story/blocks/types.ts`
2. Create the component in `components/story/blocks/MyBlock.tsx`
3. Register it in `registry.tsx`:
   ```typescript
   case 'my-block-type':
     return MyBlock;
   ```
4. Add the corresponding `StoryBlockDef` type to `types/canonical.ts`
5. Map it in `storyToBlocks()` in the story view-model

---

## Adding a Service

To add a new domain service:

1. **Define the interface** in `services/<domain>/service.ts`:
   ```typescript
   export interface MyService {
     getById(id: string): Promise<MyType | null>;
     list(): Promise<MyType[]>;
   }
   ```

2. **Implement `MemoryMyService`** in the same file, seeding from the CMS store.

3. **Register it** in `services/registry.ts` and wire it in `services/init.ts`.

4. **Bootstrap it** — `bootstrapServices()` in `lib/bootstrap.ts` must call your init.

5. **Consume it** in a view-model, never in a component directly.

---

## Writing Tests

Test files live in `tests/` mirroring the source directory structure.

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch
```

- Unit test pure functions (view-models, mappers, service methods).
- Integration test API route handlers with mock service registry.
- Do not test React component rendering unless testing complex interaction logic.

---

## Documentation

| What you changed | Where to document it |
|-----------------|---------------------|
| New feature | `docs/engineering/` or `docs/blueprints/` |
| Editorial standards | `docs/editorial/` |
| Deployment change | `docs/operations/` |
| Architectural decision | `adr/` |
| Significant proposal | `rfc/` |
| Feature specification | `specs/` |
| Team knowledge | `wiki/` |

All docs use Markdown with YAML frontmatter:

```yaml
---
title: Document Title
status: draft | review | approved
owner: engineering | editorial | product
last_updated: YYYY-MM-DD
---
```

---

## Architecture Decisions

Any change that is cross-cutting, irreversible, or a significant departure from existing patterns requires an ADR.

1. Copy the template from [`adr/README.md`](./adr/README.md).
2. Number it sequentially: `adr/0004-my-decision.md`.
3. Set `status: proposed` and open a PR for team review.
4. Once merged, update `status: accepted`.

---

## Style Guide

### TypeScript

- Strict mode — no `any`, no `@ts-ignore` without a comment explaining why.
- Prefer `interface` over `type` for object shapes.
- Export types from `types/canonical.ts` — do not define domain types locally in components.

### React

- Default to React Server Components. Add `'use client'` only when you need browser APIs, state, or effects.
- No data fetching inside components — assemble data in view-models and pass as props.
- Use `useId()` for ARIA attribute pairing. Avoid hand-written IDs.

### Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `evidence-engine.tsx` |
| Components | PascalCase | `EvidenceEngine` |
| Hooks | camelCase, `use` prefix | `useServices` |
| Services | PascalCase + `Service` suffix | `StoryService` |
| View-model functions | `build` prefix | `buildStoryPage` |
| Slugs | kebab-case | `aadhaar-data-breach` |

### CSS / Tailwind

- Use design tokens from `tailwind.config.ts` — do not hardcode hex values.
- Keep Tailwind utility classes in JSX. Extract to a component if a pattern repeats 3+ times.
- Dark mode is the default — all surfaces use `#0A0A0A` bg / `#151515` surface.

### Design tokens

| Token | Value | Use |
|-------|-------|-----|
| Background | `#0A0A0A` | Page background |
| Surface | `#151515` | Cards, panels |
| Gold | `#D4A843` | Primary accent |
| Green | `#22C55E` | Positive / verified |
| Text | `#F5F5F5` | Primary text |
| Secondary | `#A1A1AA` | Muted text |
| Border | `#2A2A2A` | Dividers |
