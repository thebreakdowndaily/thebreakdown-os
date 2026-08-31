import { Metadata } from 'next';
import { pmfbyTracker } from '@/lib/trackers/pmfby-tracker';
import GenericTracker from '@/components/trackers/GenericTracker';

export const metadata: Metadata = {
  title: 'PM Fasal Bima Yojana (PMFBY) Tracker | The Breakdown',
  description:
    'Track India\'s crop insurance scheme — ₹31,450 Cr gross premiums, 4.1 Cr farmers, claim settlement delays, 12% penal interest rules, and YES-TECH satellite yield assessment across 22 States.',
  openGraph: {
    title: 'PM Fasal Bima Yojana (PMFBY) Tracker | The Breakdown',
    description:
      'Track India\'s crop insurance scheme — ₹31,450 Cr gross premiums, 4.1 Cr farmers, claim settlement delays, 12% penal interest rules, and YES-TECH satellite yield assessment across 22 States.',
    type: 'website',
  },
};

export default function PmfbyTrackerPage() {
  return (
    <main className="min-h-screen bg-surface-canvas text-neutral-100 p-6 sm:p-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) & Agri-Risk Tracker',
            description: pmfbyTracker.description,
            dateModified: pmfbyTracker.lastUpdated,
            publisher: { '@type': 'Organization', name: 'The Breakdown' },
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <GenericTracker tracker={pmfbyTracker} />
      </div>
    </main>
  );
}
