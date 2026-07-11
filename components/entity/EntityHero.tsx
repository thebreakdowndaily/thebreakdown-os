import Image from 'next/image';

const typeColors: Record<string, string> = {
  person: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  organization: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  policy: 'bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30',
  scheme: 'bg-green-500/10 text-green-400 border-green-500/30',
  company: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  country: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  city: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  act: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  court: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  committee: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  report: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  technology: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  default: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

interface EntityHeroProps {
  name: string;
  type: string;
  description: string;
  image?: string;
  aliases?: string[];
  storyCount: number;
  evidenceScore: number;
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
    <section aria-label={`Entity profile: ${name}`} className="pb-8 sm:pb-10">
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {image && (
          <div className="w-full h-48 sm:h-56 relative bg-[#0A0A0A]">
            <Image
              src={image}
              alt={name}
              fill
              priority
              className="object-cover opacity-60"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent z-10" />
          </div>
        )}
        <div className="p-6 sm:p-8 relative z-20">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">{name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tc}`}>
                  {type}
                </span>
              </div>
              {aliases && aliases.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {aliases.map((alias, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2A2A2A] text-[#A1A1AA]">
                      {alias}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#D4A843]">{storyCount}</p>
                <p className="text-xs text-[#A1A1AA]">Stories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#22C55E]">{evidenceScore}</p>
                <p className="text-xs text-[#A1A1AA]">Evidence</p>
              </div>
            </div>
          </div>
          <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed mb-5">{description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {established && <StatChip label="Established" value={established} />}
            {coverage && <StatChip label="Coverage" value={coverage} />}
            {ministry && <StatChip label="Ministry" value={ministry} />}
            {beneficiaries && <StatChip label="Beneficiaries" value={beneficiaries} />}
          </div>
          <p className="text-xs text-[#A1A1AA] mt-4">Updated {new Date(updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2">
      <p className="text-xs text-[#A1A1AA]">{label}</p>
      <p className="text-sm font-semibold text-[#F5F5F5]">{value}</p>
    </div>
  );
}
