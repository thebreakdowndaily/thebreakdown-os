'use client';

/**
 * SaveStoryButton — save/unsave a story to the device-local library.
 * TASK-24 — Save / Bookmark. Governed by: TASK-24 (Save / Bookmark),
 * A11Y: aria-pressed toggle; keyboard-operable.
 *
 * No account is required: saves are device-local (see reader-state.ts).
 *
 * Same useSyncExternalStore pattern as TopicFollowButton — the server
 * snapshot keeps SSR/hydration in sync; the store has no events to subscribe
 * to, so the toggle forces a re-render after writing.
 */
import { useReducer, useSyncExternalStore } from 'react';
import { noStoreSubscribe, readerState } from '@/lib/retention/reader-state';
import { captureEvent } from '@/lib/analytics/capture';

interface SaveStoryButtonProps {
  slug: string;
  headline: string;
}

export default function SaveStoryButton({ slug, headline }: SaveStoryButtonProps) {
  const [, forceRerender] = useReducer((x: number) => x + 1, 0);
  const saved = useSyncExternalStore(
    noStoreSubscribe,
    () => readerState().isSaved(slug),
    () => false
  );

  const toggle = () => {
    const state = readerState();
    if (saved) {
      state.unsaveStory(slug);
      captureEvent('story_unsaved', { content_id: slug, content_type: 'story' });
    } else {
      state.saveStory(slug, headline);
      captureEvent('story_saved', { content_id: slug, content_type: 'story' });
    }
    forceRerender();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from your saved library' : 'Save story to your library'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        saved
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
          : 'border-neutral-700 text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-400'
      }`}
    >
      <span aria-hidden="true">{saved ? '✓' : '🔖'}</span>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}