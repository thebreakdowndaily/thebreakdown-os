import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EosShell from '@/components/editorial/eos/EosShell';
import EosStoryBuilderView from '@/components/editorial/eos/EosStoryBuilderView';
import { EosStageBadge, EosVerificationBadge } from '@/components/editorial/eos/EosPrimitives';
import {
  ensureEosSeed,
  getEosStory,
  getEosBlockers,
  getEosDossier,
} from '@/lib/editorial/eos/eos-store';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  return {
    title: `${story?.title ?? 'Story'} — EOS Story Builder`,
  };
}

export default async function EditorStoryPage({ params }: Props) {
  const { id } = await params;
  await ensureEosSeed();
  const story = getEosStory(id);
  if (!story) notFound();

  const blockers = getEosBlockers(story);
  const dossier = story.dossierId ? getEosDossier(story.dossierId) : undefined;

  return (
    <EosShell
      title={story.title}
      subtitle={`Story Builder packet for ${story.constituencyId} — verified research only, no AI-written copy.`}
      pathname={`/editor/stories/${id}`}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <EosStageBadge stage={story.stage} />
        <span className="text-xs text-gray-500">v{story.version}</span>
        <Link href={`/editor/fact-check/${story.id}`} className="text-xs text-amber-400 hover:text-amber-300">
          Fact-check console →
        </Link>
        <Link href={`/editor/citations/${story.id}`} className="text-xs text-amber-400 hover:text-amber-300">
          Citation bundle →
        </Link>
        {dossier ? (
          <Link href={`/editor/dossier/${dossier.id}`} className="text-xs text-amber-400 hover:text-amber-300">
            Research dossier →
          </Link>
        ) : null}
      </div>

      {blockers.length > 0 ? (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          <span className="font-bold uppercase tracking-wide text-xs">Publication blocked:</span>
          <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs">
            {blockers.map(b => <li key={b}>{b}</li>)}
          </ul>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
          Publication gate open — all claims verified or editor-approved.
        </div>
      )}

      {story.packet ? <EosStoryBuilderView packet={story.packet} /> : null}

      <section aria-label="Claim register" className="mt-8 rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">
          Claim register ({story.claims.length}) — every claim carries a verification status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950/60 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-2">Claim</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {story.claims.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 text-gray-300 max-w-md">{c.text}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{c.category}</td>
                  <td className="px-4 py-2.5"><EosVerificationBadge status={c.status} /></td>
                  <td className="px-4 py-2.5 text-xs font-mono text-gray-600">
                    {c.provenance.source} · {c.provenance.quality}
                    {c.basis ? <span className="block text-gray-600">{c.basis}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {story.corrections.length > 0 ? (
        <section aria-label="Correction history" className="mt-6 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Correction history</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            {story.corrections.map(c => (
              <li key={c.id} className="flex gap-3">
                <span className="text-amber-400 shrink-0 font-mono">v{c.version}</span>
                <div>
                  <div>{c.description}</div>
                  <div className="text-gray-600">reason: {c.reason}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </EosShell>
  );
}
