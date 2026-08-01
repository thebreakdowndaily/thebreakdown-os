import type { Metadata } from 'next';
import { Suspense } from 'react';
import Up403ComparePanel from '@/components/up403/ComparePanel';

const SITE_URL = 'https://thebreakdown.in';

export const metadata: Metadata = {
  title: 'Compare Constituencies — UP403 Constituency Intelligence',
  description: 'Side-by-side analysis of 2–5 Uttar Pradesh assembly constituencies across elections, margins, DNA and representation.',
  alternates: { canonical: `${SITE_URL}/up403/compare` },
  openGraph: {
    title: 'Compare Constituencies — UP403 Constituency Intelligence',
    description: 'Side-by-side analysis of 2–5 UP assembly constituencies across elections, margins, DNA and representation.',
    type: 'website',
    url: `${SITE_URL}/up403/compare`,
    siteName: 'The Breakdown — UP403 Constituency Intelligence',
  },
  twitter: { card: 'summary_large_image', title: 'Compare Constituencies — UP403 Constituency Intelligence', description: 'Side-by-side analysis of 2–5 UP assembly constituencies.' },
};

export default function Up403ComparePage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-[#A1A1AA]">Loading compare workspace…</div>}>
      <Up403ComparePanel />
    </Suspense>
  );
}
