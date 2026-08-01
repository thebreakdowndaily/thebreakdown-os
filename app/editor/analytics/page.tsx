import type { Metadata } from 'next';
import EosShell from '@/components/editorial/eos/EosShell';
import EosAnalyticsView from '@/components/editorial/eos/EosAnalyticsView';
import {
  ensureEosSeed,
  getEosMetrics,
  getEosStories,
} from '@/lib/editorial/eos/eos-store';

export const metadata: Metadata = {
  title: 'Editorial Analytics — EOS',
};

export default async function EditorAnalyticsPage() {
  await ensureEosSeed();
  const metrics = getEosMetrics();
  const stories = getEosStories();

  return (
    <EosShell
      title="Editorial Analytics"
      subtitle="Workflow metrics: research time, verification rate, turnaround, evidence density, source diversity, corrections. No journalist ranking."
      pathname="/editor/analytics"
    >
      <EosAnalyticsView metrics={metrics} stories={stories} />
    </EosShell>
  );
}
