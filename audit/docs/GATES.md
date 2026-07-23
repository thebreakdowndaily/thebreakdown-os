# Quality Gates & CI Lifecycle

## Overview
This document defines how Audit-as-Code reports determine CI/CD outcomes. A core tenet of the framework is that audits are read-only verifications; they do not modify code, but their failure states dictate deployment readiness.

## Plugin Lifecycle States
Every plugin execution ultimately resolves to a `LifecycleState`:
- **PASSED**: The plugin executed fully and its final `score` exceeded the configured minimum threshold (typically `> 80`, though dictated by the plugin's internal logic). No `critical` findings were discovered.
- **FAILED**: The plugin executed fully, but discovered `critical` violations OR the `score` dropped below the acceptable threshold. Also triggered if the plugin execution threw an unhandled exception or timed out.
- **SKIPPED**: The plugin was bypassed (e.g. via `--skip` flag or due to a failure in a topological dependency).

## CI Failure Thresholds

### 1. Hard Fails (Build Broken)
The CI pipeline (`audit.ts`) will exit with a non-zero code (`1`), breaking the build, under any of the following conditions:
- **Critical Findings**: Any plugin emits one or more findings with a `severity: "critical"`.
- **Framework Errors**: The Plugin SDK throws a structural exception (e.g. invalid manifest, cyclical dependency, missing plugin entry point).
- **Timeouts**: A plugin exceeds its allotted execution `timeoutMs`.

### 2. Soft Fails (Warning / Reporting)
The following scenarios will NOT break the build, but will drag down the Platform Health Score (PHS) and emit metrics indicating a decline in quality:
- Findings of `high`, `medium`, or `low` severity.
- Reductions in a plugin's `score` that do not cross the terminal failure threshold.

## Gate Evolution
The threshold for a `FAILED` state is defined via policy (e.g. `policy.json` for each plugin). Modifying a policy from a Soft Fail to a Hard Fail requires review under the standards set forth in `GOVERNANCE.md`.
