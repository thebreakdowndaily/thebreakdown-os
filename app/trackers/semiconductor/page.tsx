import { Metadata } from 'next';
import { getSemiconductorTracker } from '@/lib/trackers/semiconductor-tracker';
import GenericTracker from '@/components/trackers/GenericTracker';

export const metadata: Metadata = {
  title: 'Semiconductor PLI & ISM Tracker | The Breakdown',
  description:
    "Track India's semiconductor manufacturing push — ₹76,000 Cr outlays, ₹1.26 lakh Cr private commitments, and OSAT/Fab construction in Sanand, Dholera, and Morigaon.",
  openGraph: {
    title: 'Semiconductor PLI & ISM Tracker | The Breakdown',
    description:
      "Track India's semiconductor manufacturing push — ₹76,000 Cr outlays, ₹1.26 lakh Cr private commitments, and OSAT/Fab construction in Sanand, Dholera, and Morigaon.",
    type: 'website',
  },
};

export default function SemiconductorTrackerPage() {
  const tracker = getSemiconductorTracker();

  return (
    <main className="min-h-screen bg-surface-canvas text-neutral-100 p-6 sm:p-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'India Semiconductor Mission (ISM) & PLI Tracker',
            description: tracker.description,
            dateModified: tracker.lastUpdated,
            publisher: { '@type': 'Organization', name: 'The Breakdown' },
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <GenericTracker tracker={tracker} />
      </div>
    </main>
  );
}
