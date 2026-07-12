# AGENTS.md

# THE BREAKDOWN OS

Version: 1.0

Status: Living Document

Last Updated: 2026

---

# Mission

The Breakdown is **not** a news website.

It is a Knowledge Operating System.

Mission:

Transform information into understanding.

Every engineering decision must improve:

- Trust
- Understanding
- Verification
- Context
- Accessibility
- Long-term maintainability

Never optimize purely for engagement, clicks, or short-term growth.

---

# Product Vision

The Breakdown combines the strengths of:

- Wikipedia
- Bloomberg Terminal
- Our World in Data
- Notion
- Perplexity
- OpenAlex
- GitHub

while remaining a coherent, evidence-first platform.

---

# Engineering Principles

Always optimize for:

1. Readability
2. Maintainability
3. Performance
4. Accessibility
5. Type Safety
6. Testability

Never optimize only for fewer lines of code.

Code should be obvious rather than clever.

---

# Tech Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

Backend

- Supabase
- PostgreSQL

Infrastructure

- Vercel
- Cloudflare

Repository

- GitLab

Architecture

- Service Layer
- Repository Pattern
- Canonical Types
- Knowledge Graph
- Event Bus
- REST API
- AI Layer

---

# Repository Structure

app/
components/
services/
lib/
types/
tests/
docs/
adr/
rfc/
prompts/

Never create new top-level folders without approval.

---

# Canonical Source of Truth

The following files define architecture.

They must not be duplicated.

types/canonical.ts

services/

lib/events/

lib/graph/

Do not create alternative implementations.

---

# Architecture Rules

Do NOT

❌ Rewrite architecture

❌ Replace Service Layer

❌ Replace Repository Pattern

❌ Change database schema

❌ Rename public APIs

❌ Break routes

❌ Introduce duplicate types

❌ Create parallel systems

Always extend existing architecture.

---

# Component Rules

Maximum component size

250 lines

Warning

300 lines

Mandatory refactor

500 lines

Epic required

1000 lines

Use composition.

Avoid monolithic components.

---

# Accessibility Rules

Every feature must support:

Keyboard navigation

Screen readers

Focus management

ARIA

Semantic HTML

Color contrast

WCAG AA minimum

AAA whenever practical

Never regress accessibility.

---

# Performance Rules

Prefer:

Server Components

Streaming

Suspense

Code Splitting

Dynamic Imports

Image Optimization

Memoization only when measured.

Avoid premature optimization.

---

# Design System

Use existing primitives.

Do not create duplicate:

Buttons

Cards

Containers

Badges

Typography

Spacing

Colors

Use design tokens.

---

# TypeScript Rules

Strict mode.

Never use:

any

unknown as escape hatch

@ts-ignore

unless explicitly approved.

Prefer:

interfaces

discriminated unions

canonical types

---

# State Management

Prefer:

Server State

↓

Services

↓

View Models

↓

Local Component State

Avoid unnecessary global state.

---

# Services

Business logic belongs inside services.

React components should primarily render UI.

---

# Analytics

Use PluginAnalyticsService.

Never call analytics providers directly.

All tracking must go through plugins.

---

# AI Layer

AI should assist.

AI should never become the source of truth.

Generated content must remain reviewable.

Evidence always overrides AI output.

---

# Security

Never expose:

API keys

Secrets

Tokens

Database credentials

Never commit secrets.

---

# SEO

Every page requires:

Title

Description

Canonical URL

Open Graph

Twitter Card

Structured Data where appropriate

---

# Testing

Every change must pass:

npm run lint

npm run typecheck

npm run build

Tests when applicable.

Never merge failing builds.

---

# Definition of Done

A feature is complete only if:

✓ Build passes

✓ Lint passes

✓ TypeScript passes

✓ Accessibility preserved

✓ Performance unchanged or improved

✓ Documentation updated

✓ ADR updated if architecture changed

✓ Public APIs unchanged

✓ Tests added or updated

---

# Pull Request Rules

Small PRs.

Prefer:

<500 changed lines

Logical commits.

One concern per PR.

---

# Git Workflow

Issue

↓

Branch

↓

Implementation

↓

Review

↓

CI

↓

Merge Request

↓

Review

↓

Merge

Never commit directly to main.

---

# Documentation

If architecture changes:

Update:

Architecture.md

README.md

ADR

RFC

Never leave documentation behind.

---

# AI Instructions

Before modifying code:

1. Read README.md

2. Read AGENTS.md

3. Read docs/

4. Read ADRs

5. Read RFCs

6. Understand the task

Do not start coding immediately.

Produce a plan first.

---

# Refactoring Rules

Prefer:

Incremental

Measurable

Reversible

Do not perform repository-wide rewrites.

One module at a time.

---

# Review Philosophy

Every change must answer:

Why is this better?

How is it measured?

Can it be rolled back?

What future work becomes easier?

---

# Final Principle

Optimize for the codebase that will still be understandable in 2045.

The Breakdown is intended to become one of the world's most trusted knowledge platforms.

Every engineering decision should move the repository toward that goal.

---

## Working Summary

### Objective
Wire the CMS so a story created through it publishes to the live site, via a `RepositoryFactory` toggling between memory and Supabase through `DATA_PROVIDER` env var. Migrate all data-store entity types to async/factory/repository pattern.

### Important Details
- `DATA_PROVIDER=memory` (default, static seed data) or `DATA_PROVIDER=supabase` (live database).
- Singleton caching in `registry.ts` — env var, same for all requests.
- Story pages use ISR (`revalidate=60`) + `dynamicParams=true`; CMS pages use `dynamic='force-dynamic'`.
- Callers now `await` async returns; `.map(getService(id))` wrapped in `Promise.all()`.
- Stale files deleted once no imports reference them.

### Completed
- **Stories** — async StoryService interface + MemoryStoryService + SupabaseStoryRepository + factory + init + all callers.
- **Topics** — async TopicService interface + MemoryTopicRepository + SupabaseTopicRepository + factory + init + all callers (18 files).
- **Entities** — async EntityService/RawEntityRepository interfaces + MemoryEntityRepository + SupabaseEntityRepository + factory + init + all callers (14 files). KnowledgeEntityService updated. API v1 routes updated.
- **Timelines** — async TimelineService interface + MemoryTimelineRepository + SupabaseTimelineRepository + factory + init + all callers + API v1 routes. All 3 stale files deleted.
- **Fixes** — async FixService interface + MemoryFixRepository + SupabaseFixRepository + factory + init + all callers (6 files) + API v1 routes. All 3 stale files deleted.
- `npx tsc --noEmit` — clean. `npm run build` — passes (225 pages).

### Remaining (unmigrated, still using old sync pattern)
- **Datasets** — 25+ callers, complex API (getDatasets, getDatasetBySlug, saveDataset, getSeries, getHistory, createVersion, getChartData, importCsv, importJson, validate). Largest remaining migration.
- **Media** — 1 caller (`features/cms/view-model.ts`). Low complexity, small scope.
- **Search** — used across the app, but separate concern.
- **Graph, Monitoring, Analytics, Intelligence** — app-level services, not data-store repos.

### Next Moves
1. Migrate datasets (complex — needs async interface + mem repo + supabase repo + factory + init + all callers + API routes)
2. Migrate media (simple — async interface + mem repo + supabase repo + factory + init)
