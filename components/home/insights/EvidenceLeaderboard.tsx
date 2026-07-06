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
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843] mb-4">
        Highest Evidence Stories
      </h3>
      <ul className="space-y-3">
        {stories.map((story) => (
          <li key={story.slug}>
            <Link
              href={`/story/${story.slug}`}
              className="flex items-start gap-3 group"
            >
              <span className="text-lg font-bold text-[#D4A843] tabular-nums leading-none mt-0.5 shrink-0">
                {story.evidenceScore}
              </span>
              <span className="text-sm text-[#A1A1AA] group-hover:text-[#F5F5F5] transition-colors duration-200 leading-snug">
                {story.headline}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
