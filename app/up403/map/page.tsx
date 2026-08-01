import type { Metadata } from 'next';
import { Suspense } from 'react';
import Up403Map from '@/components/up403/map';

const SITE_URL = 'https://thebreakdown.in';

export const metadata: Metadata = {
  title: 'Interactive Map — UP403 Constituency Intelligence',
  description: 'Explore all 403 Uttar Pradesh assembly constituencies on a schematic map — filter by region, party, political DNA and competitiveness. Every seat links to an evidence-traced profile.',
  alternates: { canonical: `${SITE_URL}/up403/map` },
  openGraph: {
    title: 'Interactive Map — UP403 Constituency Intelligence',
    description: 'Explore all 403 Uttar Pradesh assembly constituencies — filter by region, party, DNA and competitiveness.',
    type: 'website',
    url: `${SITE_URL}/up403/map`,
    siteName: 'The Breakdown — UP403 Constituency Intelligence',
  },
  twitter: { card: 'summary_large_image', title: 'Interactive Map — UP403 Constituency Intelligence', description: 'Explore all 403 UP assembly constituencies — filter by region, party, DNA and competitiveness.' },
};

export default function Up403MapPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-[#F5F5F5]">Constituency map</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#A1A1AA]">
          All 403 assembly constituencies of Uttar Pradesh, colour-coded by party, political DNA or competitiveness. Select a tile to open its profile.
        </p>
      </header>
      <Suspense fallback={<div className="py-20 text-center text-sm text-[#A1A1AA]">Loading constituencies…</div>}>
        <Up403Map />
      </Suspense>
    </div>
  );
}
