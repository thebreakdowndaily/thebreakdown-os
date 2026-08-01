import type { Metadata } from 'next';
import EosShell from '@/components/editorial/eos/EosShell';
import EosAssignmentBoard from '@/components/editorial/eos/EosAssignmentBoard';
import {
  ensureEosSeed,
  getEosAssignments,
} from '@/lib/editorial/eos/eos-store';

export const metadata: Metadata = {
  title: 'Assignment Board — EOS',
};

export default async function EditorAssignmentsPage() {
  await ensureEosSeed();
  const assignments = getEosAssignments();

  return (
    <EosShell
      title="Assignment Board"
      subtitle="Assigned → Research → Writing → Fact Check → Editorial Review → Scheduled → Published. Assignments re-derive from story state, so the board can never drift from the workflow."
      pathname="/editor/assignments"
    >
      <EosAssignmentBoard assignments={assignments} />
    </EosShell>
  );
}
