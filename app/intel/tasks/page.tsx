import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { ModulePlaceholder } from '@/components/intel/ModulePlaceholder';

export default async function TasksPage() {
  const gate = await guardIntelModule('tasks');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  return (
    <IntelModuleGuard module="tasks">
      <ModulePlaceholder module="tasks" />
    </IntelModuleGuard>
  );
}
