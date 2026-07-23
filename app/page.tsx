/**
 * The Breakdown — Evidence-Driven Homepage (Release 1)
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Primary public homepage projection of The Breakdown Knowledge Platform.
 * Prioritizes editorial importance, explanatory depth, evidence, and clear navigation.
 */

import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import HomepageLayout from '@/layouts/HomepageLayout';

import LeadStoryHero from '@/components/home/LeadStoryHero';
import ShortVersionGrid from '@/components/home/ShortVersionGrid';
import DeepDivesGrid from '@/components/home/DeepDivesGrid';
import FollowTheMoneyModule from '@/components/home/FollowTheMoneyModule';
import ExploreSearchSection from '@/components/home/ExploreSearchSection';
import TopicTaxonomySection from '@/components/home/TopicTaxonomySection';
import RecentlyUpdatedStream from '@/components/home/RecentlyUpdatedStream';
import Newsletter from '@/components/home/newsletter/Newsletter';
import AnimatedSection from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'The Breakdown Knowledge Platform — Evidence Before Conclusions',
  description: 'An evidence-driven explanatory journalism and public-knowledge platform. Every claim verified. Every source cited. Every interpretation transparent.',
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

  return (
    <HomepageLayout seo={vm.seo}>
      {/* 01 — Lead Story */}
      <LeadStoryHero story={vm.leadStory} />

      {/* 02 — The Short Version */}
      <AnimatedSection as="div" delay={100}>
        <ShortVersionGrid briefings={vm.briefings} />
      </AnimatedSection>

      {/* 03 — Deep Dives */}
      <AnimatedSection as="div" delay={200}>
        <DeepDivesGrid deepDives={vm.deepDives} />
      </AnimatedSection>

      {/* 04 — Follow the Money / Data */}
      {vm.financialFeature && (
        <AnimatedSection as="div" delay={300}>
          <FollowTheMoneyModule financialData={vm.financialFeature} />
        </AnimatedSection>
      )}

      {/* 05 — Explore Knowledge & Search */}
      <AnimatedSection as="div" delay={400}>
        <ExploreSearchSection />
      </AnimatedSection>

      {/* 06 — Explore by Topic */}
      <AnimatedSection as="div" delay={500}>
        <TopicTaxonomySection topics={vm.topics} />
      </AnimatedSection>

      {/* 07 — Recently Updated Stories */}
      <AnimatedSection as="div" delay={600}>
        <RecentlyUpdatedStream updates={vm.recentlyUpdated} />
      </AnimatedSection>

      {/* 08 — Newsletter / Stay Connected */}
      <AnimatedSection as="div" delay={700}>
        <Newsletter />
      </AnimatedSection>
    </HomepageLayout>
  );
}
