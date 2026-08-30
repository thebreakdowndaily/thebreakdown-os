/**
 * ReaderState — device-local reader library state.
 * TASK-24 — Returning Reader Pathways / Reader State Handling.
 * Governed by: TASK-24 (Returning Reader Pathways, Reader-State Handling).
 *
 * Device-local means:
 *  - No account is required to follow a topic or save a story.
 *  - State is stored in localStorage, keyed per browser, never transmitted.
 *  - Reads/writes are tolerant of storage being unavailable.
 *
 * Storage keys are namespaced `tb_` and versioned for migration safety.
 */

import type { HistoryEntry } from '@/components/narrative/StoryMemoryWriter';
import { readStoryHistory } from '@/components/narrative/StoryMemoryWriter';

const FOLLOW_KEY = 'tb_followed_topics_v1';
const SAVE_KEY = 'tb_saved_stories_v1';
const VISIT_KEY = 'tb_topic_visits_v1';

export interface FollowedTopic {
  slug: string;
  name: string;
  followedAt: number;
}

export interface SavedStory {
  slug: string;
  headline: string;
  savedAt: number;
}

/** Minimal storage abstraction so the store is unit-testable without a browser. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type FollowMap = Record<string, FollowedTopic>;
type SaveMap = Record<string, SavedStory>;
type VisitMap = Record<string, number>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed === null || typeof parsed !== 'object' ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

/**
 * Creates a storage-bound reader state. `store` defaults to `localStorage`
 * (browser only). Tests inject an in-memory store.
 */
export function createReaderState(store: KeyValueStore | null) {
  function read<T>(key: string, fallback: T): T {
    if (!store) return fallback;
    try {
      return safeParse<T>(store.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function write(key: string, value: unknown): void {
    if (!store) return;
    try {
      store.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full / unavailable — non-critical, ignore.
    }
  }

  return {
    isFollowing(slug: string): boolean {
      return slug in read<FollowMap>(FOLLOW_KEY, {});
    },

    followTopic(slug: string, name: string): void {
      const map = read<FollowMap>(FOLLOW_KEY, {});
      map[slug] = { slug, name, followedAt: Date.now() };
      write(FOLLOW_KEY, map);
    },

    unfollowTopic(slug: string): void {
      const map = read<FollowMap>(FOLLOW_KEY, {});
      const next: FollowMap = {};
      for (const [key, value] of Object.entries(map)) {
        if (key !== slug) next[key] = value;
      }
      write(FOLLOW_KEY, next);
    },

    getFollowedTopics(): FollowedTopic[] {
      const map = read<FollowMap>(FOLLOW_KEY, {});
      return Object.values(map).sort((a, b) => b.followedAt - a.followedAt);
    },

    isSaved(slug: string): boolean {
      return slug in read<SaveMap>(SAVE_KEY, {});
    },

    saveStory(slug: string, headline: string): void {
      const map = read<SaveMap>(SAVE_KEY, {});
      map[slug] = { slug, headline, savedAt: Date.now() };
      write(SAVE_KEY, map);
    },

    unsaveStory(slug: string): void {
      const map = read<SaveMap>(SAVE_KEY, {});
      const next: SaveMap = {};
      for (const [key, value] of Object.entries(map)) {
        if (key !== slug) next[key] = value;
      }
      write(SAVE_KEY, next);
    },

    getSavedStories(): SavedStory[] {
      const map = read<SaveMap>(SAVE_KEY, {});
      return Object.values(map).sort((a, b) => b.savedAt - a.savedAt);
    },

    markTopicVisited(slug: string): void {
      const map = read<VisitMap>(VISIT_KEY, {});
      map[slug] = Date.now();
      write(VISIT_KEY, map);
    },

    getLastTopicVisit(slug: string): number | null {
      const map = read<VisitMap>(VISIT_KEY, {});
      return map[slug] ?? null;
    },
  };
}

export type ReaderState = ReturnType<typeof createReaderState>;

let cachedState: ReaderState | null = null;

function browserStore(): KeyValueStore | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Singleton reader state bound to the browser localStorage (or null during SSR). */
export function readerState(): ReaderState {
  if (!cachedState) cachedState = createReaderState(browserStore());
  return cachedState;
}

/** Re-read device-local reading history (capped for display). */
export function getReadingHistory(): HistoryEntry[] {
  return readStoryHistory();
}

/** Subscribe no-op for useSyncExternalStore — the device-local store emits no events. */
export function noStoreSubscribe(): () => void {
  return () => {};
}