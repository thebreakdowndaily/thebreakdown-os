# CI Security and Browser Accessibility Scanning

**Status:** proposed in PR `feat/ci-security-a11y-hardening`  
**Scope:** CI/workflow hardening only; no application code or runtime dependency changes.

## 1. Dependency vulnerability scanning (OSV-Scanner)

Workflow: `.github/workflows/security-scans.yml`.

- Pull requests run the official OSV-Scanner differential reusable workflow, pinned to commit `b1d267aea5211fa648d9d442fa64b90dbdcbdd36` (v2.7.0).
- The pull-request scan recursively checks supported dependency manifests/lockfiles (using the official action's documented `-r ./` syntax) and fails if the PR introduces a new known vulnerability. SARIF upload is disabled on PR runs to avoid requiring code-scanning write access for fork-originated PRs; the blocking scan still runs.
- Pushes to `main`, a weekly schedule, or manual workflow dispatch run a full dependency inventory and publish SARIF results to GitHub code scanning.
- The baseline scan does not fail on already-existing vulnerabilities until maintainers triage the inventory. Its SARIF is uploaded on trusted main/scheduled/manual runs. This does not weaken the PR differential gate.
- Job permissions are restricted to reading repository contents/actions and writing security scan results.

Reference: [official OSV-Scanner GitHub Action documentation](https://google.github.io/osv-scanner/github-action/).

## 2. Secret detection (Gitleaks)

- The Gitleaks Action is pinned to immutable commit `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` (v3.0.0), with the CLI version explicitly pinned to `8.30.1`.
- It runs on pull requests and pushes to `main`, scanning the affected commits. Historical full-repository secret-history remediation is a separate one-time exercise and is not claimed to be solved by this change.
- PR comments are disabled; the action has read-only contents and pull-request permissions.
- `.gitleaksignore` intentionally starts without suppressions. It documents the required exact fingerprint format. Add a fingerprint only after a reviewer inspects the finding and verifies the string is a non-secret test fixture. Never suppress whole test directories or patterns by default.
- If the scan identifies a potentially real credential, revoke/rotate it immediately before treating the code finding as resolved. Removing a credential from the current tree does not remove it from Git history.

### Licensing note

The Gitleaks **Action** is governed by the upstream GITLEAKS-ACTION End-User License Agreement; it is not MIT-licensed. Upstream documents that no license key is required when scanning repositories owned by a personal GitHub account. If this repository moves to a GitHub Organization account, obtain/review the required license before relying on the action. The Gitleaks CLI has a separate license; do not conflate the two.

Reference: [Gitleaks Action v3.0.0 license and usage](https://github.com/gitleaks/gitleaks-action/tree/v3.0.0).

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
- All third-party workflows/actions are pinned to full commit SHAs.
- A successful run means the configured checks passed; it does not prove there are no undiscovered vulnerabilities, secrets elsewhere in historical commits, or accessibility issues outside the five tested routes and selected browser profiles.
- Keep the initial scan output as evidence. Do not invent ignore fingerprints or describe existing vulnerabilities as fixed without remediation.
