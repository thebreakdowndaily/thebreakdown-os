# CI Security and Browser Accessibility Scanning

**Status:** active in `main`; security-scanning behavior is being hardened from observed CI results.  
**Scope:** workflow and documentation hardening; no application runtime-code change.

## 1. Dependency vulnerability scanning (OSV-Scanner)

Workflow: `.github/workflows/security-scans.yml`.

- Pull requests run the official OSV-Scanner differential reusable workflow, pinned to commit `b1d267aea5211fa648d9d442fa64b90dbdcbdd36` (v2.7.0).
- The pull-request scan recursively checks supported dependency manifests/lockfiles (using the official action's documented `-r ./` syntax) and fails if the PR introduces a new known vulnerability. SARIF upload is disabled on PR runs to avoid requiring code-scanning write access for fork-originated PRs; the blocking scan still runs.
- Pushes to `main`, a weekly schedule, or manual workflow dispatch run a full dependency inventory and publish SARIF results to GitHub code scanning.
- The baseline scan does not fail on already-existing vulnerabilities until maintainers triage the inventory. Its SARIF is uploaded on trusted main/scheduled/manual runs. This does not weaken the PR differential gate.
- Job permissions are restricted to reading repository contents/actions and writing security scan results.

Reference: [official OSV-Scanner GitHub Action documentation](https://google.github.io/osv-scanner/github-action/).

## 2. Secret detection (Gitleaks)

Workflow: `.github/workflows/security-scans.yml`.

- The workflow installs Gitleaks CLI `8.30.1` directly from the upstream release and verifies its published SHA-256 checksum before execution.
- Pull requests scan the explicit two-dot range `base.sha..head.sha`; pushes scan `before..after`. Weekly and manual runs scan all reachable history with `--all`.
- The scanner does not use the Gitleaks Action's implicit `--no-merges --first-parent` range. That action reported zero commits on the post-merge push for this repository, so its success did not establish scan coverage. See the [upstream documented merge-history coverage issue](https://github.com/gitleaks/gitleaks-action/issues/236).
- The scanner redacts findings and uploads the SARIF report as a seven-day workflow artifact, including on scan failure when a report was produced. It has read-only repository permissions; it does not post PR comments or alter files.
- `.gitleaksignore` intentionally starts without suppressions. Add a fingerprint only after a reviewer inspects the finding and verifies the string is a non-secret test fixture. Never suppress whole test directories or patterns by default.
- A green differential scan only covers the event's explicit range. The scheduled/manual `--all` scan is the broader historical check. Neither is a substitute for credential rotation when a real secret is found.

Reference: [Gitleaks CLI documentation](https://github.com/gitleaks/gitleaks).

## 3. Browser-level accessibility CI

The existing `tests/e2e/accessibility.spec.ts` uses Playwright and Axe against five routes: home, search, economy topic, UN entity, and the MGNREGA reform story.

- CI retains the current design-token/contrast test (`npm run test:a11y`).
- After the production build, CI installs Chromium and its OS dependencies, then runs the existing Axe tests in desktop Chromium and the `Mobile Chrome` viewport.
- The Playwright HTML report and test-results directory are uploaded for seven days, including on failures when produced.
- Firefox, WebKit, and tablet accessibility runs are not enabled in this minimal first gate to limit CI duration; they can be added after the targeted gate is stable.

Reference: [Playwright browser installation in CI](https://playwright.dev/docs/browsers) and [Playwright CI guidance](https://playwright.dev/docs/ci).

## Acceptance and limits

- No new npm dependencies.
- No application, database, migration, environment, hosting, or production-code change.
- All third-party actions and reusable workflows are pinned to full commit SHAs; the Gitleaks CLI version is pinned and its release checksum is checked.
- A successful run means the configured checks passed; it does not prove there are no undiscovered vulnerabilities, secrets outside the scanned commit range/history, or accessibility issues outside the five tested routes and selected browser profiles.
- The first main-branch inventory on 2026-10-15 reported **85 known dependency-vulnerability occurrences across 29 affected packages** (8 critical, 52 high, 25 medium). This is an unresolved baseline, not a clean security result. Track and remediate those findings separately; do not describe them as fixed.
- Keep scan outputs as evidence. Do not invent ignore fingerprints or describe existing vulnerabilities as fixed without remediation.
