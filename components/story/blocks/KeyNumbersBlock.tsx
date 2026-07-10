import type { KeyNumbersData } from './types';

export default function KeyNumbersBlock({ items }: KeyNumbersData) {
  if (items.length === 0) return null;

  return (
    <section id="key-numbers" aria-label="Key numbers" className="py-8 sm:py-10">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-6">Key Numbers</h2>
      <div
        className="grid gap-4 sm:gap-6"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}
      >
        {items.map((item, i) => (
          <div key={i} className="rounded-lg bg-surface-secondary border border-border p-5 sm:p-6 flex flex-col items-start text-left hover:border-brand-400/50 transition-colors">
            <span className="text-4xl sm:text-5xl font-bold text-brand-400 tabular-nums leading-none tracking-tighter">{item.value}</span>
            <span className="text-sm font-semibold text-text-primary mt-3 uppercase tracking-wider">{item.label}</span>
            {item.source && (
              <span className="text-xs text-text-muted mt-2 font-mono uppercase tracking-widest">{item.source}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
