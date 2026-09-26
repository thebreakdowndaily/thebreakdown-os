import type { Metadata } from 'next';
import { getPublicStories } from '@/utils/data-layer/store';
import StoriesArchive from '@/components/stories/StoriesArchive';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Stories & Investigations — The Breakdown',
  description:
    'Deep, evidence-first explainers, analyses, and investigations on Indian policy, economy, geopolitics, and governance.',
  openGraph: {
    title: 'Stories & Investigations — The Breakdown',
    description:
      'Deep, evidence-first explainers, analyses, and investigations on Indian policy, economy, geopolitics, and governance.',
    url: 'https://thebreakdown.in/stories',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thebreakdown.in/stories',
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

export default function StoriesPage() {
  const { data: stories } = getPublicStories({ pageSize: 100 });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Stories', href: '/stories' },
          ]}
        />

        {/* Page Header */}
        <header className="space-y-4 max-w-3xl border-b border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/30">
            Editorial Archive
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white leading-tight">
            Stories & Investigations
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed">
            Every story is grounded in statutory records, parliamentary data, and verified primary sources.
            Filter by topic or search our investigative archive.
          </p>
        </header>

        {/* Main Stories Archive Component */}
        <main id="stories-archive" aria-label="Stories Archive">
          <StoriesArchive initialStories={stories} />
        </main>
      </div>
    </div>
  );
}
