'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface StoryCard {
  slug: string;
  headline: string;
  summary: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
  if (score >= 60) return 'text-[#D4A843] bg-[#D4A843]/10 border-[#D4A843]/30';
  return 'text-[#A1A1AA] bg-[#A1A1AA]/10 border-[#A1A1AA]/30';
}

type SortMode = 'newest' | 'evidence' | 'read';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'evidence', label: 'Highest Evidence' },
  { key: 'read', label: 'Most Read' },
];

export default function TopicStories({ stories }: { stories: StoryCard[] }) {
  const [sort, setSort] = useState<SortMode>('newest');

  const sorted = useMemo(() => {
    const copy = [...stories];
    switch (sort) {
      case 'newest':
        return copy.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      case 'evidence':
        return copy.sort((a, b) => b.evidenceScore - a.evidenceScore);
      case 'read':
        return copy.sort((a, b) => b.readingTime - a.readingTime);
      default:
        return copy;
    }
  }, [stories, sort]);

  if (stories.length === 0) return null;

  return (
    <section aria-label="Latest stories" className="py-8 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">Latest Stories</h2>
        <div className="flex items-center gap-1 bg-[#151515] rounded-lg border border-[#2A2A2A] p-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSort(opt.key)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                sort === opt.key ? 'bg-[#D4A843] text-[#0A0A0A]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sorted.map((s) => (
          <Link
            key={s.slug}
            href={`/story/${s.slug}`}
            className="group rounded-2xl bg-[#151515] border border-[#2A2A2A] p-5 hover:border-[#D4A843]/30 transition-colors duration-200"
          >
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-3 ${scoreColor(s.evidenceScore)}`}>
              {s.evidenceScore}% Evidence
            </span>
            <h3 className="text-sm font-semibold text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors mb-2 line-clamp-2">
              {s.headline}
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 mb-3">{s.summary}</p>
            <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]/40">
              <time dateTime={s.publishedAt}>
                {new Date(s.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{s.readingTime} min read</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
