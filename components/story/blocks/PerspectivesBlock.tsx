import type { PerspectivesData } from './types';

export default function PerspectivesBlock({ headline, perspectives, note }: PerspectivesData) {
  return (
    <section id="perspectives" aria-label="Perspectives" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-6">{headline}</h2>
      <div className="space-y-6">
        {perspectives.map((p, i) => (
          <div key={i} className="flex gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-1 bg-[#D4A843] rounded-full opacity-60" aria-hidden="true" />
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-semibold text-[#F5F5F5]">{p.label}</span>
                <span className="text-xs text-[#A1A1AA]">— {p.source}</span>
              </div>
              <blockquote className="text-[#A1A1AA] leading-relaxed italic">
                &ldquo;{p.quote}&rdquo;
              </blockquote>
              <span className="inline-block mt-2 text-xs font-semibold uppercase tracking-wider text-[#D4A843] bg-[#D4A843]/10 px-2 py-1 rounded">
                {p.stance}
              </span>
            </div>
          </div>
        ))}
      </div>
      {note && (
        <p className="mt-6 text-xs text-[#737373] border-t border-[#2A2A2A] pt-4">{note}</p>
      )}
    </section>
  );
}