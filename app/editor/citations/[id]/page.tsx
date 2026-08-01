import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EosShell from '@/components/editorial/eos/EosShell';
import EosCitationView from '@/components/editorial/eos/EosCitationView';
import {
  ensureEosSeed,
  getEosStory,
  getEosDossiers,
} from '@/lib/editorial/eos/eos-store';
import { buildCitationBundle } from '@/lib/editorial/eos/eos-publishing';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  return {
    title: `Citations — ${story?.title ?? 'Story'} — EOS`,
  };
}

export default async function EditorCitationsPage({ params }: Props) {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  if (!story) notFound();

  const bundle = buildCitationBundle(story, getEosDossiers());

  return (
    <EosShell
      title={`Citation Generator — ${story.title}`}
      subtitle="Inline citations, evidence appendix, source list, and dossier citations — all anchored to the Evidence Spine."
      pathname={`/editor/citations/${id}`}
    >
      <EosCitationView bundle={bundle} />
    </EosShell>
  );
}
