import Link from 'next/link';
import type { APITopic } from '@/utils/data-layer/types';
import TopicCard from './TopicCard';

interface TopicExplorerProps {
  topics: APITopic[];
}

export default function TopicExplorer({ topics }: TopicExplorerProps) {
  if (topics.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-gray-800/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-start gap-4 mb-10">
          <div className="w-1 h-10 bg-amber-500 rounded-full shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Explore Topics</h2>
            <p className="mt-1 text-sm text-gray-400">Follow the stories shaping India and the world.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/5 hover:text-amber-300 transition-all duration-200"
          >
            Explore All Topics
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
