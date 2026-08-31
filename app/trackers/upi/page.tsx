import { Metadata } from 'next';
import { upiTracker } from '@/lib/trackers/upi-tracker';
import GenericTracker from '@/components/trackers/GenericTracker';

export const metadata: Metadata = {
  title: 'UPI & Digital Payments Rails Tracker | The Breakdown',
  description:
    'Track India\'s Unified Payments Interface (UPI) — 185B+ annual volume, ₹260L Cr value, rural adoption, UPI123Pay limits, Zero MDR status, and cross-border linkages.',
  openGraph: {
    title: 'UPI & Digital Payments Rails Tracker | The Breakdown',
    description:
      'Track India\'s Unified Payments Interface (UPI) — 185B+ annual volume, ₹260L Cr value, rural adoption, UPI123Pay limits, Zero MDR status, and cross-border linkages.',
    type: 'website',
  },
};

export default function UpiTrackerPage() {
  return (
    <main className="min-h-screen bg-surface-canvas text-neutral-100 p-6 sm:p-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'Unified Payments Interface (UPI) & Digital Rails Tracker',
            description: upiTracker.description,
            dateModified: upiTracker.lastUpdated,
            publisher: { '@type': 'Organization', name: 'The Breakdown' },
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <GenericTracker tracker={upiTracker} />
      </div>
    </main>
  );
}
