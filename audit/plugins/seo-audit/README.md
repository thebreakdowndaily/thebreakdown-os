# SEO Audit Plugin (`seo-audit`)

## Overview
This plugin verifies that the repository satisfies foundational Search Engine Optimization (SEO) requirements.

## Capabilities
- **Robots.txt**: Verifies the presence of a `robots.txt` file (or `app/robots.ts` / `app/robots.txt`).
- **Sitemap**: Verifies the presence of a `sitemap.xml` file (or `app/sitemap.ts` / `app/sitemap.xml`).
- **Metadata Configuration**: Verifies that the root layout (`app/layout.tsx` or `app/layout.jsx`) configures core metadata tags and canonical URLs.

## Integration
This plugin depends on `architecture-audit`.

### Policy Rules
Refer to `policy.json` for exact required paths.
