import Link from 'next/link';
import type { ResearchDossier, NewsroomStory } from '@/types/editorial-newsroom';

export interface EosDossierViewProps {
  dossier: ResearchDossier;
  story?: NewsroomStory;
  constituencyName: string;
}

export default function EosDossierView({ dossier, story, constituencyName }: EosDossierViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <section aria-label="Research questions" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Research questions</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {dossier.researchQuestions.map((q, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500 shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
          {story ? (
            <div className="mt-4 text-xs">
              <Link href={`/editor/stories/${story.id}`} className="text-amber-400 hover:text-amber-300">
                Open story builder packet →
              </Link>
            </div>
          ) : null}
        </section>

        <section aria-label="Constituency" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Dossier scope</h3>
          <div className="text-sm text-gray-300">
            <div>Constituency: <span className="text-gray-100 font-semibold">{constituencyName}</span></div>
            <div className="mt-1 text-gray-500 text-xs">Status: {dossier.status.replace('_', ' ')}</div>
            <div className="mt-1 text-gray-500 text-xs">Updated: {new Date(dossier.updatedAt).toLocaleString()}</div>
          </div>
          {story ? (
            <div className="mt-4 text-xs">
              <Link href={`/editor/fact-check/${story.id}`} className="text-amber-400 hover:text-amber-300">
                Run fact check console →
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      <section aria-label="Evidence captures" className="rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">
          Evidence captures <span className="text-gray-600 normal-case tracking-normal font-normal">({dossier.evidence.length}) — Evidence Spine: claim → evidence → source</span>
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-950/60 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2">Field</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2 hidden md:table-cell">Excerpt</th>
              <th className="px-4 py-2">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/70">
            {dossier.evidence.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 font-mono text-xs text-amber-300">{e.field}</td>
                <td className="px-4 py-2.5 text-gray-200">{e.value}</td>
                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{e.excerpt}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">
                  <span className="font-mono">{e.provenance.source}</span>
                  <span className="block">{e.provenance.authority}</span>
                </td>
              </tr>
            ))}
            {dossier.evidence.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-4 text-sm text-gray-500">No evidence captures yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section aria-label="Dossier notes" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Shared notes</h3>
        <ul className="space-y-2">
          {dossier.notes.map(n => (
            <li key={n.id} className="rounded bg-gray-950/50 border border-gray-800 p-3 text-sm text-gray-300">
              <div>{n.body}</div>
              <div className="mt-1 text-xs text-gray-500 font-mono">
                {n.authorId} · {new Date(n.createdAt).toLocaleString()}
                {n.mentions.length > 0 ? ` · mentions ${n.mentions.join(', ')}` : ''}
              </div>
            </li>
          ))}
          {dossier.notes.length === 0 ? <li className="text-sm text-gray-500">No notes yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
