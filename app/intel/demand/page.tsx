import type { Metadata } from 'next';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { DEMAND_OPPORTUNITIES, computeDemandMetrics } from '@/fixtures/demand-fixture';
import { DemandDashboardClient } from '@/components/intel/demand/DemandDashboardClient';

// Governing document: docs/editorial/story-selection-framework.md

export const metadata: Metadata = {
  title: 'Public Demand & Search Intelligence — Intelligence Workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DemandIntelligencePage() {
  const gate = await guardIntelModule('demand');
  if (!gate.authorized) {
    return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;
  }

  const opportunities = DEMAND_OPPORTUNITIES;
  const metrics = computeDemandMetrics(opportunities);

  return (
    <main>
      <DemandDashboardClient
        opportunities={opportunities}
        metrics={metrics}
      />
    </main>
  );
}
