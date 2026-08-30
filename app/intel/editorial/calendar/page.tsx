import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { CalendarView } from '@/components/intel/editorial/CalendarView';

export const metadata: Metadata = {
  title: 'Editorial Calendar — Intelligence Workspace',
  robots: { index: false, follow: false },
};

export default async function EditorialCalendarPage() {
  const gate = await guardIntelModule('editorial');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  return (
    <IntelModuleGuard module="editorial">
      <CalendarView />
    </IntelModuleGuard>
  );
}
