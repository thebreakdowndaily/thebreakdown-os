# Release Checklist Template

This checklist outlines the mandatory steps required before any release candidate is promoted to production.

## 1. Code Freeze & Quality Gates
- [ ] No new features introduced during this release hardening window.
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run build` succeeds and prints clean route statistics.

## 2. Automated Regression Testing
- [ ] Run the complete automated test suite: `npm run test:all`.
  - [ ] All Core Views tests pass (`tests/homepage.test.ts`).
  - [ ] All Story Page tests pass (`tests/story-page.test.ts`).
  - [ ] All Entity Page tests pass (`tests/entity-page.test.ts`).
  - [ ] All Search Engine tests pass (`tests/search.test.ts`).
  - [ ] All SEO & JSON-LD metadata tests pass (`tests/seo.test.ts`).
  - [ ] All Authentication & middleware tests pass (`tests/auth.test.ts`).
  - [ ] All Dataset registry & E2E tests pass (`tests/dataset.test.ts`, `tests/dataset-e2e.test.ts`).

## 3. Manual Fallback & UI Verification
- [ ] **Hydration:** Verify there are zero React hydration warnings in the browser console.
- [ ] **Custom 404:** Request an invalid URL and confirm it correctly lands on the custom 404 page (`app/not-found.tsx`) with search functionality.
- [ ] **Sitemap Review:** Verify the generated sitemap (`sitemap.xml`) includes all expected dynamic series routes and excludes draft statuses.
