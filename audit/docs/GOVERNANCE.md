# Governance

## Overview
This document defines the governance model for the Audit-as-Code platform. As the framework has matured into Version 1.0.0, the core architecture is frozen. Future modifications must adhere strictly to these principles, prioritizing operational stability, consistent reporting, and decoupled plugin capabilities.

## Architectural Scope (Version 1)
A Version 1 plugin should **validate repository evidence and configuration**, not infer runtime quality.
This principle ensures that audits remain:
- **Fast**: Executing purely on static code and configurations rather than requiring live environments.
- **Deterministic**: Producing identical outputs across multiple identical runs.
- **Reproducible**: Without relying on unpredictable external APIs.

Plugins that require dynamic runtime analysis (e.g. running browser-based visual regression testing against a live URL) are out of scope for v1.x and should be evaluated for v2.0 integrations.

## Modifying Policies and Thresholds
All plugin rule adjustments (e.g. changing an `optional` folder to `required`, or altering the severity of a finding from `high` to `critical`) must be done through the `policy.json` file of that respective plugin.

Code changes should ONLY be introduced to support new capabilities, not to tweak tolerances.

## Proposing New Plugins
New plugins must be proposed and reviewed against the following criteria:
1. **Repository-centric**: Can it evaluate state based on static files, manifests, or dependencies?
2. **Standardized Telemetry**: Does it emit a `0-100` score and coverage metrics?
3. **Deterministic**: Will it yield the exact same score across different developer machines?

New capabilities that satisfy these criteria should be added as new plugins (e.g. `audit/plugins/my-new-audit`) rather than bloating the existing `architecture-audit` or `operations-audit`.

## Version Upgrades
- Changes to `AuditResult` or the core report aggregator schema demand a bump in `schemaVersion` or `reportVersion`, typically culminating in a **Major version upgrade (v2.0)** of the framework SDK.
- Changes to `policy.json` demand an internal bump to `policyVersion` but do not break framework contracts.
