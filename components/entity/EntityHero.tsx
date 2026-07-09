import React from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';

const typeColors: Record<string, string> = {
  person: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  organization: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  policy: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  scheme: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  company: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  country: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  default: 'text-neutral-400 border-neutral-400/30 bg-neutral-400/10',
};

interface EntityHeroProps {
  name: string;
  type: string;
  description: string;
  image?: string;
  aliases?: string[];
  storyCount: number;
  evidenceScore?: number;
  established?: string;
  coverage?: string;
  ministry?: string;
  beneficiaries?: string;
  updatedAt: string;
}

export default function EntityHero({
  name, type, description, image, aliases, storyCount, evidenceScore,
  established, coverage, ministry, beneficiaries, updatedAt,
}: EntityHeroProps) {
  const tc = typeColors[type.toLowerCase()] || typeColors.default;
  
  return (
    <section aria-label={`Entity profile: ${name}`} className="relative w-full bg-neutral-950 border-b border-neutral-900 overflow-hidden">
      <Container className="py-12 sm:py-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {image && (
            <div className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 relative rounded-full overflow-hidden border border-neutral-800 bg-neutral-900">
              <Image src={image} alt={name} fill className="object-cover" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${tc}`}>
                {type}
              </span>
              <time dateTime={updatedAt} className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                Updated {new Date(updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-editorial)' }}>
              {name}
            </h1>
            
            {aliases && aliases.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {aliases.map((alias, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
                    AKA {alias}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl mb-8 font-medium">
              {description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-800 border border-neutral-800 rounded-xl overflow-hidden max-w-4xl">
              <StatChip label="Stories" value={String(storyCount)} highlight="text-amber-400" />
              {evidenceScore !== undefined && (
                <StatChip label="Avg Evidence" value={`${evidenceScore}%`} highlight="text-emerald-400" />
              )}
              {established && <StatChip label="Established" value={established} />}
              {coverage && <StatChip label="Coverage" value={coverage} />}
              {ministry && <StatChip label="Ministry" value={ministry} />}
              {beneficiaries && <StatChip label="Beneficiaries" value={beneficiaries} />}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StatChip({ label, value, highlight = "text-white" }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="bg-neutral-950 p-4 sm:p-5 flex flex-col justify-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
        {label}
      </span>
      <span className={`text-xl font-bold tracking-tight leading-none ${highlight}`}>
        {value}
      </span>
    </div>
  );
}
