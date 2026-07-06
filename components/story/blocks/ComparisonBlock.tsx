import type { ComparisonData } from './types';

export default function ComparisonBlock({ metric, before, after, description }: ComparisonData) {
  return (
    <section id="comparison" aria-label="Comparison" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">{metric}</h2>
      <div className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-center">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#EF4444] mb-2">Before</div>
            <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tabular-nums">{before.value}</div>
            <div className="text-sm text-[#A1A1AA] mt-1">{before.label}</div>
          </div>
          <div className="relative text-center">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden sm:flex items-center justify-center" aria-hidden="true">
              <svg className="w-8 h-8 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="sm:hidden flex justify-center mb-3" aria-hidden="true">
              <svg className="w-6 h-6 text-[#D4A843] rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#22C55E] mb-2">After</div>
            <div className="text-3xl sm:text-4xl font-bold text-[#22C55E] tabular-nums">{after.value}</div>
            <div className="text-sm text-[#A1A1AA] mt-1">{after.label}</div>
          </div>
        </div>
        {description && (
          <p className="text-sm text-[#A1A1AA] text-center mt-6 pt-6 border-t border-[#2A2A2A]">{description}</p>
        )}
      </div>
    </section>
  );
}
