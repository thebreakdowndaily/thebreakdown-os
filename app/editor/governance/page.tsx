import type { Metadata } from 'next';
import EosShell from '@/components/editorial/eos/EosShell';
import EosGovernanceView from '@/components/editorial/eos/EosGovernanceView';

export const metadata: Metadata = {
  title: 'Editorial Governance — EOS',
};

export default function EditorGovernancePage() {
  return (
    <EosShell
      title="Editorial Governance"
      subtitle="Newsroom policy standards derived from the Editorial Constitution v1.1 (locked) and the Product Quality Standard."
      pathname="/editor/governance"
    >
      <EosGovernanceView />
    </EosShell>
  );
}
