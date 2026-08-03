import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeVerificationOverview } from '@/lib/intel/verification';
import { VerificationDashboard } from '@/components/intel/verification/VerificationDashboard';
import { CaseList } from '@/components/intel/verification/CaseList';

export const metadata: Metadata = {
  title: 'Verification Workspace — Intelligence Workspace',
  robots: { index: false, follow: false },
};

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Server-rendered workspace. Authorization is enforced before any computation via
// guardIntelModule('verification'); the client guard is a secondary rendering layer only.

export default async function VerificationPage() {
  const gate = await guardIntelModule('verification');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeVerificationOverview();

  return (
    <IntelModuleGuard module="verification">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-amber-500)', fontWeight: 600 }}>
            Verification Operating System
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            Verification Workspace
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)', maxWidth: 640, lineHeight: 1.6 }}>
            Verification cases aggregate the certified engines into a workflow: claim register, conflict detector, evidence review,
            field verification, and editorial readiness. Cases own workflow and audit metadata only — every claim and conflict
            traces to an engine output. Dataset {overview.dataSource} · research cutoff {overview.researchCutoff}.
          </p>
        </div>

        <VerificationDashboard overview={overview} />

        <section aria-labelledby="cases-title" style={{ marginBottom: 'var(--spacing-8)' }}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <h2 id="cases-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Verification cases</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Top Investigation Priority seats. Open a case to review its claim register, conflicts, and field plan, and to advance its workflow status.
            </p>
          </div>
          <CaseList cases={overview.cases} />
        </section>

        <details>
          <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            Limitations
          </summary>
          <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {overview.limitations.map((l) => <li key={l} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{l}</li>)}
          </ul>
        </details>
      </div>
    </IntelModuleGuard>
  );
}
