# GitHub Project Radar — Evaluation Scorecard

Score each candidate against an explicitly named, current gap in The Breakdown OS. Explain significant scores with repository evidence. This is a triage aid, not a safety certification.

| Dimension | Points | Full-credit evidence |
|---|---:|---|
| Fit to an unmet need | 0–30 | Directly resolves a documented gap or measurable test failure |
| Stack and architecture fit | 0–15 | Fits actual current Node/Next, Supabase, Vercel, and provider boundaries |
| Maintenance and project health | 0–15 | Supported dependencies, credible releases, active maintenance, not archived |
| Engineering quality and security evidence | 0–15 | Relevant tests/CI, transparent dependencies, security response, reproducible setup |
| License and operating constraints | 0–10 | Verified permitted license, acceptable data handling, telemetry, hosting and cost |
| Integration cost and reversibility | 0–10 | Small isolated adoption with clear owner, measurable proof and rollback |
| Evidence quality | 0–5 | Feature confirmed in source/docs/tests rather than a search snippet alone |
| **Total** | **0–100** | |

## Decision bands

- 85–100: strong candidate if all hard gates pass; still run a proof of concept.
- 70–84: worth a small isolated trial.
- 50–69: learn from or watch; adoption case is incomplete.
- Below 50: reject unless the candidate provides a unique critical capability.

## Hard gates

Do not recommend adoption while any applicable gate is unresolved:

1. License is unknown, ambiguous, or incompatible with the documented permissive-license policy.
2. A credible security issue may affect the intended use with no mitigation.
3. The candidate conflicts with architecture, privacy, deployment, budget, or data-handling constraints.
4. The core capability has not been verified in source or authoritative documentation.
5. The hypothesis cannot be tested without production dependency/runtime changes.

## Confidence (separate from score)

- **High:** relevant source and official docs inspected; license, maintenance and main integration assumptions checked.
- **Medium:** docs and metadata are solid, but one major behavior or integration constraint remains unverified.
- **Low:** README/snippet-only, inactive/new upstream, unclear license, or material unknowns.

A high score with low confidence means investigate; it does not mean adopt. Stars/forks never compensate for weak fit or a failed hard gate.
