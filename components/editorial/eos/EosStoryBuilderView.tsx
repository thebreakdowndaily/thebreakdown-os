import type { StoryPacket } from '@/types/editorial-newsroom';

export interface EosStoryBuilderViewProps {
  packet: StoryPacket;
}

export default function EosStoryBuilderView({ packet }: EosStoryBuilderViewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/25 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
        <div className="text-[11px] uppercase tracking-widest text-amber-400/80 font-bold mb-1">Story packet — draft headline</div>
        <h3 className="text-2xl font-bold text-gray-100 leading-snug">{packet.headline}</h3>
        <p className="mt-2 text-sm text-gray-400 max-w-3xl">{packet.dek}</p>
        <p className="mt-3 text-xs text-gray-500">
          Assembled deterministically from the frozen UP403 dataset. No AI-generated copy. Every fact below carries
          field-level provenance.
        </p>
      </div>

      <section aria-label="Key facts" className="rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">Key facts ({packet.facts.length})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
          {packet.facts.map(f => (
            <div key={f.id} className="rounded border border-gray-800 bg-gray-950/50 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{f.label}</div>
              <div className="text-sm text-gray-200 mt-0.5">{f.value}</div>
              <div className="mt-1 text-[10px] font-mono text-gray-600">
                {f.canonicalField} · {f.provenance.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Draft sections" className="space-y-4">
        {packet.sections.map(s => (
          <div key={s.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
            <h4 className="text-sm font-bold text-gray-100">{s.heading}</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-400">
              {s.content.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500/60 shrink-0">–</span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-2 text-[10px] font-mono text-gray-600">fields: {s.canonicalFields.join(', ')}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
