import type { Metadata } from 'next';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { ensureNewsroomRuntime } from '@/lib/intelligence/newsroom-bootstrap';
import { NewsroomDashboardClient } from '@/components/newsroom/NewsroomDashboardClient';

export const metadata: Metadata = {
  title: 'Newsroom Intelligence OS — Command Center',
  robots: { index: false, follow: false },
};

export default async function NewsroomPage() {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;
  }

  // Idempotent runtime provisioning (16-beat taxonomy + recipient registry +
  // persisted-state restore + dev-only demo baseline) before any queue render.
  await ensureNewsroomRuntime();

  const session = await getSession();
  const userContext = session ? { id: session.user.id, role: gate.role } : undefined;

  const queue = newsroomIntelligenceCore.getQueue(userContext);
  const metrics = newsroomIntelligenceCore.getMetrics();

  return (
    <main>
      <NewsroomDashboardClient initialQueue={queue} initialMetrics={metrics} />
    </main>
  );
}
