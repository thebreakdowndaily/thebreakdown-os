---
title: Architecture
status: draft
owner: engineering
last_updated: 2026-07-09
---

# Architecture

Technical architecture documentation for The Breakdown OS.

## Purpose

This directory captures the *how* of system design — data flows, service boundaries, component diagrams, and integration contracts. Architectural decisions are tracked separately in [`/adr`](../../adr/).

## Index

| Document | Description | Status |
|----------|-------------|--------|
| _(none yet)_ | — | — |

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
| Deployment | Cloudflare Pages (static) |
| API | REST — `/app/api/v1/` |
| Graph | `lib/graph/graphService.ts` — SVG force-directed |
| Events | `lib/events/event-bus.ts` — typed pub/sub |
