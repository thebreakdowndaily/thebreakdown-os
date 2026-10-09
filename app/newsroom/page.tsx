import type { Metadata } from 'next';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { ensureNewsroomRuntime } from '@/lib/intelligence/newsroom-bootstrap';
import { newsroomDeskService } from '@/services/intelligence/newsroom/desk-service';
import { EditorialDeskWorkspace } from '@/components/newsroom/desk';

export const metadata: Metadata = {
  title: 'Newsroom Intelligence OS — Command Center & Mission Control',
  description: 'Evidence-first operational desk for breaking signals, document mutations, and verification.',
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
  const userContext = session
    ? { id: session.user.id, role: gate.role, name: session.user.name || gate.roleLabel }
    : undefined;

  // Retrieve initial server state from the authoritative desk service
  const summary = await newsroomDeskService.getDeskSummary(userContext);
  const initialItemsResponse = await newsroomDeskService.getDeskItems({}, userContext);

  return (
    <main>
      <EditorialDeskWorkspace
        initialSummary={summary}
        initialItems={initialItemsResponse.items}
        initialSections={initialItemsResponse.sections}
        initialTotal={initialItemsResponse.total}
        userRole={gate.role}
        userName={session?.user.name || gate.roleLabel}
      />
    </main>
  );
}
