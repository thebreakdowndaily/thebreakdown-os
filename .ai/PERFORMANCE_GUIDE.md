# Performance Guide

## Largest Contentful Paint (LCP)
- Hero and prominent images must be optimized. Use `next/image` to prevent unoptimized asset bloat.
- When migrating to `next/image`, apply explicit dimensions or `fill` with a relative parent.

## Build and Bundle
- Do not introduce large, un-optimized dependencies. Check bundle impact using tools if adding packages.
- Monitor `npm run build` output. Ensure the total size of assets generated does not regress significantly.
- Cloudflare free plan limits worker size to 3 MiB; keep the static export entirely static.

## React Rendering
- Leverage React Server Components (RSC) to minimize client-side JavaScript.
- Complex client-side visualizations (e.g., D3 charts via `ChartRenderer`) must use `IntersectionObserver` to lazy-load their rendering logic and `ResizeObserver` for responsive scaling without continuous re-renders.
