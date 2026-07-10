interface TopicStatsProps {
  statistics: Array<{ label: string; value: string }>;
}

export default function TopicStats({ statistics }: TopicStatsProps) {
  if (statistics.length === 0) return null;

  return (
    <section aria-label="Key statistics" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Key Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statistics.map((stat, i) => (
          <div key={i} className="rounded-xl bg-[#151515] border border-[#2A2A2A] p-4 sm:p-5 flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-bold text-[#D4A843] tabular-nums leading-none">{stat.value}</span>
            <span className="text-xs text-[#A1A1AA] mt-2">{stat.label}</span>
            <div className="w-8 h-0.5 bg-[#D4A843]/30 rounded-full mt-3" />
          </div>
        ))}
      </div>
    </section>
  );
}
