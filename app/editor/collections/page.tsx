import type { Metadata } from 'next';
import EosShell from '@/components/editorial/eos/EosShell';
import EosCollectionsView from '@/components/editorial/eos/EosCollectionsView';
import {
  ensureEosSeed,
  getEosCollections,
} from '@/lib/editorial/eos/eos-store';

export const metadata: Metadata = {
  title: 'Editorial Collections — EOS',
};

export default async function EditorCollectionsPage() {
  await ensureEosSeed();
  const collections = getEosCollections();

  return (
    <EosShell
      title="Editorial Collections"
      subtitle="Dynamic rule-based collections over the canonical dataset — the query is the collection, fully reproducible."
      pathname="/editor/collections"
    >
      <EosCollectionsView collections={collections} />
    </EosShell>
  );
}
