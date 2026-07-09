---
adr: "0001"
title: Use Next.js 15 App Router
status: accepted
date: 2024-01-01
---

# ADR 0001 — Use Next.js 15 App Router

## Status
Accepted

## Context

The Breakdown OS is a content-heavy editorial platform requiring:
- Server-side rendering for SEO and fast first paint
- Nested, composable layouts (global chrome → section → page)
- Static generation for the majority of content pages
- A clear separation between server components (data fetching) and client components (interactivity)

The two main options considered were Next.js Pages Router (existing Next.js convention) and the newer App Router introduced in Next.js 13 and stabilised in Next.js 15.

## Decision

Use **Next.js 15.5 App Router** with TypeScript throughout.

- All routes live under `app/`
- Default to React Server Components; opt into `'use client'` only where interactivity is required
- Use `generateStaticParams` for dynamic routes to maximise static generation at build time
- Maintain a single view-model assembly function per page — no nested data fetching inside components

## Consequences

**Easier:**
- Fine-grained control over static vs. dynamic per-route
- Nested layouts without prop-drilling
- Smaller client bundles (server components ship zero JS)

**Harder:**
- Client/server component boundary requires discipline (`'use client'` must not import server-only modules)
- Some third-party libraries are not yet compatible with RSC
- Build output is more complex (`.next/server/app/` vs Pages Router's `.next/server/pages/`)
