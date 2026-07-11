import RelatedStories from './RelatedStories';
import type { Story } from '@/types/canonical';

interface NextExplorationProps {
  stories: Story[];
}

export default function NextExploration({ stories }: NextExplorationProps) {
  if (stories.length === 0) return null;

  return (
    <section aria-label="Next Exploration" className="w-full py-16 sm:py-24 bg-gradient-to-b from-[#0A0A0A] to-[#000000] border-t border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Continue Reading</h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Dive deeper into related investigations and data-driven analysis from The Breakdown.
          </p>
        </div>
        
        <RelatedStories
          stories={stories.map((s) => ({
            slug: s.slug,
            headline: s.headline,
            summary: s.summary,
            heroImage: s.heroImage,
            publishedAt: s.publishedAt,
            readingTime: s.readingTime,
            evidenceScore: s.evidenceScore,
            category: s.category,
          }))}
        />
        
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <a href="/stories" className="px-6 py-3 bg-[#F5F5F5] text-[#121212] font-semibold rounded-lg hover:bg-white transition-colors">
            View All Stories
          </a>
          <a href="/topics" className="px-6 py-3 bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] font-semibold rounded-lg hover:bg-[#1F1F1F] transition-colors">
            Explore Topics
          </a>
        </div>
      </div>
    </section>
  );
}
