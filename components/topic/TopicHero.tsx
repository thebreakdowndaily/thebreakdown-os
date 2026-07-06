interface TopicHeroProps {
  name: string;
  description: string;
  image?: string;
  storyCount: number;
  entityCount: number;
  countryCount: number;
  orgCount: number;
  updatedAt: string;
}

export default function TopicHero({
  name, description, storyCount, entityCount, countryCount, orgCount, updatedAt,
}: TopicHeroProps) {
  return (
    <section aria-label={`Topic: ${name}`} className="py-12 sm:py-16">
      <div className="rounded-2xl bg-gradient-to-br from-[#151515] to-[#0A0A0A] border border-[#2A2A2A] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20">
            Topic Intelligence
          </span>
          <time dateTime={updatedAt} className="text-[11px] text-[#A1A1AA]/40 px-2 py-0.5">
            Updated {new Date(updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] leading-tight mb-4">{name}</h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-3xl">{description}</p>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[#2A2A2A]">
          {[
            { label: 'Stories', value: storyCount },
            { label: 'Entities', value: entityCount },
            { label: 'Countries', value: countryCount },
            { label: 'Organizations', value: orgCount },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-sm font-bold text-[#D4A843] tabular-nums">{stat.value}</span>
              <span className="text-[11px] text-[#A1A1AA]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
