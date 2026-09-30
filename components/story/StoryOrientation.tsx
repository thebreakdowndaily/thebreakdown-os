import type { StoryOrientationModel } from '@/lib/story/presentation-model';

interface StoryOrientationProps {
  orientation?: StoryOrientationModel;
  prerequisite?: {
    title: string;
    url: string;
    summary: string;
  };
}

export function StoryOrientation({ orientation, prerequisite }: StoryOrientationProps) {
  if (!orientation && !prerequisite) return null;

  const { centralFinding, keyTakeaways, keyNumbers, whyItMatters } = orientation || {};
  if (!centralFinding && (!keyTakeaways || keyTakeaways.length === 0) && (!keyNumbers || keyNumbers.length === 0) && !whyItMatters && !prerequisite) {
    return null;
  }

  return (
    <section id="orientation" className="my-8 p-6 md:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm shadow-xl space-y-6">
      {prerequisite && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-xs space-y-1">
            <span className="font-mono font-bold uppercase tracking-wider text-amber-400 block">
              Read This First (Prerequisite Context)
            </span>
            <p className="text-neutral-200 leading-relaxed">
              {prerequisite.summary}{' '}
              <a
                href={prerequisite.url}
                className="text-amber-300 hover:text-amber-200 underline font-medium inline-flex items-center gap-0.5"
              >
                <span>{prerequisite.title}</span>
                <span>&rarr;</span>
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
          The Short Version
        </h3>
      </div>

      {centralFinding && (
        <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
          {centralFinding}
        </p>
      )}

      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Key Takeaways</h4>
          <ul className="space-y-2 text-sm md:text-base text-neutral-300">
            {keyTakeaways.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {keyNumbers && keyNumbers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-800/80">
          {keyNumbers.map((num, i) => (
            <div key={i} className="bg-neutral-950/60 border border-neutral-800/50 rounded-xl p-3.5 text-center">
              <span className="block text-2xl font-bold font-mono text-emerald-400 mb-0.5">{num.value}</span>
              <span className="block text-xs text-neutral-300 font-medium line-clamp-2">{num.label}</span>
              {num.period && <span className="block text-[10px] text-neutral-400 font-mono mt-1">{num.period}</span>}
            </div>
          ))}
        </div>
      )}

      {whyItMatters && (
        <div className="pt-4 border-t border-neutral-800/80">
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Why It Matters</h4>
          <p className="text-sm text-neutral-300 leading-relaxed">{whyItMatters}</p>
        </div>
      )}
    </section>
  );
}
