import type { Metadata } from 'next';
import EosShell from '@/components/editorial/eos/EosShell';
import EosDashboardView from '@/components/editorial/eos/EosDashboardView';
import {
  ensureEosSeed,
  getEosStories,
  getEosAssignments,
  getEosCollections,
  getEosOpportunities,
  getEosActivities,
  getEosMetrics,
  getEosGovernanceGap,
} from '@/lib/editorial/eos/eos-store';

export const metadata: Metadata = {
  title: 'Editorial Operating System — The Breakdown Intelligence Platform',
  description:
    'The EOS newsroom: story discovery, research dossiers, fact-check console, assignment board, collections, publishing integration, and editorial governance.',
};

export default async function EditorDashboardPage() {
  await ensureEosSeed();
  const metrics = getEosMetrics();
  const stories = getEosStories();
  const assignments = getEosAssignments();
  const collections = getEosCollections();
  const opportunities = getEosOpportunities();
  const activities = getEosActivities();
  const governanceGap = getEosGovernanceGap();

  return (
    <EosShell
      title="Editorial Dashboard"
      subtitle="The EOS command surface: pipeline health, active assignments, story opportunities from deterministic discovery, and recent newsroom activity."
      pathname="/editor"
    >
      <EosDashboardView
        metrics={metrics}
        stories={stories}
        assignments={assignments}
        collections={collections}
        opportunities={opportunities}
        activities={activities}
        governanceGap={governanceGap}
      />
    </EosShell>
  );
}
