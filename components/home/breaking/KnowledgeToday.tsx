interface KnowledgeTodayProps {
  metrics: {
    stories: number;
    entities: number;
    topics: number;
    claimsVerified: number;
    datasetsUpdated: number;
  };
}

export default function KnowledgeToday({ metrics }: KnowledgeTodayProps) {
  const stats = [
    { label: 'Major Stories', value: metrics.stories },
    { label: 'New Entities', value: metrics.entities },
    { label: 'New Topics', value: metrics.topics },
    { label: 'Claims Verified', value: metrics.claimsVerified },
    { label: 'Datasets Updated', value: metrics.datasetsUpdated },
  ];

  return (
    <section className="bg-[#0a0a0a] border-b border-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          
          <div className="shrink-0">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Today's<br/>
              <span className="text-emerald-500">Intelligence</span>
            </h2>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-4xl font-light text-white mb-2">{stat.value}</span>
                <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
