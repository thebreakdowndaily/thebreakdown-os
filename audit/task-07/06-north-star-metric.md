# North Star Metric — Reader Understanding (v1.0)

## Definition

> **Reader Understanding Rate = (sessions reaching `story_completed` OR an equivalent
> learning-completion marker) ÷ (sessions that opened a story).**

Computed per session on production data only. Measured when `story_completed`
(count current session) fires for a story whose `story_opened` also fired in the
same session.

## Why this is the North Star

| Candidate | Rejected? | Reason |
|-----------|-----------|--------|
| Page views | Yes | Vanity; rewards clickbait and tab-opening. Contradicts AGENTS.md success metrics. |
| Time on page | Yes | Rewards slow reading and open tabs; penalizes efficient learners. |
| Social shares | Yes | Measures distribution, not comprehension. |
| **Reader Understanding Rate** | **No — adopted** | Measures whether readers complete the evidence spine — the institution's reason to exist. |

## How it is measured

```
                      sessions_with_story_completed_in_session
Understanding Rate = ────────────────────────────────────────────
                        sessions_with_story_opened

Funnel completions roll up to collections: a chapter completion counts once.
```

Metrics build on the canonical events `story_opened` (@tbd_quant) and
`story_completed`, joined by GA4 session ID. Pending GA4 data-stream access
(see 01-access-audit.csv), the rate is `NOT VERIFIED`.

## Guardrails

1. **No fabrication.** Baselines are `NOT VERIFIED — PRODUCTION ACCESS REQUIRED` until
   GA4 + GSC data streams are confirmed.
2. **Learning intent is not skip-depth.** A reader who opens a story and immediately
   bounces does not count toward the numerator.
3. **Completion threshold is fixed at 90% scroll depth** so the metric cannot drift.
4. **Institutional Trust Index (AGENTS.md) remains the supreme metric.** Reader
   Understanding Rate measures reader-level success; the Trust Index measures
   institutional health and can halt publication.

## Next action

- Confirm GA4 property access and turn on demo + advanced params.
- Enable GA4 Explorations using `story_opened` / `story_completed` / `landing`.
- Set a first floor: Understanding Rate ≥ baseline observed after 30 production days.