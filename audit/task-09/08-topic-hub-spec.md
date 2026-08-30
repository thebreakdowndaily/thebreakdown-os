# TASK-09 — Topic-Hub Content Model Spec

- **Ticket:** TASK-09 (Phase D)
- **Problem:** Topic hubs rendered only `storyGroups.latest.slice(0,4)` — recency-only truncation. A materially more useful five-month-old story could disappear from its own hub whenever four newer stories existed.
- **Evidence:** All 7 TASK-06 pilots were verified as canonical members of their hubs (via `topic.stories`), yet `/topic/economy`, `/topic/geopolitics`, and `/topic/environment` did not surface any pilot story in the TASK-08 crawl — because 4+ newer stories existed on those hubs and pilots were older. The membership data was never the problem; the rendering model was.
- **Approach per ticket §11–13:** A deterministic topic-hub content model built from the **existing TASK-03/TASK-05 pipeline outputs** (server-rendered, no new client JS, no new infrastructure, no new scoring engine).

---

## 1. Ranking inputs (already canonical)

The KnowledgeTopicPipeline (`services/topics/pipeline/stories.ts`) already computes six deterministic groups from the StoryAggregator:

| Group | Definition | Maps to product axis |
|---|---|---|
| `latest` | Topic stories, newest first | Freshness |
| `important` | `impactLevel` in `{critical, high}` | Importance |
| `highestEvidence` | `evidenceScore >= 90`, score-desc | Evidence / Authority |
| `trending` | Recent + non-low impact | Freshness × Importance |
| `historical` | `publishedAt` older than 1 year | Evergreen context |
| `recommended` | Top-3 highest-evidence stories | Editorial evidence anchor |

These inputs already encode **Freshness + Importance + Authority**. No new score is introduced (per ticket §13: *"Do not introduce a complex score unless there is a real need"* — the demand is already captured by existing signals).

---

## 2. Section model

Rendered in this stable priority order. Each section is rendered only when non-empty. Every story is rendered **at most once per page**, under its highest-priority section.

| Priority | Section | Source group | Cap |
|---|---|---|---|
| 1 | **In Focus** | `recommended` | 3 |
| 2 | **Latest Intelligence** | `latest` | 6 |
| 3 | **Deep Research** | `highestEvidence` (minus shown) | 4 |
| 4 | **Important Developments** | `important` (minus shown) | 4 |
| 5 | **From the Archive** | `historical` (minus shown) | 4 |

This replaces `latest.slice(0,4)` with a composition:

```
FRESHNESS  +  IMPORTANCE  +  EVIDENCE  +  EVERGREEN
```

---

## 3. Guarantees

1. **No arbitrary truncation bump.** The change is structural, not a larger `slice`.
2. **Page-level dedupe.** A story appears exactly once — under its most meaningful bucket (evidence/featured beats recency beats archive).
3. **Deterministic.** Given the same canonical data, the same hub renders the same sections — reproducible and testable.
4. **Perf-neutral.** Sections are server-rendered from an already-computed view model using the existing `StoryCard` primitive. Zero additional client-side JavaScript.
5. **Degrades gracefully.** Empty groups render no section; a hub with a single story still shows "Latest Intelligence".
6. **Backwards compatible.** The view-model contract (`storyGroups`) and the canonical pipeline are unchanged.

---

## 4. Why this satisfies "balance" (ticket §12)

A five-month-old cornerstone story with an evidence score ≥90 lands in **In Focus** or **Deep Research** regardless of how many newer stories exist, because those sections are recency-independent. The pilots are the proof: `mgnrega-reform` (score 94) and `pm-fasal-bima-claims` (97) now surface on every hub where they are members regardless of five newer economy stories.

---

## 5. Data-quality note surfaced by this change

The `important` group was empty across the site because no story in the data layer set `impactLevel`. TASK-09 therefore assigns a verified editorial `impactLevel` to the seven pilot stories (see `09-entity-review.csv` / store change), making the "Important Developments" section meaningful for pilot hubs.