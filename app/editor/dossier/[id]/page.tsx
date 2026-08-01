import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EosShell from '@/components/editorial/eos/EosShell';
import EosDossierView from '@/components/editorial/eos/EosDossierView';
import EosCollaborationPanel from '@/components/editorial/eos/EosCollaborationPanel';
import {
  ensureEosSeed,
  getEosDossier,
  getEosRecord,
  getEosStories,
} from '@/lib/editorial/eos/eos-store';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await ensureEosSeed();
  const dossier = getEosDossier(id);
  return {
    title: `${dossier?.title ?? 'Research Dossier'} — EOS`,
  };
}

export default async function EditorDossierPage({ params }: Props) {
  const { id } = await params;
  await ensureEosSeed();
  const dossier = getEosDossier(id);
  if (!dossier) notFound();

  const story = getEosStories().find(s => s.dossierId === id);
  const record = dossier.constituencyIds[0]
    ? getEosRecord(dossier.constituencyIds[0])
    : undefined;

  return (
    <EosShell
      title={dossier.title}
      subtitle="Research workspace: questions, evidence captures with provenance, and shared notes feeding the story builder."
      pathname={`/editor/dossier/${id}`}
    >
      <EosDossierView
        dossier={dossier}
        story={story}
        constituencyName={record?.constituency_name ?? dossier.constituencyIds[0]}
      />
      <div className="mt-6">
        <EosCollaborationPanel dossier={dossier} storyId={story?.id ?? id} currentUser="reporter-priya" />
      </div>
    </EosShell>
  );
}
