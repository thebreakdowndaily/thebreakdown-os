import type { EditorialCollection } from '@/types/editorial-newsroom';

export default function EosCollectionsView({ collections }: { collections: EditorialCollection[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 max-w-3xl">
        Collections are <span className="text-gray-200 font-semibold">dynamic, rule-based projections</span> over the
        canonical dataset — the query is the collection, so counts always match the frozen data. No hand-picking.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {collections.map(c => (
          <section key={c.id} id={c.id} aria-label={c.name} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-100">{c.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{c.description}</p>
              </div>
              <span className="shrink-0 text-xl font-bold text-amber-400 font-mono">{c.constituencyIds.length}</span>
            </div>
            <div className="mt-3 rounded bg-gray-950/60 border border-gray-800 px-3 py-2 font-mono text-[11px] text-gray-400">
              {c.rule}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-gray-600">signal · {c.signal}</div>
            <div className="mt-2 text-[10px] font-mono text-gray-600 truncate">
              {c.constituencyIds.slice(0, 6).join(', ')}
              {c.constituencyIds.length > 6 ? ` … +${String(c.constituencyIds.length - 6)}` : ''}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
