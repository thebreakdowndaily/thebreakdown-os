import Link from 'next/link';
import type { APIStory } from '@/utils/data-layer/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface InvestigationsSectionProps {
  stories: APIStory[];
}

export default function InvestigationsSection({ stories }: InvestigationsSectionProps) {
  if (stories.length === 0) return null;
  return (
    <section className="py-16 sm:py-20" aria-labelledby="investigations-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 rounded-full mb-2">High Confidence</span>
            <h2 id="investigations-heading" className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">Latest Investigations</h2>
          </div>
          <Link
            href="/investigations"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#D4A843] hover:text-[#D4A843]/80 transition-colors duration-200"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stories.map((story) => (
            <article key={story.id} className="group">
              <Link href={`/story/${story.slug}`} className="block" aria-label={`Read: ${story.headline}`}>
                <Card className="relative overflow-hidden h-full" accent="green">
                  <div className="p-5 sm:p-6 flex flex-col h-full">
                    <div className="mb-3">
                      <Badge variant="category">{story.category}</Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug group-hover:text-[#D4A843] transition-colors duration-200 line-clamp-3">
                      {story.headline}
                    </h3>
                    <p className="mt-2 text-sm text-[#A1A1AA] line-clamp-2 flex-1">
                      {story.summary}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z" fill="currentColor" opacity="0.2"/>
                            <path d="M8 3a.5.5 0 01.5.5v4l2.5 1.5a.5.5 0 01-.5.866L7.5 8.5V3.5A.5.5 0 018 3z" fill="currentColor"/>
                          </svg>
                          {story.readingTime} min
                        </span>
                        <span className="text-[#22C55E] font-medium">{story.evidenceScore}%</span>
                      </div>
                      <span className="text-sm font-medium text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Read
                        <svg className="w-4 h-4 ml-1 inline transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
