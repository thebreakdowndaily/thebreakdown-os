import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopics } from '@/utils/data-layer/store';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Topic Directory — The Breakdown',
  description:
    'Explore The Breakdown’s evidence-based reporting and explainers organized by policy, economic, and geopolitical domains.',
  alternates: {
    canonical: 'https://thebreakdown.in/topics',
  },
  openGraph: {
    title: 'Topic Directory — The Breakdown',
    description:
      'Explore The Breakdown’s evidence-based reporting and explainers organized by policy, economic, and geopolitical domains.',
    url: 'https://thebreakdown.in/topics',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

export default function TopicsPage() {
  const { data: topics } = getTopics({ pageSize: 100 });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Topics', href: '/topics' },
          ]}
        />

        {/* Directory Header */}
        <header className="space-y-4 max-w-3xl border-b border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/30">
            Topic Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white leading-tight">
            Explore by Topic
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed">
            Navigate all reporting, explainers, and investigations by domain. Every topic connects verified claims,
            timelines, and institutional tracking.
          </p>
        </header>

        {/* Topics Grid */}
        <main id="topics-grid" aria-label="Topics Directory" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const stories = topic.stories || [];
            const storyCount = topic.storyCount || stories.length;

            return (
              <div
                key={topic.slug}
                className="group flex flex-col justify-between bg-[#14161C] rounded-2xl border border-neutral-800 p-6 hover:border-amber-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
                      {storyCount} {storyCount === 1 ? 'Story' : 'Stories'}
                    </span>
                    {topic.entities && topic.entities.length > 0 && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        {topic.entities.length} tracked entities
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold font-serif text-white group-hover:text-amber-400 transition-colors mb-3 leading-snug">
                    <Link href={`/topic/${topic.slug}`}>
                      {topic.name}
                    </Link>
                  </h2>

                  <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3 mb-6">
                    {topic.description}
                  </p>

                  {/* Stories Preview List */}
                  {stories.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-neutral-800/80 mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                        Recent Coverage
                      </span>
                      <ul className="space-y-2 text-xs">
                        {stories.slice(0, 2).map((s) => (
                          <li key={s.slug} className="truncate">
                            <Link
                              href={`/story/${s.slug}`}
                              className="text-neutral-300 hover:text-amber-400 transition-colors"
                            >
                              • {s.headline}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono">
                    /topic/{topic.slug}
                  </span>
                  <Link
                    href={`/topic/${topic.slug}`}
                    className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Topic <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
