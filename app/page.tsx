/**
 * The Breakdown — RC-1 Editorial Homepage
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * RC-1: Replaces the 4-scene cinematic TheBeginning experience
 *       with a direct editorial homepage.
 *
 * North Star: A first-time visitor understands The Breakdown
 *             and clicks into a chapter within 10 seconds.
 *
 * TheBeginning is preserved at components/narrative/TheBeginning.tsx
 * and can be restored by swapping the import below.
 */

import type { Metadata } from 'next';
import HomepageLayout from '@/components/home/HomepageLayout';

export const metadata: Metadata = {
  title: 'The Breakdown — Evidence-First Explainers on India',
  description:
    'Deep, evidence-first explainers on Indian history, policy, and foreign relations. Every claim is sourced. Every source is linked. No takes — just understanding.',
  keywords:
    'India, knowledge, evidence, history, policy, research, primary sources, verification, non-alignment, partition, constitution',
  openGraph: {
    title: 'The Breakdown — Evidence-First Explainers on India',
    description: 'Deep, evidence-first explainers on Indian history, policy, and foreign relations.',
    url: 'https://thebreakdown.in',
    siteName: 'The Breakdown',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'The Breakdown — Evidence-first explainers on India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Breakdown — Evidence-First Explainers on India',
    description: 'Deep, evidence-first explainers on Indian history, policy, and foreign relations.',
    images: ['/images/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://thebreakdown.in',
  },
};

export const revalidate = 60;

export default function HomePage() {
  return <HomepageLayout />;
}
