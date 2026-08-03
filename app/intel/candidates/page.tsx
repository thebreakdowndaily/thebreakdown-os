import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { ModulePlaceholder } from '@/components/intel/ModulePlaceholder';

export default async function CandidatesPage() {
  const gate = await guardIntelModule('candidates');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  return (
    <IntelModuleGuard module="candidates">
      <ModulePlaceholder module="candidates" />
    </IntelModuleGuard>
  );
}
