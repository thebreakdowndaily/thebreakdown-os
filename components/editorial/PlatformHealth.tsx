'use client';

interface PlatformHealthProps {
  data: {
    storiesPublished: number;
    drafts: number;
    needsReview: number;
    averageScore: number;
    averageVisualScore: number;
  };
}

export default function PlatformHealth({ data }: PlatformHealthProps) {
  const metrics = [
    { label: 'Published', value: data.storiesPublished },
    { label: 'Drafts', value: data.drafts },
    { label: 'Needs Review', value: data.needsReview, alert: data.needsReview > 10 },
    { label: 'Avg Story Score', value: `${data.averageScore}%`, highlight: data.averageScore >= 90 },
    { label: 'Avg Visual Score', value: `${data.averageVisualScore}%`, highlight: data.averageVisualScore >= 90 },
  ];

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">Platform Health</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col">
            <span className={`text-4xl font-mono mb-2 ${m.alert ? 'text-red-500' : m.highlight ? 'text-emerald-500' : 'text-white'}`}>
              {m.value}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
