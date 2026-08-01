import { WCAGComplianceProfileBuilder } from '@/lib/accessibility/compliance-projection';
import AccessibilityControlPanel from '@/components/accessibility/AccessibilityControlPanel';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operational Accessibility Telemetry | The Breakdown OS',
  description: 'Internal operational dashboard for current accessibility compliance status.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessibilityPage() {
  const report = WCAGComplianceProfileBuilder.buildAuditReport();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      
      {/* Internal Telemetry Metadata JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Operational Accessibility Dashboard',
            description: 'Internal operational accessibility compliance dashboard.',
          }),
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <SpatialNarrativeBreadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Accessibility Control Panel', href: '/accessibility', current: true },
        ]} theme="dark" />

        <AccessibilityControlPanel report={report} />
      </div>
    </main>
  );
}
