import Link from 'next/link';
import Card from '@/components/ui/Card';

interface LeaderboardStory {
  slug: string;
  headline: string;
  evidenceScore: number;
}

interface EvidenceLeaderboardProps {
  stories: LeaderboardStory[];
}

export default function EvidenceLeaderboard({ stories }: EvidenceLeaderboardProps) {
  if (stories.length === 0) return null;

  return (
    <Card className="p-5 sm:p-6" accent="gold">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-5">
        Highest Evidence Stories
      </h3>
      <ul className="space-y-4">
        {stories.map((story) => (
          <li key={story.slug}>
            <Link
              href={`/story/${story.slug}`}
              className="flex items-start gap-4 group"
            >
              <span className="text-xl font-bold text-brand-400 tabular-nums leading-none mt-0.5 shrink-0 tracking-tighter">
                {story.evidenceScore}
              </span>
              <span className="text-sm font-serif text-text-secondary group-hover:text-brand-400 transition-colors duration-200 leading-snug">
                {story.headline}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
