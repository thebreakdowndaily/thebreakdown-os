import type { CitationBundle } from '@/types/editorial-newsroom';

export default function EosCitationView({ bundle }: { bundle: CitationBundle }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400 max-w-3xl">
        Citations anchor every claim to the Evidence Spine — claim → evidence → source → verification → publication.
        The generated bundle is ready for export into the story before publishing.
      </p>

      <section aria-label="Inline citations" className="rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">
          Inline citations ({bundle.inlineCitations.length})
        </h3>
        <ul className="divide-y divide-gray-800/70 text-sm">
          {bundle.inlineCitations.map(c => (
            <li key={c.id} className="px-4 py-3">
              <div className="text-gray-300">{c.text}</div>
              <div className="mt-1 text-xs text-gray-500">{c.citation}</div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Evidence appendix" className="rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">
          Evidence appendix ({bundle.evidenceAppendix.length})
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-950/60 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2">Claim</th>
              <th className="px-4 py-2">Verification</th>
              <th className="px-4 py-2">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/70">
            {bundle.evidenceAppendix.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 text-gray-300">{e.claim}</td>
                <td className="px-4 py-2.5 text-xs text-gray-400">{e.evidence}</td>
                <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{e.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section aria-label="Source list" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Source list ({bundle.sourceList.length})</h3>
          <ul className="space-y-1.5 text-xs text-gray-400">
            {bundle.sourceList.map(s => (
              <li key={s.id} className="flex justify-between gap-2">
                <span className="font-mono">{s.source}</span>
                <span className="text-gray-500 text-right">{s.authority}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Dossier citations" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Dossier citations ({bundle.dossierCitations.length})</h3>
          <ul className="space-y-1.5 text-xs text-gray-400">
            {bundle.dossierCitations.map(d => (
              <li key={d.dossierId}>
                <span className="text-gray-200 font-semibold">{d.title}</span>
                <span className="block text-gray-500">{d.citation}</span>
              </li>
            ))}
            {bundle.dossierCitations.length === 0 ? <li className="text-gray-500">No linked dossier.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
