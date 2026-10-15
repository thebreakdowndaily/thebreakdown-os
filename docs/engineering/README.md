---
title: Engineering Guides
status: draft
owner: engineering
last_updated: 2026-10-15
---

# Engineering

Developer guides, onboarding docs, and operational runbooks for The Breakdown OS.

## Index

| Document | Description | Status |
|----------|-------------|--------|
| [Developer Workflow](./developer-workflow.md) | Common commands, focused tests, CI behavior, and PR checklist | active |
| [Feature-to-Module and Test Map](./feature-module-test-map.md) | Initial navigation from change intent to implementation candidates and tests | provisional |

## Maintenance rule

Keep this index short. Before adding a new guide, search for an existing owner and link to it rather than duplicating architecture or operational policy.

## Suggested Documents

- `onboarding.md` — Getting started as a new developer
- `local-dev.md` — Running the project locally
- `testing.md` — Test strategy, how to write and run tests
- `deployment.md` — Build and deploy process (Cloudflare Pages)
- `code-style.md` — TypeScript/React conventions and linting rules
- `data-layer.md` — How services, view-models, and the CMS store interact
- `adding-a-story.md` — Step-by-step: adding new investigative content
- `block-system.md` — How the `StoryBlock<T>` registry and `BlockRenderer` work
