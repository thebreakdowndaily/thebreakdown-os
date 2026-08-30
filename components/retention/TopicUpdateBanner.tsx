'use client';

/**
 * TopicUpdateBanner — "What changed" returning-reader pathway.
 * TASK-24 — Investigation / Update Pathways. Governed by: TASK-24
 * (Investigation/Update Pathways; no speculative recommendation logic).
 *
 * Deterministic surface: records the reader's last visit to a topic and, on
 * a later visit, shows how many stories were published or updated since.
 * Pure device-local math over the story metadata the server already renders —
 * no recommendation model, no personalization.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { readerState } from '@/lib/retention/reader-state';

interface TopicUpdateBannerProps {
  slug: string;
  stories: Array<{ slug: string; publishedAt: string; updatedAt: string }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function TopicUpdateBanner({ slug, stories }: TopicUpdateBannerProps) {
  const [ready, setReady] = useState(false);
  const [changedCount, setChangedCount] = useState(0);
  const [latestSlug, setLatestSlug] = useState<string | null>(null);
  const [lastVisitTs, setLastVisitTs] = useState<number | null>(null);

  useEffect(() => {
    const state = readerState();
    const lastVisit = state.getLastTopicVisit(slug);
    state.markTopicVisited(slug);
    // lastVisit is read BEFORE the visit write to preserve the "since your
    // last visit" baseline for this session; a reactive snapshot would re-read
    // the just-written value and collapse the banner on the next render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastVisitTs(lastVisit);

    const changed = stories.filter((s) => {
      const ts = Math.max(new Date(s.publishedAt).getTime(), new Date(s.updatedAt).getTime());
      return lastVisit !== null && ts > lastVisit;
    });
    setChangedCount(changed.length);
    if (changed.length > 0) setLatestSlug(changed[0].slug);
    setReady(true);
  }, [slug, stories]);

  const label = useMemo(() => {
    if (!ready || changedCount === 0) return null;
    return changedCount === 1 ? '1 story is new here' : `${String(changedCount)} stories are new here`;
  }, [ready, changedCount]);

  if (!ready || changedCount === 0) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
    >
      <span aria-hidden="true" className="text-emerald-400">●</span>
      <p className="text-sm text-emerald-200">
        <strong>{label}</strong> since your last visit.
      </p>
      {latestSlug && (
        <Link
          href={`/story/${latestSlug}`}
          className="text-sm text-emerald-400 underline underline-offset-4 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
        >
          See what changed
        </Link>
      )}
      <time className="ml-auto text-xs font-mono text-neutral-500 hidden sm:block">
        Last visit {lastVisitDaysAgo()}
      </time>
    </div>
  );

  function lastVisitDaysAgo() {
    if (lastVisitTs == null) return 'unknown';
    const days = Math.floor((Date.now() - lastVisitTs) / DAY_MS);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${String(days)} days ago`;
  }
}