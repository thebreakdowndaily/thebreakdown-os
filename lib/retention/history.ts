/**
 * Shared device-local reading history storage.
 *
 * This module is intentionally framework-independent so client components and
 * retention services can read the same browser-local record without importing
 * a React component into service code.
 */

export const READING_HISTORY_STORAGE_KEY = 'tb_reading_history';

export interface HistoryEntry {
  slug: string;
  headline: string;
  readAt: number;
}

/** Read validated device-local reading history; SSR and storage failures are empty. */
export function readStoryHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(READING_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: unknown): item is HistoryEntry => {
      if (typeof item !== 'object' || item === null) return false;
      const entry = item as Partial<HistoryEntry>;
      return typeof entry.slug === 'string'
        && typeof entry.headline === 'string'
        && typeof entry.readAt === 'number'
        && Number.isFinite(entry.readAt);
    });
  } catch {
    // localStorage may be disabled, unavailable, or contain invalid JSON.
    return [];
  }
}
