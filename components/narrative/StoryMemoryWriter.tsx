'use client';

/**
 * StoryMemoryWriter — Passive localStorage Story Record
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 3 (Narrative Memory)
 *
 * Writes the current story slug and headline to localStorage key `tb_last_story`
 * once on mount, enabling NarrativeMemory to display the returning reader banner.
 *
 * Strictly passive write — single key, two string fields only.
 * No journey tracking. No reading progress. No recommendations.
 * Renders nothing to the DOM — side-effect only.
 */

import { useEffect } from 'react';

const STORAGE_KEY = 'tb_last_story';

interface StoryMemoryWriterProps {
  slug: string;
  headline: string;
}

export default function StoryMemoryWriter({ slug, headline }: StoryMemoryWriterProps) {
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ slug, headline })
      );
    } catch {
      // localStorage may be unavailable (private browsing, storage full, etc.)
      // Fail silently — this is a non-critical enhancement.
    }
  // Write once on mount only — slug/headline are stable for the lifetime of the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
