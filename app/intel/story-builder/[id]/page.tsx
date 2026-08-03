import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeStoryDetail } from '@/lib/intel/story';
import { StoryDetail } from '@/components/intel/story/StoryDetail';

export const metadata: Metadata = {
  title: 'Story Draft — Intelligence Workspace',
  robots: { index: false, follow: false },
};

interface Params {
  id: string;
}

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial Workspace)
// Server-rendered story workspace. Authorization is enforced before any computation.

export default async function StoryBuilderDetailPage({ params }: { params: Promise<Params> }) {
  const gate = await guardIntelModule('story-builder');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const { id } = await params;
  const story = await computeStoryDetail(id);

  if (!story) {
    return (
      <IntelModuleGuard module="story-builder">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Story draft not found</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
            No story draft exists for constituency "{id}". It may not be in the top-priority editorial set.
          </p>
        </div>
      </IntelModuleGuard>
    );
  }

  return (
    <IntelModuleGuard module="story-builder">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <StoryDetail story={story} />
      </div>
    </IntelModuleGuard>
  );
}
