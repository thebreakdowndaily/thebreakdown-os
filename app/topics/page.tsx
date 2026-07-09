import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopics } from '@/utils/data-layer/store';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Topics — The Breakdown',
  description: 'Explore data-driven coverage of Indian policy, economy, technology, and more.',
  openGraph: { title: 'Topics — The Breakdown', url: 'https://thebreakdown.in/topics' },
};

export default function TopicsPage() {
  const { data: topics } = getTopics({ pageSize: 50 });
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Topics</h1>
        <p className="text-gray-400 text-lg mb-8">Explore data-driven coverage across key areas.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/topic/${topic.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <h2 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">{topic.name}</h2>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{topic.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{topic.storyCount} stories</span>
                <span>{topic.entityCount} entities</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
