---
adr: "0002"
title: Deploy as Static Site on Cloudflare Pages
status: accepted
date: 2024-01-01
---

# ADR 0002 — Deploy as Static Site on Cloudflare Pages

## Status
Accepted

## Context

The Breakdown OS needs a hosting platform that is:
- Free or low-cost for a bootstrapped editorial product
- Globally distributed (CDN) for low-latency reads across India
- Compatible with the Next.js static export model

Cloudflare's free plan imposes a **3 MiB Worker limit**, which rules out Next.js Server-Side Rendering via a Cloudflare Worker. The Vercel free tier was also considered but has bandwidth limits and requires SSR at the edge.

## Decision

Pre-render all pages at build time and deploy as a **fully static site on Cloudflare Pages**.

- `scripts/deploy-static.ps1` extracts pre-rendered HTML from `.next/server/app/`
- Creates directory-based clean URLs (`path/index.html`)
- Copies `_next/static/` and `public/`
- Generates `_redirects` and `_routes.json` for Cloudflare routing
- Deploy via `wrangler pages deploy`

## Consequences

**Easier:**
- Zero infrastructure cost within Cloudflare free plan
- Instant global CDN with no cold starts
- Simple rollback: redeploy previous build artifact

**Harder:**
- No server-side rendering at request time — all personalisation must be client-side
- API routes (`app/api/`) cannot be served from Cloudflare Pages — they must be extracted to a separate Cloudflare Worker or external service if needed at runtime
- `generateStaticParams` must be defined for all dynamic routes or they are skipped
- Real-time content updates require a full rebuild and redeploy
