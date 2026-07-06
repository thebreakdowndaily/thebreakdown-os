import Heading from '@/components/ui/Heading';

interface HeroHighlightsProps {
  keyPoints: string[];
}

export default function HeroHighlights({ keyPoints }: HeroHighlightsProps) {
  if (!keyPoints.length) return null;

  return (
    <div>
      <Heading level="caption" as="h2" className="font-semibold uppercase tracking-wider mb-3">
        Key Findings
      </Heading>
      <ul className="space-y-2">
        {keyPoints.slice(0, 3).map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A843] shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
