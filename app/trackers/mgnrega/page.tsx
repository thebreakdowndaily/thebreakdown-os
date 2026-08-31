import { Metadata } from 'next';
import { getMgnregaTracker } from '@/lib/trackers/mgnrega-tracker';
import MgnregaTrackerComponent from '@/components/trackers/MgnregaTracker';

export const metadata: Metadata = {
  title: 'MGNREGA Tracker | The Breakdown',
  description: 'Track India\'s rural employment guarantee — from MGNREGA 2005 (100 days) to the VB-G RAM G Act 2025 (125 days). Key data, timeline, evidence chain, and what changed.',
  openGraph: {
    title: 'MGNREGA Tracker | The Breakdown',
    description: 'Track India\'s rural employment guarantee — from MGNREGA 2005 (100 days) to the VB-G RAM G Act 2025 (125 days).',
    type: 'website',
  },
};

export default function MgnregaTrackerPage() {
  const tracker = getMgnregaTracker();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'MGNREGA → VB-G RAM G Act 2025 Tracker',
            description: tracker.description,
            dateModified: tracker.lastUpdated,
            publisher: { '@type': 'Organization', name: 'The Breakdown' },
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <MgnregaTrackerComponent tracker={tracker} />
      </div>
    </main>
  );
}
