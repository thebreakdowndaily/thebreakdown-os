# Incident Response Runbook

This document details the operational process for addressing anomalies detected on the live platform.

## 1. Triage & Incident Classification
An event is classified as:
- **P0 Critical:** Data leaks, database corruption, global outage. (Trigger rollback runbook).
- **P1 High:** Localized feature degradation (e.g. search breaks for certain terms, rendering errors on specific chapters). (Trigger hotfix process).
- **P2 Medium:** Non-blocking CSS rendering variance, analytics event leaks. (Resolve in standard sprint backlog).

## 2. Team Communication Channel
- Set up an immediate sync/war-room.
- Direct notification to:
  - Engineering Lead
  - Site Reliability Engineer / Ops
  - Product/Editor-in-Chief

## 3. Incident Lifecycle
1. **Identify:** Diagnose error signatures using Sentry, Cloudflare Logs, and DB metrics.
2. **Mitigate:** Deploy hotfix or rollback to stabilize the system.
3. **Analyze:** Hold a post-mortem to analyze the root cause and document preventive actions.
