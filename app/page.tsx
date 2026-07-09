import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import HomepageLayout from '@/layouts/HomepageLayout';
import Hero from '@/components/home/hero/Hero';
import { FeaturedStories } from '@/components/home/featured';
import { TheFixSection } from '@/components/home/fix';
import { TopicExplorer } from '@/components/home/topics';
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

export default function HomePage() {
  const services = bootstrapServices();
  const vm = buildHomepage(services);

  return (
    <HomepageLayout seo={vm.seo}>
      {vm.topStory && <Hero story={vm.topStory} />}
      <AnimatedSection as="div"><FeaturedStories stories={vm.stories} /></AnimatedSection>
      <AnimatedSection as="div" delay={100}><TheFixSection fixes={vm.fixes} /></AnimatedSection>
      <AnimatedSection as="div" delay={200}><TopicExplorer topics={vm.topics} /></AnimatedSection>
    </HomepageLayout>
  );
}
