import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EosShell from '@/components/editorial/eos/EosShell';
import EosFactCheckConsole from '@/components/editorial/eos/EosFactCheckConsole';
import {
  ensureEosSeed,
  getEosStory,
  getEosRecord,
  getEosBlockers,
} from '@/lib/editorial/eos/eos-store';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  return {
    title: `Fact Check — ${story?.title ?? 'Story'} — EOS`,
  };
}

export default async function EditorFactCheckPage({ params }: Props) {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  if (!story) notFound();
  const record = getEosRecord(story.constituencyId);
  if (!record) notFound();

  return (
    <EosShell
      title={`Fact Check Console — ${story.title}`}
      subtitle="Deterministic verification of every claim against the canonical UP403 record. Failed verifications become blocking issues."
      pathname={`/editor/fact-check/${id}`}
    >
      <EosFactCheckConsole
        storyId={story.id}
        initialClaims={story.claims}
        record={record}
        initialBlockers={getEosBlockers(story)}
      />
    </EosShell>
  );
}
