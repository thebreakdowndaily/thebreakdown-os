---
title: Architecture
status: draft
owner: engineering
last_updated: 2026-10-15
---

# Architecture

Technical architecture documentation for The Breakdown OS.

## Purpose

This directory captures the *how* of system design — data flows, service boundaries, component diagrams, and integration contracts. ADR governance is currently split between [`/adr`](../../adr/), [`/docs/adr/`](../adr/), and a narrative [architecture ADR register](./adr-index.md); see the repository ownership audit before creating or moving records.

## Index

| Document | Description | Status |
|----------|-------------|--------|
| [Knowledge Graph Architecture](./graph.md) | Details the projection-based graph architecture | active |
| [Repository Audit — 2026-10-15](./repository-audit-2026-10-15.md) | Evidence-backed structural baseline and prioritized follow-up work | baseline |
| [Repository Boundaries and Change Map](./repository-boundaries-and-change-map.md) | Folder map, proposed ownership boundaries, and migration sequence | proposed |
| [Repository Ownership Audit — 2026-10-15](./repository-ownership-audit-2026-10-15.md) | Evidence-backed migration/ADR ownership, tracked local state, and CI findings | focused-audit |
| [Repository Dependency Audit — 2026-10-15](./repository-dependency-audit-2026-10-15.md) | Selected source-level import traces, change-coupling findings, and conservative remediation | focused-audit |

## Conventions

- Prefer Mermaid diagrams embedded in Markdown.
- Each doc should have a "Last reviewed" date.
- Link to the ADR that motivated a design choice.

## Current Stack (Summary)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | In-memory services (Memory* pattern) |
| Deployment | Vercel (Next.js) with Cloudflare Edge integration; verify exact behavior in active deployment configuration |
| API | REST — `/app/api/v1/` |
| Graph | `lib/graph/graphService.ts` — SVG force-directed |
| Events | `lib/events/event-bus.ts` — typed pub/sub |
