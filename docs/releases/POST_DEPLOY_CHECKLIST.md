# Post-Deployment Operational Checklist Template

These checks must be performed on the live target environment immediately following the deployment.

## 1. Metadata & Deploy Credentials
- **Build Identifier:** `[Build ID / Vercel Deploy ID]`
- **Deployment Duration:** [Duration in seconds/minutes]
- **Target environment URL:** `https://...`

## 2. Discovery & Search Visibility
- [ ] **Search Console:** Submit `sitemap.xml` and verify successful parsing.
- [ ] **Rich Results Test:** Run a live URL through the Rich Results validator to verify the Article and Breadcrumb JSON-LD schema markup.
- [ ] **Canonicalization:** Open target pages and verify `<link rel="canonical" href="...">` matches the production URL format.

## 3. Infrastructure & Caching
- [ ] **ISR Verification:** Query a `/series` page multiple times to verify CDN hits and confirm cache headers (e.g. `s-maxage`, `stale-while-revalidate`) are active.
- [ ] **Sentry Integration:** Trigger a test event or review the Sentry Dashboard for live exception capturing.
- [ ] **Technical Performance:** Perform a Lighthouse production audit on mobile/desktop viewports and record LCP, CLS, and INP metrics.

## 4. Live Observability Metrics Log (Run 10 mins post-deploy)
- **Service Uptime:** [e.g., 99.99%]
- **Error Rate (5xx/4xx):** [e.g., 0.05%]
- **Median Response Latency (p50/p99):** [e.g., 85ms / 320ms]
- **CDN Cache Hit Ratio:** [e.g., 88.5%]
