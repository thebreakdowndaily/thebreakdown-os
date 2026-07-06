import type { EntityJSON, TimelineEvent, FAQItem, RelatedStory, RelatedEntity, Dataset, PrimarySource } from '@/utils/types';

export interface EntityPageViewModel {
  entity: {
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string;
    image?: string;
    aliases?: string[];
    storyCount: number;
    evidenceScore: number;
    updatedAt: string;
  };
  overview?: string;
  quickFacts: Array<{ label: string; value: string }>;
  timeline: TimelineEvent[];
  datasets: Dataset[];
  statistics: Record<string, number | string>;
  stories: RelatedStory[];
  entities: RelatedEntity[];
  topics: RelatedEntity[];
  faq: FAQItem[];
  sources: PrimarySource[];
}

export function buildEntityViewModel(data: EntityJSON): EntityPageViewModel {
  return {
    entity: {
      id: data.id,
      slug: data.slug,
      name: data.name,
      type: data.type,
      description: data.description,
      image: data.image,
      aliases: data.aliases,
      storyCount: data.storyCount,
      evidenceScore: data.evidenceScore ?? 0,
      updatedAt: data.updatedAt,
    },
    overview: data.overview,
    quickFacts: Object.entries(data.statistics).map(([label, value]) => ({ label, value: String(value) })),
    timeline: data.timeline ?? [],
    datasets: data.datasets ?? [],
    statistics: data.statistics,
    stories: data.relatedStories ?? [],
    entities: data.relatedEntities ?? [],
    topics: data.relatedTopics ?? [],
    faq: data.faq ?? [],
    sources: data.sources ?? [],
  };
}
