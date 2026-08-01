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
import HeroSection from './HeroSection';
import MissionBar from './MissionBar';
import StartHereSection from './StartHereSection';
import LatestChapters from './LatestChapters';
import TopicHubs from './TopicHubs';
import NewsletterBand from './NewsletterBand';

export default async function HomepageLayout() {
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildHomepage(services);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* 1. Hero — flagship chapter above the fold */}
      <HeroSection leadStory={vm.leadStory} />

      {/* 2. Mission / Trust pillars */}
      <MissionBar />

      {/* 3. Start Here — first-time visitor orientation */}
      <StartHereSection />

      {/* 4. Latest Chapters */}
      <LatestChapters />

      {/* 5. Topic Hubs */}
      <TopicHubs topics={vm.topics} />

      {/* 6. Newsletter capture */}
      <NewsletterBand />
    </div>
  );
}
