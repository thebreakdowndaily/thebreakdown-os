import type { StoryOrientationModel } from '@/lib/story/presentation-model';

interface StoryOrientationProps {
  orientation?: StoryOrientationModel;
}

export function StoryOrientation({ orientation }: StoryOrientationProps) {
  if (!orientation) return null;

  const { centralFinding, keyTakeaways, keyNumbers, whyItMatters } = orientation;
  if (!centralFinding && (!keyTakeaways || keyTakeaways.length === 0) && (!keyNumbers || keyNumbers.length === 0) && !whyItMatters) {
    return null;
  }

  return (
    <section id="orientation" className="my-8 p-6 md:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm shadow-xl space-y-6">
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
