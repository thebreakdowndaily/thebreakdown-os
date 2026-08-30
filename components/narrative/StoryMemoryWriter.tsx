'use client';

/**
 * StoryMemoryWriter — Passive localStorage Story Record
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 3 (Narrative Memory)
 *
 * Writes the current story slug and headline to localStorage keys:
 * - `tb_last_story`: Legacy single-story record for NarrativeMemory
 * - `tb_reading_history`: Array of max 20 recent stories
 */

import { useEffect } from 'react';

const STORAGE_KEY_LAST = 'tb_last_story';
const STORAGE_KEY_HISTORY = 'tb_reading_history';
const MAX_HISTORY = 20;

export interface HistoryEntry {
  slug: string;
  headline: string;
  readAt: number;
}

export function readStoryHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => typeof item.slug === 'string' && typeof item.headline === 'string' && typeof item.readAt === 'number'
      ) as HistoryEntry[];
    }
  } catch {
    // Ignore errors
  }
  return [];
}

interface StoryMemoryWriterProps {
  slug: string;
  headline: string;
}

export default function StoryMemoryWriter({ slug, headline }: StoryMemoryWriterProps) {
  useEffect(() => {
    try {
      // Legacy write
      localStorage.setItem(
        STORAGE_KEY_LAST,
        JSON.stringify({ slug, headline })
      );

      // History write
      const history = readStoryHistory();
      const now = Date.now();
      
      // Deduplicate and insert at front
      const filtered = history.filter(item => item.slug !== slug);
      filtered.unshift({ slug, headline, readAt: now });
      
      // Trim to max
      if (filtered.length > MAX_HISTORY) {
        filtered.length = MAX_HISTORY;
      }
      
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
    } catch {
      // localStorage may be unavailable (private browsing, storage full, etc.)
      // Fail silently — this is a non-critical enhancement.
    }
  // Write once on mount only — slug/headline are stable for the lifetime of the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
