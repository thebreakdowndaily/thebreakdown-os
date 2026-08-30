'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readStoryHistory, HistoryEntry } from '@/components/narrative/StoryMemoryWriter';

interface RecentlyReadProps {
  currentSlug: string;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentlyRead({ currentSlug }: RecentlyReadProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = readStoryHistory();
    // Filter out current story and cap at 5
    const filtered = stored.filter(item => item.slug !== currentSlug).slice(0, 5);
    setHistory(filtered);
  }, [currentSlug]);

  if (!isClient || history.length === 0) return null;

  return (
    <section aria-label="Recently Read Stories" className="my-12 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
      <h3 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Recently Read
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {history.map((item) => (
          <Link
            key={item.slug}
            href={`/story/${item.slug}`}
            className="flex-none w-64 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/60 hover:border-emerald-500/50 hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 snap-start"
          >
            <p className="text-sm font-medium text-neutral-200 line-clamp-2 mb-2 leading-snug">
              {item.headline}
            </p>
            <p className="text-xs font-mono text-neutral-500">
              {timeAgo(item.readAt)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
