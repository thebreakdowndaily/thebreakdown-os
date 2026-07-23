# Performance Audit Plugin (`performance-audit`)

## Overview
This plugin verifies that the repository is configured to measure and optimize application performance, focusing on bundle size and Core Web Vitals readiness.

## Capabilities
- **Lighthouse CI**: Verifies the presence of a Lighthouse configuration file (e.g., `.lighthouserc.json`) and the `@lhci/cli` dependency.
- **Bundle Analysis**: Ensures tools like `@next/bundle-analyzer` or `webpack-bundle-analyzer` are present to monitor JavaScript payload sizes.
- **Next.js Config**: Verifies the presence of `next.config.ts` or `next.config.js` to ensure framework-level optimizations are accessible.

## Integration
This plugin evaluates static configurations and dependencies. It does not execute a live Lighthouse audit during the CI build process, keeping execution deterministic and fast.

### Policy Rules
Refer to `policy.json` for specific required packages and configuration files.
