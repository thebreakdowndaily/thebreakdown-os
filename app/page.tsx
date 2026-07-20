import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import HomepageLayout from '@/layouts/HomepageLayout';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

import InstitutionHero from '@/components/home/hero/InstitutionHero';
import LatestStories from '@/components/home/latest/LatestStories';
import TrendingTopics from '@/components/home/topics/TrendingTopics';
import EntitySpotlight from '@/components/home/entities/EntitySpotlight';
import KnowledgeGraphPreview from '@/components/home/graph/KnowledgeGraphPreview';
import DataDashboard from '@/components/home/dashboard/DataDashboard';
import Newsletter from '@/components/home/newsletter/Newsletter';
import KnowledgeToday from '@/components/home/breaking/KnowledgeToday';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { TrustBar } from '@/components/home/trust/TrustBar';
import { PrimaryPath } from '@/components/home/primary-path/PrimaryPath';
import { CollectionsPreview } from '@/components/home/collections/CollectionsPreview';

export const metadata: Metadata = {
  title: 'The Breakdown Knowledge Platform — Evidence Before Conclusions',
  description: 'A digital knowledge institution producing evidence-based libraries on Indian policy, history, and society. Every claim verified. Every source cited. Every interpretation transparent.',
  keywords: 'India, knowledge, evidence, history, policy, research, primary sources, verification, non-alignment, partition, constitution',
  openGraph: {
    title: 'The Breakdown Knowledge Platform',
    description: 'Evidence before conclusions. Context before certainty.',
    url: 'https://thebreakdown.in',
    siteName: 'The Breakdown Knowledge Platform',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'The Breakdown Knowledge Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Breakdown Knowledge Platform',
    description: 'Evidence before conclusions. Context before certainty.',
    images: ['/images/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://thebreakdown.in',
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildHomepage(services);

  const libraries = getKnowledgeLibrarySeedData();
  const chapters = libraries.flatMap(l =>
    l.collections.flatMap(c =>
      c.volumes.flatMap(v => v.chapters)
    )
  );
  const totalClaims = chapters.reduce((sum, ch) =>
    sum + ch.content.filter(b => b.type === 'claim').length, 0
  );
  const primarySources = libraries.flatMap(l =>
    l.collections.flatMap(c =>
      c.volumes.flatMap(v => v.chapters.flatMap(ch => ch.content)))
  ).filter(b => b.type === 'document').length;

  const lastVerified = chapters.length > 0
    ? new Date(Math.max(...chapters.map(ch => new Date(ch.lastVerifiedAt || ch.updatedAt).getTime()))).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  return (
    <HomepageLayout seo={vm.seo}>
      {/* 1. Institution Identity */}
      <InstitutionHero
        chaptersPublished={chapters.length}
        claimsRegistered={totalClaims}
        primarySources={primarySources}
        lastVerified={lastVerified}
      />
      
      {/* 2. Trust Bar */}
      <TrustBar
        chaptersPublished={chapters.length}
        claimsRegistered={totalClaims}
        primarySources={primarySources}
        lastVerified={lastVerified}
      />
      
      {/* 3. Primary Path — Start with Volume I */}
      <PrimaryPath />
      
      {/* 4. Continue Learning — after Volume I */}
      {libraries.length > 0 && <CollectionsPreview libraries={libraries} />}
      
      {/* Transition: Library → Active Research */}
      <div className="py-8 text-center" role="note">
        <p className="text-xs uppercase tracking-widest text-neutral-400">Active Research</p>
      </div>
      
      {/* 5. Knowledge Today — evidence of active maintenance */}
      <AnimatedSection as="div" delay={100}>
        <KnowledgeToday metrics={vm.knowledgeToday} />
      </AnimatedSection>
      
      {/* 6. Further Reading */}
      {vm.stories.length > 0 && (
        <AnimatedSection as="div" delay={200}>
          <LatestStories stories={vm.stories} />
        </AnimatedSection>
      )}
      
      {/* Transition: Reading → Discovery */}
      <div className="py-8 text-center bg-neutral-950" role="note">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Explore Knowledge</p>
      </div>
      
      {/* 7. Explore by Topic */}
      <AnimatedSection as="div" delay={300}>
        <TrendingTopics topics={vm.trendingTopics} />
      </AnimatedSection>
      
      {/* 8. Featured Entities */}
      <AnimatedSection as="div" delay={400}>
        <EntitySpotlight entities={vm.entitySpotlights} />
      </AnimatedSection>
      
      {/* 9. Knowledge Graph Preview */}
      <AnimatedSection as="div" delay={500}>
        <KnowledgeGraphPreview />
      </AnimatedSection>
      
      {/* 10. Platform Overview */}
      <AnimatedSection as="div" delay={600}>
        <DataDashboard data={vm.dataDashboard} />
      </AnimatedSection>
      
      {/* 11. Stay Connected */}
      <AnimatedSection as="div" delay={700}>
        <Newsletter />
      </AnimatedSection>
      
    </HomepageLayout>
  );
}
