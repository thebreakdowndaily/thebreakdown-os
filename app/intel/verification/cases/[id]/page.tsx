import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeVerificationCaseDetail } from '@/lib/intel/verification';
import { CaseDetail } from '@/components/intel/verification/CaseDetail';

export const metadata: Metadata = {
  title: 'Verification Case — Intelligence Workspace',
  robots: { index: false, follow: false },
};

interface Params {
  id: string;
}

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Case Detail)
// Server-rendered case workspace. Authorization is enforced before any computation.

export default async function VerificationCasePage({ params }: { params: Promise<Params> }) {
  const gate = await guardIntelModule('verification');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const { id } = await params;
  const verificationCase = await computeVerificationCaseDetail(id);

  if (!verificationCase) {
    return (
      <IntelModuleGuard module="verification">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Verification case not found</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
            No verification case exists for constituency "{id}". It may not be in the top-priority case set.
          </p>
        </div>
      </IntelModuleGuard>
    );
  }

  return (
    <IntelModuleGuard module="verification">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <CaseDetail verificationCase={verificationCase} />
      </div>
    </IntelModuleGuard>
  );
}
