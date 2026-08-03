import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeStoryOverview } from '@/lib/intel/story';
import { StoryDashboard } from '@/components/intel/story/StoryDashboard';
import { StoryList } from '@/components/intel/story/StoryList';

export const metadata: Metadata = {
  title: 'Story Builder — Intelligence Workspace',
  robots: { index: false, follow: false },
};

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Server-rendered workspace. Authorization is enforced before any computation via
// guardIntelModule('story-builder'); the client guard is a secondary rendering layer only.

export default async function StoryBuilderPage() {
  const gate = await guardIntelModule('story-builder');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeStoryOverview();

  return (
    <IntelModuleGuard module="story-builder">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-amber-500)', fontWeight: 600 }}>
            Story Builder · Editorial Production System
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            Story Builder
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)', maxWidth: 640, lineHeight: 1.6 }}>
            Transforms verified intelligence into editorial plans: briefs, structured story outlines, impact estimates, and a
            publication package. The Story Builder plans work and owns workflow metadata — every claim, fact, and source traces
            to a certified engine output. Dataset {overview.dataSource} · research cutoff {overview.researchCutoff}.
          </p>
        </div>

        <StoryDashboard overview={overview} />

        <section aria-labelledby="drafts-title" style={{ marginBottom: 'var(--spacing-8)' }}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <h2 id="drafts-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Story drafts</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Top Investigation Priority seats. Open a draft to plan its structure, advance its editorial status, and export its publication package.
            </p>
          </div>
          <StoryList stories={overview.stories} />
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
