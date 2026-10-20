# Phase 51.5 — CI Evidence Addendum

**Evidence snapshot SHA:** `8fbfc3eee417f311aa21ef090737026ec3ad6230`  
**PR:** [#93](https://github.com/thebreakdowndaily/thebreakdown-os/pull/93)  
**Evidence reviewed:** GitHub Actions run metadata, job conclusions, and decoded logs.  
**Boundary:** CI/source evidence only. No live staging/production database operations, migration, worker deployment, publishing action, or publication-capable rehearsal was performed.

> Important: this addendum documents results on the evidence snapshot SHA above. Because adding this document creates a new commit and triggers CI again, its results do not replace final checks for the eventual current PR head. Always re-check the exact head SHA.

## 1. Final workflow results for the evidence snapshot

| Workflow | Run | Result | Detail |
|---|---|---|---|
| CI Pipeline — candidate validation/release gates | [39308436533](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436533) | PASS | Typecheck, lint, security regression, migration safety, domain/operational suites, forensic suite, accessibility checks, Next.js build and browser accessibility steps completed; job concluded success. |
| POP-1.0 Production Infrastructure Pipeline | [39308436564](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436564) | PASS with explicit skips | Validation job succeeded. Separate staging health and production edge/canary jobs were skipped, not executed. No staging/production health claim may be inferred from this pass. |
| CI Pipeline — additional release-gate run | [39308422997](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308422997) | PASS | Final job conclusion was success for the snapshot SHA. |
| Audit Framework Verification | [39308436491](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436491) | PASS | Loader tests, structural audit validation and audit report artifact completed. |
| Security Scans | [39308438140](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308438140) | PASS with scope limitation | Gitleaks succeeded; OSV differential reporter concluded no newly introduced issues. Scheduled/current full dependency inventory was skipped. |
| Vercel Preview Comments | [check](https://github.com/thebreakdowndaily/thebreakdown-os/runs/118251506545) | PASS | No unresolved preview feedback was reported. This does not constitute security or editorial approval. |
| `verify` | [check](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436491/job/118251448303) | PASS | Audit framework job concluded successfully. |

All statuses above refer to `8fbfc3eee417f311aa21ef090737026ec3ad6230`. The three deployment-health/current-inventory skips remain skips and are not counted as passes.

## 2. Job log evidence and qualifications

The candidate validation workflow log shows the relevant type, lint, security, migration, operational, accessibility, forensic and build steps completing under a successful job conclusion. The Next.js build completed, but compiled with warnings and emitted Sentry messages that no authentication token was configured for release/source-map upload. This was a CI build warning, not a failed build.

The decoded install logs in the audit/security-related workflows included npm install-time vulnerability summaries:

- Root project dependency installation: **48 reported vulnerabilities — 8 moderate, 40 high**.
- Separate `audit/` tool dependency installation: **36 reported vulnerabilities — 3 moderate, 33 high**.

These are npm install-time summary counts seen in the logs; this document does not claim all are production runtime exploitable, nor does it infer their full reachability. They remain untriaged inventory findings and must be matched to the relevant package manifests, dependency paths, development/production use, fix availability, and approved risk disposition. Do not use the OSV differential check’s “No issues found” as proof that the full existing dependency baseline is vulnerability-free.

The OSV differential workflow’s underlying scanner invocations ran with `--fail-on-vuln=true`; their individual scanner commands returned exit code 1, after which the workflow’s result-check and reporter steps completed successfully and printed “No issues found” for the change comparison. Interpret this as the workflow’s differential result—not as a universal statement that either dependency tree has zero known vulnerabilities.

## 3. Artifact links

These retained GitHub Actions artifacts are available from the evidence snapshot workflows:

- [Playwright accessibility report](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436533/artifacts/12215376467)
- [Audit framework report](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308436491/artifacts/12215265819)
- [Gitleaks results](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308438140/artifacts/12215365521)
- [OSV baseline scan JSON](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308438140/artifacts/12214353276)
- [OSV candidate scan JSON](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308438140/artifacts/12213748649)
- [OSV Scanner SARIF](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39308438140/artifacts/12214048517)

Use the job/run pages for full logs and test step output. These artifacts do not supply the missing before/after PostgreSQL schema and ACL snapshots.

## 4. Required remaining evidence

- [ ] Run or otherwise obtain an explicitly approved, non-mutating full/current dependency inventory and triage the observed npm audit counts. If it stays skipped, record the reason and approval; do not call the full baseline clean.
- [ ] Preserve exact command output for all claimed 274 security assertions and isolated PostgreSQL rollback tests, linked to the final current head.
- [ ] Capture the disposable PostgreSQL baseline and post-migration/post-rollback trigger/function/ACL/owner/role-membership/dependency/outbox diffs from the exact tracked migration chain.
- [ ] Prove the `publication_outbox` pre-existence condition and resolve the `DROP TABLE ... CASCADE` data/dependency risk.
- [ ] Prove whether the legacy six-argument `fn_publish_story_fenced` overload exists before migration; if present, capture and restore its exact definition and grants or enforce an independently approved, evidenced precondition.
- [ ] Receive an explicit decision from an eligible, independent non-author human reviewer on the final current PR head.

## 5. Decision

**CI status for snapshot SHA:** principal CI, security differential and audit workflow runs passed; deployment-health and full dependency-inventory checks were skipped.  
**Evidence status:** partially assembled; retained CI artifacts are linked above, but baseline database/ACL evidence and fully triaged dependency inventory remain open.  
**Independent review:** not obtained.  
**Release decision:** **STRICT NO-GO — PR #93 remains draft.** No merge, deployment, live migration/rollback, publishing-worker activation, or story publication is authorized by this addendum.
