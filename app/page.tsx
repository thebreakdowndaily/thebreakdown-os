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
  title: 'The Breakdown — The World\'s First Narrative Intelligence Platform',
  description:
    'We do not publish articles. We build structured journeys through evidence — so you leave knowing something real. Evidence before conclusions. Uncertainty always visible. Reasoning always shown.',
  keywords:
    'India, knowledge, evidence, history, policy, research, primary sources, verification, non-alignment, partition, constitution, narrative intelligence',
  openGraph: {
    title: 'The Breakdown — Narrative Intelligence Platform',
    description: 'Not to maximise attention. To maximise understanding.',
    url: 'https://thebreakdown.in',
    siteName: 'The Breakdown Knowledge Platform',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'The Breakdown — Narrative Intelligence Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Breakdown — Narrative Intelligence Platform',
    description: 'Not to maximise attention. To maximise understanding.',
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
