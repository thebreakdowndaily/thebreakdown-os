# Performance Documentation

This directory contains performance-related guidelines, budgets, and historical tracking for The Breakdown OS.

## Files

- [budgets.md](./budgets.md): Defines the target bundle sizes and performance budgets.
- [bundle-history.md](./bundle-history.md): Tracks the baseline and historical changes in bundle sizes over time.

## Analyzing Bundles

To generate a bundle analysis report, run:

```bash
npm run analyze
```

This will run the Next.js build with the bundle analyzer enabled and open HTML reports in your browser detailing the contents of the Client, Server, and Edge bundles.

## Health Tracking

In addition to these focused metrics, refer to `REPOSITORY_HEALTH.md` in the root of the project for a high-level overview of overall codebase health, including bundle size status, test coverage, and outstanding technical debt.
