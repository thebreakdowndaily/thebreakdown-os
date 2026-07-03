interface HeroHighlightsProps {
  keyPoints: string[];
}

export default function HeroHighlights({ keyPoints }: HeroHighlightsProps) {
  if (!keyPoints.length) return null;

  return (
    <div className="border-t border-gray-800 pt-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Findings</h2>
      <ul className="space-y-2">
        {keyPoints.slice(0, 3).map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
