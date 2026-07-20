import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicStories } from '@/utils/data-layer/store';
import Container from '@/components/layout/Container';
import Badge from '@/components/ui/Badge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Stories — The Breakdown',
  description: 'Independent, data-driven stories on Indian policy, politics, and society.',
  openGraph: { title: 'Stories — The Breakdown', url: 'https://thebreakdown.in/stories' },
};

export const revalidate = 60;

export default function StoriesPage() {
  const { data: stories } = getPublicStories({ pageSize: 50 });
  return (
    <>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Stories', href: '/stories' },
      ]} />
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Stories</h1>
        <p className="text-gray-400 text-lg mb-8">All data-driven investigations and analyses.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link key={story.slug} href={`/story/${story.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="category">{story.category}</Badge>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2 leading-snug">{story.headline}</h2>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{story.summary}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{story.author.name}</span>
                <span>{story.readingTime} min</span>
                <span className="text-amber-500/80">{story.evidenceScore}%</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
    </>
  );
}
