import type { Metadata } from 'next';
import { Suspense } from 'react';
import Up403SearchPanel from '@/components/up403/SearchPanel';

const SITE_URL = 'https://thebreakdown.in';

export const metadata: Metadata = {
  title: 'Universal Search — UP403 Constituency Intelligence',
  description: 'Search the full 403-constituency dataset by constituency, district, MLA, MP or party.',
  alternates: { canonical: `${SITE_URL}/up403/search` },
  openGraph: {
    title: 'Universal Search — UP403 Constituency Intelligence',
    description: 'Search the full 403-constituency dataset by constituency, district, MLA, MP or party.',
    type: 'website',
    url: `${SITE_URL}/up403/search`,
    siteName: 'The Breakdown — UP403 Constituency Intelligence',
  },
  twitter: { card: 'summary_large_image', title: 'Universal Search — UP403 Constituency Intelligence', description: 'Search the full 403-constituency dataset by constituency, district, MLA, MP or party.' },
};

export default function Up403SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-[#A1A1AA]">Loading search…</div>}>
      <Up403SearchPanel />
    </Suspense>
  );
}
