import type { TopicJSON, TimelineEvent, FAQItem, RelatedStory, RelatedEntity, ChartDef } from '@/utils/types';

export interface TopicPageViewModel {
  topic: {
    id: string;
    slug: string;
    name: string;
    description: string;
    overview?: string;
    image?: string;
    updatedAt: string;
  };
  statistics: Array<{ label: string; value: string }>;
  timeline: TimelineEvent[];
  stories: RelatedStory[];
  entities: RelatedEntity[];
  countries: RelatedEntity[];
  organizations: RelatedEntity[];
  faq: FAQItem[];
  charts: ChartDef[];
}

export function buildTopicViewModel(data: TopicJSON): TopicPageViewModel {
  return {
    topic: {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      overview: data.overview,
      image: data.image,
      updatedAt: data.updatedAt,
    },
    statistics: [
      { label: 'Stories', value: String(data.storyCount) },
      { label: 'Entities', value: String(data.entityCount) },
      { label: 'Countries', value: String(data.countries?.length ?? 0) },
      { label: 'Organizations', value: String(data.organizations.length) },
    ],
    timeline: data.timeline ?? [],
    stories: data.stories,
    entities: [
      ...data.people.map((p) => ({ ...p, type: 'person' as const })),
      ...data.policies.map((p) => ({ ...p, type: 'policy' as const })),
      ...data.budgets.map((b) => ({ ...b, type: 'budget' as const })),
      ...data.reports.map((r) => ({ ...r, type: 'report' as const })),
    ],
    countries: data.countries ?? [],
    organizations: data.organizations,
    faq: data.faq ?? [],
    charts: data.charts,
  };
}
