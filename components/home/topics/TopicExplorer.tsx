'use client';

import Link from 'next/link';
import type { APITopic } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TopicIcon from './TopicIcon';
import TopicMeta from './TopicMeta';
import Skeleton from '@/components/ui/Skeleton';

interface TopicExplorerProps {
  topics: APITopic[];
}

export default function TopicExplorer({ topics }: TopicExplorerProps) {
  if (topics.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60" aria-labelledby="topics-heading">
      <Container as="div" className="py-16 sm:py-20 lg:py-24">
        <SectionHeader
          eyebrow="Knowledge Hub"
          title="Explore Topics"
          description="Follow the stories shaping India and the world."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {topics.map((topic) => (
            <article key={topic.id} className="group">
              <Link href={`/topic/${topic.slug}`} className="block h-full" aria-label={`Explore ${topic.name} topic`}>
                <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-[#D4A843]/30 hover:shadow-[0_0_30px_rgba(212,168,67,0.08)]" accent="gold">
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start gap-3">
                      <TopicIcon slug={topic.slug} size="lg" />
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors duration-200 truncate">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-[#A1A1AA] mt-0.5 line-clamp-2">{topic.description}</p>
                      </div>
                    </div>

                    <TopicMeta
                      storyCount={topic.storyCount}
                      entityCount={topic.entityCount}
                      updatedAt={topic.updatedAt}
                    />

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
                      View Intelligence
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Card>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-16 text-center">
          <Button href="/topics" variant="secondary" className="inline-flex px-8 py-4 text-base">
            Explore All Topics
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function TopicExplorerSkeleton() {
  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60" aria-hidden="true">
      <Container as="div" className="py-16 sm:py-20 lg:py-24">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
          <Skeleton className="h-6 w-40" variant="rect" />
          <Skeleton className="h-10 w-48" variant="rect" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group">
              <Skeleton className="flex-1" variant="rect" height="300px" />
            </div>
          ))}
        </div>
        <div className="mt-10 sm:mt-12 lg:mt-16 text-center">
          <Skeleton className="h-10 w-48 mx-auto" variant="rect" />
        </div>
      </Container>
    </section>
  );
}