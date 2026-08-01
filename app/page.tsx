/**
 * The Breakdown — "The Beginning" (Narrative Experience Homepage)
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 | docs/philosophy/narrative-operating-system.md
 *
 * "The purpose of The Breakdown is not to maximise attention;
 *  it is to maximise understanding."
 *
 * Phase N-1: 4-scene cinematic narrative trailer replacing the article-grid homepage.
 * Architecture: Server-first. HomepageViewModel untouched.
 */

import type { Metadata } from 'next';
import TheBeginning from '@/components/narrative/TheBeginning';

export const metadata: Metadata = {
  title: 'The Breakdown — Evidence-First Explainers on India',
  description:
    'Deep, evidence-first explainers on Indian history, policy, and foreign relations. Every claim is sourced. Every source is linked. No takes — just understanding.',
  keywords:
    'India, knowledge, evidence, history, policy, research, primary sources, verification, non-alignment, partition, constitution, narrative intelligence',
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
  return <TheBeginning />;
}
