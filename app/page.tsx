import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import HomepageLayout from '@/layouts/HomepageLayout';

import Hero from '@/components/home/hero/Hero';
import BreakingIntelligence from '@/components/home/breaking/BreakingIntelligence';
import LatestStories from '@/components/home/latest/LatestStories';
import TrendingTopics from '@/components/home/topics/TrendingTopics';
import EntitySpotlight from '@/components/home/entities/EntitySpotlight';
import KnowledgeGraphPreview from '@/components/home/graph/KnowledgeGraphPreview';
import DataDashboard from '@/components/home/dashboard/DataDashboard';
import Newsletter from '@/components/home/newsletter/Newsletter';
import KnowledgeToday from '@/components/home/breaking/KnowledgeToday';
import AnimatedSection from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'The Breakdown — India Explained',
  description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
  keywords: 'India, journalism, policy, politics, data journalism, investigation, Indian economy, government schemes',
  openGraph: {
    title: 'The Breakdown — India Explained',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    url: 'https://thebreakdown.in',
    siteName: 'The Breakdown',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'The Breakdown — India Explained' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Breakdown — India Explained',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    images: ['/images/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://thebreakdown.in',
  },
};

export default async function HomePage() {
  const services = bootstrapServices();
  const vm = await buildHomepage(services);

  return (
    <HomepageLayout seo={vm.seo}>
      {/* 1. Global Search (In header, usually part of HomepageLayout) */}
      
      {/* 2. Hero Story */}
      {vm.topStory && <Hero story={vm.topStory} />}
      
      {/* 3. Breaking Intelligence */}
      <BreakingIntelligence items={vm.breakingIntelligence} />
      
      {/* 4. Knowledge Today */}
      <AnimatedSection as="div" delay={100}>
        <KnowledgeToday metrics={vm.knowledgeToday} />
      </AnimatedSection>
      
      {/* 5. Latest Stories */}
      <AnimatedSection as="div" delay={200}>
        <LatestStories stories={vm.stories} />
      </AnimatedSection>
      
      {/* 6. Trending Topics */}
      <AnimatedSection as="div" delay={300}>
        <TrendingTopics topics={vm.trendingTopics} />
      </AnimatedSection>
      
      {/* 7. Entity Spotlight */}
      <AnimatedSection as="div" delay={400}>
        <EntitySpotlight entities={vm.entitySpotlights} />
      </AnimatedSection>
      
      {/* 8. Knowledge Graph Preview */}
      <AnimatedSection as="div" delay={500}>
        <KnowledgeGraphPreview />
      </AnimatedSection>
      
      {/* 9. Data Dashboard */}
      <AnimatedSection as="div" delay={600}>
        <DataDashboard data={vm.dataDashboard} />
      </AnimatedSection>
      
      {/* 10. Newsletter */}
      <AnimatedSection as="div" delay={700}>
        <Newsletter />
      </AnimatedSection>
      
    </HomepageLayout>
  );
}
