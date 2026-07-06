import type { KeyNumbersData } from './types';

export default function KeyNumbersBlock({ items }: KeyNumbersData) {
  if (items.length === 0) return null;

  return (
    <section id="key-numbers" aria-label="Key numbers" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Key Numbers</h2>
      <div
        className="grid gap-4 sm:gap-6"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)` }}
      >
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-5 sm:p-6 flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#D4A843] tabular-nums leading-none">{item.value}</span>
            <span className="text-sm text-[#A1A1AA] mt-3">{item.label}</span>
            {item.source && (
              <span className="text-[10px] text-[#A1A1AA]/40 mt-2">{item.source}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
