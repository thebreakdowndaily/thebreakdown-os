# The Breakdown — Audit Report

**Audit ID:** `AUD-2026-08-01-RC1`

**Generated:** 2026-08-01T09:41:59.630Z

**Launch gate:** ❌ BLOCKED

---

## 1. Environment

| Key | Value |
|-----|-------|
| Commit | `83095ac0b097c8446853606ba6bcd205dc564397` |
| Branch | `feature/frontend-foundation` |
| Working tree | dirty |
| Node.js | v24.18.0 |
| npm | 11.16.0 |
| OS | MINGW64_NT-10.0-26200 x86_64 |
| Next.js | Next.js v15.5.18 |
| React | ^19.2.7 |
| Timestamp | 2026-08-01T09:38:22Z |

---

## 2. Launch Gates

| Gate | Required | Result | Detail | Evidence |
|------|:--------:|:------:|--------|----------|
| Production build succeeds | yes | ✅ PASS | exitCode=0 durationMs=33854 | [link](audit/raw/build.log) |
| TypeScript strict check clean | yes | ✅ PASS | exitCode=0 | [link](audit/raw/typecheck.log) |
| ESLint passes | yes | ❌ FAIL | exitCode=1 | [link](audit/raw/lint.log) |
| Test suite passes | yes | ✅ PASS | exitCode=0 durationMs=29834 | [link](audit/raw/test.log) |
| Lighthouse Performance ≥ 90 | yes | ✅ PASS | performance=90 | [link](audit/raw/lighthouse_result.json) |
| Lighthouse Accessibility ≥ 90 | yes | ✅ PASS | accessibility=100 | [link](audit/raw/lighthouse_result.json) |
| Lighthouse Best Practices ≥ 90 | no | ✅ PASS | best-practices=100 | [link](audit/raw/lighthouse_result.json) |
| Lighthouse SEO ≥ 90 | no | ✅ PASS | seo=100 | [link](audit/raw/lighthouse_result.json) |
| Playwright e2e suite passes (chromium) | yes | ✅ PASS | passed=49 failed=0 skipped=7 | [link](audit/raw/playwright_result.json) |
| Platform Health Score ≥ 80 | no | ⚠️ INFO | platformHealthScore=76.25 | [link](audit/raw/plugin_audit.json) |

---

## 3. Raw Evidence (`audit/raw/`)

| Artifact | Size | Link |
|----------|------|------|
| build_result.json | 1.9 KB | [open](audit/raw/build_result.json) |
| dead_code_report.json | 118 B | [open](audit/raw/dead_code_report.json) |
| dependency_graph.json | 7.4 KB | [open](audit/raw/dependency_graph.json) |
| design_system_raw.json | 131 B | [open](audit/raw/design_system_raw.json) |
| inventory.json | 597.8 KB | [open](audit/raw/inventory.json) |
| lighthouse_result.json | 508 B | [open](audit/raw/lighthouse_result.json) |
| lint_result.json | 2.4 KB | [open](audit/raw/lint_result.json) |
| playwright_result.json | 4.1 KB | [open](audit/raw/playwright_result.json) |
| playwright_results.json | 81.3 KB | [open](audit/raw/playwright_results.json) |
| plugin_audit.json | 8.1 KB | [open](audit/raw/plugin_audit.json) |
| reader_journey_raw.json | 116 B | [open](audit/raw/reader_journey_raw.json) |
| test_result.json | 1.1 KB | [open](audit/raw/test_result.json) |
| typecheck_result.json | 260 B | [open](audit/raw/typecheck_result.json) |

---

## 4. Normalized Evidence (`audit/normalized/`)

| Artifact | Size | Link |
|----------|------|------|
| build_result.normalized.json | 1.9 KB | [open](audit/normalized/build_result.normalized.json) |
| dead_code_report.normalized.json | 117 B | [open](audit/normalized/dead_code_report.normalized.json) |
| dependency_graph.normalized.json | 7.4 KB | [open](audit/normalized/dependency_graph.normalized.json) |
| design_system_raw.normalized.json | 130 B | [open](audit/normalized/design_system_raw.normalized.json) |
| inventory.normalized.json | 597.8 KB | [open](audit/normalized/inventory.normalized.json) |
| lighthouse_result.normalized.json | 507 B | [open](audit/normalized/lighthouse_result.normalized.json) |
| lint_result.normalized.json | 2.4 KB | [open](audit/normalized/lint_result.normalized.json) |
| playwright_result.normalized.json | 4.1 KB | [open](audit/normalized/playwright_result.normalized.json) |
| plugin_audit.normalized.json | 8.1 KB | [open](audit/normalized/plugin_audit.normalized.json) |
| reader_journey_raw.normalized.json | 115 B | [open](audit/normalized/reader_journey_raw.normalized.json) |
| test_result.normalized.json | 1.1 KB | [open](audit/normalized/test_result.normalized.json) |
| typecheck_result.normalized.json | 259 B | [open](audit/normalized/typecheck_result.normalized.json) |

---

## 5. Platform Health (Audit-as-Code framework)

**Platform Health Score:** 76.3 / 100

| Plugin | State | Score | Coverage |
|--------|:-----:|------:|---------:|
| accessibility-audit | FAILED | 20 | 100 |
| architecture-audit | PASSED | 100 | 100 |
| knowledge-graph-audit | FAILED | 70 | 100 |
| editorial-audit | PASSED | 100 | 100 |
| operations-audit | PASSED | 100 | 100 |
| performance-audit | FAILED | 60 | 100 |
| security-audit | FAILED | 60 | 100 |
| seo-audit | PASSED | 100 | 100 |

---

## 6. Lighthouse Scores

| Category | Score |
|----------|------:|
| performance | 90 |
| accessibility | 100 |
| best-practices | 100 |
| seo | 100 |
| agentic-browsing | 100 |

Full report: [lighthouse.report.json](audit/reports/lighthouse.report.json) · [lighthouse.report.html](audit/reports/lighthouse.report.html)

---

## 7. Known Gaps & Limitations

- Every gate above is derived from captured evidence files under `audit/raw/`; no value is asserted without a traceable artifact.
- Evidence is reproducible via `bash scripts/run_audit.sh` from a clean checkout at the recorded commit.
- **Open required gates:** lint.
