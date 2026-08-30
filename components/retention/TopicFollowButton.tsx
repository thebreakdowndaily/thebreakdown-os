'use client';

/**
 * TopicFollowButton — follow/unfollow a topic with device-local state.
 * TASK-24 — Topic Following. Governed by: TASK-24 (Topic Following),
 * A11Y: buttons are natively keyboard-operable; aria-pressed shows state.
 *
 * No account is required: following is device-local (see reader-state.ts).
 *
 * useSyncExternalStore reads the device-local store directly: the server
 * snapshot (false) keeps SSR/hydration in sync, and the client snapshot is
 * re-checked after hydration. A manual re-render after a toggle is enough —
 * the store has no cross-tab events to subscribe to.
 */
import { useReducer, useSyncExternalStore } from 'react';
import { noStoreSubscribe, readerState } from '@/lib/retention/reader-state';
import { captureEvent } from '@/lib/analytics/capture';

interface TopicFollowButtonProps {
  slug: string;
  name: string;
}

export default function TopicFollowButton({ slug, name }: TopicFollowButtonProps) {
  const [, forceRerender] = useReducer((x: number) => x + 1, 0);
  const following = useSyncExternalStore(
    noStoreSubscribe,
    () => readerState().isFollowing(slug),
    () => false
  );

  const toggle = () => {
    const state = readerState();
    if (following) {
      state.unfollowTopic(slug);
      captureEvent('topic_unfollowed', { topic_id: slug });
    } else {
      state.followTopic(slug, name);
      captureEvent('topic_followed', { topic_id: slug });
    }
    forceRerender();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        following
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
          : 'border-neutral-700 text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-400'
      }`}
    >
      <span aria-hidden="true">{following ? '✓' : '＋'}</span>
      {following ? 'Following' : 'Follow topic'}
    </button>
  );
}