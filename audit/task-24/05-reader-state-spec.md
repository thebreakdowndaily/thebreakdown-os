# TASK-24 — 05 · Reader-State Specification

**Date:** 2026-08-30
**Status:** Frozen for this task.

---

## 1. Principle

> Reading, bookmarks and follows work without an account. They live on this device.

Reader-state is **device-local**. This is both the architecture and the privacy policy: nothing in the reader-state layer identifies a person, and nothing leaves the browser.

## 2. Storage model

Implementing module: `lib/retention/reader-state.ts`.

| Concern | Storage key | Shape | Cap |
|---------|-------------|-------|-----|
| Followed topics | `tb_followed_topics_v1` | `{ [slug]: { slug, name, followedAt } }` | Follows sorted most-recent-first on read |
| Saved stories | `tb_saved_stories_v1` | `{ [slug]: { slug, headline, savedAt } }` | Saves sorted most-recent-first on read |
| Topic visits | `tb_topic_visits_v1` | `{ [slug]: lastVisitEpochMs }` | Last visit per topic |

Reading history is **not re-implemented**: it reuses the existing `tb_reading_history` (max 20) written by `StoryMemoryWriter`. The store only *reads* it through `getReadingHistory()`.

## 3. Contract

```
isFollowing(slug) → boolean
followTopic(slug, name)          — device-local write; fires topic_followed (component layer)
unfollowTopic(slug)              — device-local write; fires topic_unfollowed (component layer)
getFollowedTopics() → FollowedTopic[]  (most recent first)
isSaved(slug) → boolean
saveStory(slug, headline)        — device-local write; fires story_saved (component layer)
unsaveStory(slug)                — device-local write; fires story_unsaved (component layer)
getSavedStories() → SavedStory[] (most recent first)
markTopicVisited(slug)
getLastTopicVisit(slug) → number | null
getReadingHistory() → HistoryEntry[]   (re-export of StoryMemoryWriter)
```

Events are fired by the **component layer** (`TopicFollowButton`, `SaveStoryButton`), not by the store — the store stays a pure, testable state primitive.

## 4. Storage abstraction

- `createReaderState(store)` takes a `KeyValueStore`; tests inject an in-memory store; production binds `window.localStorage`.
- `readerState()` is a lazily-initialised singleton. Outside the browser (SSR) it binds `null`, and every method no-ops / returns empty — hydration-safe.
- Corrupt JSON, quota-full, or disabled storage never throws (reads fall back to empty; writes are swallowed).
- Keys are versioned (`_v1`) for future migrations.

## 5. Deterministic update surface

`TopicUpdateBanner` computes "N stories are new here" purely as:

```
lastVisit      = readerState().getLastTopicVisit(slug)   // read BEFORE markTopicVisited
markTopicVisited(slug)
changedCount   = count( stories where max(publishedAt, updatedAt) > lastVisit )
```

- First visit (`lastVisit == null`) shows nothing.
- No recommendation model, no personalisation, no server round-trip.
- `publishedAt` / `updatedAt` are the canonical, already-rendered story metadata (governed by the story model), so the surface is deterministic for a given visit history.

## 6. Surfaces

| Surface | Reads | Writes |
|---------|-------|--------|
| `TopicFollowButton` (/topic/[slug]) | `isFollowing` | `followTopic` / `unfollowTopic` |
| `SaveStoryButton` (StoryShell) | `isSaved` | `saveStory` / `unsaveStory` |
| `TopicUpdateBanner` (/topic/[slug]) | `getLastTopicVisit` | `markTopicVisited` |
| `/reader` ReaderDashboard | `getFollowedTopics`, `getSavedStories`, `getReadingHistory` | — |

## 7. Guarantees guaranteed by test

1. Follows/saves are most-recent-first under a controlled clock.
2. Null store (SSR) and corrupt JSON fall back safely.
3. Writes never throw when storage throws.
4. Persisted payloads contain **no email / identity** (asserted directly).
5. Namespacing `tb_*_v1` is asserted.

## 8. Migration / rollback

- Rollback = stop rendering the new buttons/banner; stored keys are inert and namespaced, so no cleanup is required to revert.
- No schema table was changed; no server store was added; no frozen API changed. This is a Level A/B compatible evolution.