# Dependency Vulnerability Remediation Queue — 2026-10-15

## Baseline evidence

The first full OSV-Scanner inventory on `main` (commit `62115b2e438b88540de4dba6e3084d3d008dabf8`) completed successfully as a reporting job and found:

- 85 known-vulnerability occurrences
- 29 affected package records
- 8 critical, 52 high, 25 medium and 0 low/unknown findings
- 81 findings with a fixed version reported by OSV

These are scanner-reported occurrences, not necessarily 85 unique CVEs: advisories may repeat across root and `audit/` lockfiles or multiple installed dependency paths. A green inventory job means results were generated and uploaded; it does not mean the baseline is secure.

Evidence: [OSV inventory run](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/38699908022) · [Uploaded SARIF artifact](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/38699908022/artifacts/11955601584).

## Prioritized remediation queue

| Priority | Package / current lockfile version | Scanner evidence / fixed release | Required treatment |
|---|---|---|---|
| P0 | `maplibre-gl` 4.7.1 | Critical CVE-2026-85061 / GHSA-jrc7-96c5-q579; fixed in 6.4.1 | Review v4-to-v6 migration/API differences, update manifest and lockfile together, add map/attribution rendering regression tests, and validate production build before deployment. Do not force a lockfile-only update. |
| P0 | `next` 15.5.18 | 12 scanner-reported advisories; the inventory lists fixed releases including 15.5.24 and 15.5.27 | Update to the latest verified patched 15.5.x release and regenerate the lockfile with npm. Run full build, story/search routes, caching/metadata and production-edge smoke tests. |
| P1 | `sharp` 0.34.5 | Three scanner-reported advisories; fixed releases listed through 0.35.5 | Update with Next.js compatibility in mind; verify image optimization/AVIF output and representative images. |
| P1 | `handlebars` 4.7.9 | High/critical-range advisories in both lockfiles; fixed release listed as 4.7.10 | Confirm direct/transitive consumers and update each owning lockfile. |
| P1 | `shell-quote` 1.10.0 | High severity advisory; fixed release 1.11.0 | Determine which scripts consume it; update and run the relevant test/tooling workflows. |
| P1 | `fast-uri`, `brace-expansion`, `js-yaml`, `postcss`, `source-map-js`, `vitest`, `@vitest/mocker`, `baseline-browser-mapping`, `browserslist` | Multiple advisories in root and/or `audit/package-lock.json`; fixes were listed for most versions | Update in small, grouped lockfile-valid batches; verify each installed version against fresh OSV output. Pay attention to different versions in the independent `audit/` lockfile. |
| P2 | `braces` 3.0.3, `sprintf-js` 1.0.3 | Inventory did not report a fixed version (`--`) | Identify dependency paths and assess removal/replacement or upstream mitigation; do not claim patched until a fix is verified. |

Advisory example: [MapLibre critical XSS sanitizer bypass](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579) affects releases through 6.4.0 and is fixed in 6.4.1. It can affect applications that render untrusted/third-party attribution strings. Verify whether The Breakdown passes any such content before declaring exploitability, but upgrade regardless.

## Automation added by this PR

- Dependabot version updates are scheduled independently for the root npm project and the `audit/` npm project because they have separate manifests/lockfiles.
- Routine minor/patch updates are grouped for review efficiency.
- Major updates are not grouped with routine patch/minor updates; breaking changes should receive a separate compatibility review.
- This configuration does **not** itself prove Dependabot security updates are enabled in repository settings. Confirm both Dependabot alerts and security updates are enabled.
- Keep OSV as the source of truth for inventory. Accept an update only after CI and a fresh scan verify the installed resolved versions; a manifest range alone does not remediate an old locked version.

## Acceptance criteria for each remediation PR

1. `package.json` and its corresponding lockfile agree; `npm ci` succeeds.
2. No manual lockfile editing or blind `--force` upgrade.
3. Typecheck, lint, unit/domain tests and production build pass.
4. The targeted rendering/integration tests pass for runtime dependencies.
5. A fresh OSV scan shows which advisory identifiers remain; unresolved findings are recorded, not suppressed.
6. Deployment/edge smoke checks pass before a production release.

## Limits

This queue records the 2026-10-15 inventory and is not a substitute for a fresh scan at remediation time. Vulnerability applicability depends on package paths and how the application uses them; package presence alone is not proof of exploitability or safety.
