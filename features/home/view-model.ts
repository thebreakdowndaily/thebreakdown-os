/**
 * Homepage View Model Builder — Release 1
 * Governance: docs/rxs/screens/homepage.md & AGENTS.md Architectural Hierarchy
 *
 * Transforms canonical domain stories and datasets into presentation-ready view models
 * for homepage sections. Keeps presentation rules out of UI components.
 */

import type { Services } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { QualityBuilder } from '@/services/stories/pipeline/quality';
import { TimelineBuilder } from '@/services/stories/pipeline/timeline';
import { EntityBuilder } from '@/services/stories/pipeline/entities';
import { getReaderTrustSignals, TrustSignal } from '@/lib/story/trust-signals';
import { extractFinancialFeature, FinancialFeatureData } from '@/lib/story/financial-eligibility';

export interface HomepageLeadStory {
  slug: string;
  category: string;
  headline: string;
  dek: string;
  readingTime: number;
  updatedAt: string;
  byline: string;
  trustSignals: TrustSignal[];
  heroImage?: string;
  actionText: string;
}

export interface HomepageBriefing {
  slug: string;
  headline: string;
  summary: string;
  category: string;
  readingTime: number;
  trustSignals: TrustSignal[];
}

export interface HomepageDeepDive {
  slug: string;
  category: string;
  headline: string;
  summary: string;
  readingTime: number;
  trustSignals: TrustSignal[];
  heroImage?: string;
}

export interface HomepageTopic {
  slug: string;
  name: string;
  description?: string;
  storyCount?: number;
}

export interface HomepageUpdate {
  slug: string;
  headline: string;
  category: string;
  dateStr: string;
  readingTime: number;
}

export interface HomepageData {
  seo: { title: string; description: string; canonical: string; ogType: string };
  leadStory: HomepageLeadStory | null;
  briefings: HomepageBriefing[];
  deepDives: HomepageDeepDive[];
  financialFeature: FinancialFeatureData | null;
  topics: HomepageTopic[];
  recentlyUpdated: HomepageUpdate[];
}

export async function buildHomepage(services: Services): Promise<HomepageData> {
  const allStoriesRaw = [...(await services.stories.getPublicStories({ pageSize: 100 })).data]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const pipeline = new KnowledgeStoryPipeline()
    .add(new EntityBuilder())
    .add(new VisualIntelligenceBuilder())
    .add(new TimelineBuilder())
    .add(new QualityBuilder());

  // 1. Lead Story — dominant editorial priority
  const rawLead = allStoriesRaw[0];
  let leadStory: HomepageLeadStory | null = null;

  if (rawLead) {
    const executedLead: any = await pipeline.execute(rawLead);
    const heroImg: string | undefined = executedLead?.visualAssets?.hero?.resolvedAsset?.optimization?.cdnUrl || rawLead.heroImage;
    const authorName = typeof rawLead.author === 'string' ? rawLead.author : rawLead.author?.name;

    leadStory = {
      slug: rawLead.slug,
      category: rawLead.category || 'policy',
      headline: rawLead.headline,
      dek: rawLead.summary,
      readingTime: rawLead.readingTime || 10,
      updatedAt: new Date(rawLead.updatedAt || rawLead.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      byline: authorName || 'The Breakdown Desk',
      trustSignals: getReaderTrustSignals(rawLead),
      heroImage: heroImg,
      actionText: 'Understand the story →',
    };
  }

  // 2. The Short Version (Briefings 3–5 items)
  const rawBriefings = allStoriesRaw.slice(1, 5);
  const briefings: HomepageBriefing[] = rawBriefings.map((s) => ({
    slug: s.slug,
    headline: s.headline,
    summary: s.summary,
    category: s.category || 'policy',
    readingTime: s.readingTime || 5,
    trustSignals: getReaderTrustSignals(s),
  }));

  // 3. Deep Dives (2–4 items)
  const rawDeepDives = allStoriesRaw.slice(5, 9);
  const deepDives: HomepageDeepDive[] = await Promise.all(
    rawDeepDives.map(async (s) => {
      const executed: any = await pipeline.execute(s);
      const heroImg: string | undefined = executed?.visualAssets?.hero?.resolvedAsset?.optimization?.cdnUrl || s.heroImage;
      return {
        slug: s.slug,
        category: s.category || 'investigation',
        headline: s.headline,
        summary: s.summary,
        readingTime: s.readingTime || 12,
        trustSignals: getReaderTrustSignals(s),
        heroImage: heroImg,
      };
    })
  );

  // 4. Follow the Money — eligible financial feature
  let financialFeature: FinancialFeatureData | null = null;
  for (const story of allStoriesRaw) {
    const feat = extractFinancialFeature(story);
    if (feat) {
      financialFeature = feat;
      break;
    }
  }

  // 5. Topics
  const rawTopics = (await services.topics.getTopics()).data;
  const topics: HomepageTopic[] = rawTopics.slice(0, 10).map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
  }));

  // 6. Recently Updated Stories
  const recentlyUpdated: HomepageUpdate[] = allStoriesRaw.slice(0, 6).map((s) => ({
    slug: s.slug,
    headline: s.headline,
    category: s.category || 'policy',
    dateStr: new Date(s.updatedAt || s.publishedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    }),
    readingTime: s.readingTime || 8,
  }));

  return {
    seo: {
      title: 'The Breakdown — Evidence Before Conclusions',
      description: 'An evidence-driven explanatory journalism and public-knowledge platform.',
      canonical: 'https://thebreakdown.in',
      ogType: 'website',
    },
    leadStory,
    briefings,
    deepDives,
    financialFeature,
    topics,
    recentlyUpdated,
  };
}
