import type { SystemExplanationData } from './types';
import Image from 'next/image';

export default function SystemExplanationBlock({ headline, summary, steps, diagram, diagramAlt }: SystemExplanationData) {
  return (
    <section id="system" aria-label="System Explanation" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">{headline}</h2>
      <p className="text-sm text-[#A1A1AA] mb-8 leading-relaxed">{summary}</p>
      {diagram && (
        <div className="mb-8 rounded-xl bg-[#151515] border border-[#2A2A2A] p-6 flex items-center justify-center min-h-[200px] relative">
          <Image
            src={diagram}
            alt={diagramAlt || headline}
            fill
            className="max-w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
      )}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-xs font-bold text-[#D4A843]">
              {i + 1}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-semibold text-[#F5F5F5] mb-1">{step.label}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{step.description}</p>
              {(step.actor || step.input || step.output) && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {step.actor && <span className="bg-[#2A2A2A] text-[#D4A843] px-2 py-1 rounded">Actor: {step.actor}</span>}
                  {step.input && <span className="bg-[#2A2A2A] text-[#A1A1AA] px-2 py-1 rounded">Input: {step.input}</span>}
                  {step.output && <span className="bg-[#2A2A2A] text-[#22C55E] px-2 py-1 rounded">Output: {step.output}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}