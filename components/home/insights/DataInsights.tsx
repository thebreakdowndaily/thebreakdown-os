import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Badge from '@/components/ui/Badge';
import StatsGrid from './StatsGrid';
import TrendingList from './TrendingList';
import EvidenceLeaderboard from './EvidenceLeaderboard';
import RecentUpdates from './RecentUpdates';

interface LeaderboardStory {
  slug: string;
  headline: string;
  evidenceScore: number;
}

interface TrendingItem {
  label: string;
  count: number;
  slug?: string;
}

interface UpdateCategory {
  category: string;
  count: number;
}

interface DataInsightsProps {
  stats: {
    totalStories: number;
    totalEntities: number;
    totalTopics: number;
    totalCountries: number;
    totalOrganizations: number;
  };
  trending: TrendingItem[];
  leaderboard: LeaderboardStory[];
  recentUpdates: UpdateCategory[];
}

export default function DataInsights({ stats, trending, leaderboard, recentUpdates }: DataInsightsProps) {
  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60">
      <Container as="div" className="py-16 sm:py-20">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div className="flex-1 min-w-0">
            <SectionHeader
              eyebrow="Dashboard"
              title="Data & Intelligence"
              description="Evidence-backed reporting across India and the world."
            />
          </div>
          <Badge variant="evidence" className="shrink-0 mt-1">
            Live Dataset
          </Badge>
        </div>

        <StatsGrid
          stats={[
            { label: 'Stories', value: stats.totalStories, href: '/stories' },
            { label: 'Entities', value: stats.totalEntities, href: '/entities' },
            { label: 'Topics', value: stats.totalTopics, href: '/topics' },
            { label: 'Countries', value: stats.totalCountries, href: '/countries' },
          ]}
        />

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <TrendingList items={trending} />
          <EvidenceLeaderboard stories={leaderboard} />
        </div>

        <div className="mt-6">
          <RecentUpdates categories={recentUpdates} />
        </div>
      </Container>
    </section>
  );
}
