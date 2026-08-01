# PRODUCTION VALIDATION PLAN — LEVEL L5 CONTROLLED LAUNCH

**Target Domain:** `thebreakdown.in`  
**Level:** L5 (Controlled Production Launch & Environment Validation)  
**Objective:** Validate real-world reliability, editorial operations, and reader experience under live conditions.

---

## 1. Phase A — Day 1: Deploy & Validate Checklist
- [ ] Deploy `main` branch to production hosting (Cloudflare Pages / Vercel).
- [ ] Configure custom production domain `thebreakdown.in` and SSL certificate.
- [ ] Bind environment secrets (Supabase credentials, API tokens).
- [ ] Confirm `/api/health` returns `200 OK`.
- [ ] Manually sweep public reader routes (`/`, `/story/*`, `/topics/*`, `/timelines/*`).
- [ ] Publish 1 live production test story through Editorial OS.
- [ ] Verify structured JSON telemetry logs (`logStructured`).
- [ ] Confirm analytics reader journey events (`reader_journey_completed`).
- [ ] Submit sitemap to Google Search Console and verify crawl status.

---

## 2. Phase B — Week 1: Minimum Viable Newsroom Corpus

| Content Type | Launch Target | Target Focus |
| :--- | :---: | :--- |
| **Lead Stories** | 8–10 | Breaking news & foundational strategic analysis |
| **Explainers** | 3 | Historical context & institution overviews |
| **Deep Analyses** | 3 | Historiographical debates & foreign policy |
| **Topic Hubs** | 3 | Core collections (e.g. Non-Alignment, Constitution) |
| **Timelines** | 2 | Interactive chronological timelines (e.g. 1947–1962) |

---

## 3. Phase C — Weeks 2–4: Operational Observation Metrics
- **System Uptime & Error Rates:** Zero unhandled runtime crashes; error rates $< 0.1\%$.
- **Live Core Web Vitals:** LCP $< 1.2\text{s}$, CLS $= 0.0$, INP $< 200\text{ms}$.
- **Cache Hit Efficiency:** CDN edge cache hit ratio $> 95\%$.
- **Editorial Lead Time:** Publishing lead time maintained under 48 hours.

---

## 4. Phase D — Months 2–3: Deliberate Scaling & ADR Governance
- Scale content production based on observed reader analytics.
- Address live reader feedback regarding search, navigation, and readability.
- Any structural limitations surfaced by live usage will be drafted as an approved ADR before planning AR-14.

---

## 5. Level L5 Operational Success Criteria

| Category | Operational Success Criterion | Verification Method |
| :--- | :--- | :--- |
| **Availability** | Stable operation over 14-day observation window | Cloudflare / Vercel uptime metrics |
| **Deployments** | Zero-downtime deployment & rollback capability | CI/CD pipeline verification |
| **Security** | Zero unresolved critical production security issues | Dependency audit & secret isolation |
| **Editorial** | Consistent publication workflow in daily use | Audit log timestamp analysis |
| **Performance** | Web Vitals compliant under real traffic | Google PageSpeed & Real User Monitoring (RUM) |
| **Accessibility** | Zero critical WCAG AAA regressions | Manual screen reader & keyboard audit |
| **Operations** | Live telemetry, alerts, and backups operational | `/api/health` and restore logs |
