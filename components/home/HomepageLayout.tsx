/**
 * HomepageLayout — RC-1 Editorial Homepage Root
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Replaces the 4-scene cinematic TheBeginning experience.
 * North Star: A first-time visitor understands The Breakdown
 *             and clicks into a chapter within 10 seconds.
 *
 * Section order (editorially deliberate):
 *   1. HeroSection      — Featured chapter. Above the fold. Answers "what should I read?"
 *   2. MissionBar       — Three trust pillars. Answers "why should I trust this?"
 *   3. StartHere        — Orientation for first-time visitors.
 *   4. LatestChapters   — Knowledge Library grid.
 *   5. TopicHubs        — Six domain entry points.
 *   6. NewsletterBand   — Email capture. Conversion.
 */

import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import { EditorialLayout } from '@/packages/editorial/src';
import { getCanonicalTrustMetrics, type TrustMetrics } from '@/lib/knowledge/trust-metrics';
import { TrustBar } from '@/components/home/trust/TrustBar';
import HeroSection from './HeroSection';
import MissionBar from './MissionBar';
import ShortVersionGrid from './ShortVersionGrid';
import DeepDivesGrid from './DeepDivesGrid';
import LatestChapters from './LatestChapters';
import TopicHubs from './TopicHubs';
import NewsletterBand from './NewsletterBand';

export default async function HomepageLayout() {
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildHomepage(services);

  let trustMetrics: TrustMetrics | null = null;
  try {
    trustMetrics = await getCanonicalTrustMetrics();
  } catch (err) {
    console.error('Failed to load trust metrics for homepage:', err);
    trustMetrics = null;
  }

  return (
    <EditorialLayout breadcrumbItems={[]}>
      <div className="text-white space-y-12">
        {/* 1. Hero — flagship chapter above the fold */}
        <HeroSection leadStory={vm.leadStory} trustMetrics={trustMetrics} />

        {/* TrustBar below the Hero */}
        <TrustBar
          chaptersPublished={trustMetrics?.publishedChapters}
          claimsRegistered={trustMetrics?.totalClaims}
          primarySources={trustMetrics?.primarySourcesCited}
          lastVerified={trustMetrics?.lastVerifiedDate}
        />

        {/* 2. What Changed — Latest Briefings */}
        <ShortVersionGrid briefings={vm.briefings} />


        {/* 3. Deep Analysis — Investigations & Explainers */}
        <DeepDivesGrid deepDives={vm.deepDives} />

        {/* 4. Explore Topics */}
        <TopicHubs topics={vm.topics} />

        {/* 5. Evidence / Documents */}
        <MissionBar />

        {/* 6. Data / Knowledge */}
        <LatestChapters trustMetrics={trustMetrics} />

        {/* 7. Newsletter capture */}
        <NewsletterBand />
      </div>
    </EditorialLayout>
  );
}
