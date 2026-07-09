/**
 * THE BREAKDOWN — Website Builder Engine v1.0
 *
 * Core engine that transforms structured JSON into component-based pages.
 *
 * Architecture:
 *   JSON (Story, Entity, etc.)
 *     ↓
 *   Website Builder (this file)
 *     ↓
 *   Component Registry → Resolve components
 *     ↓
 *   Page Template → Ordered sections
 *     ↓
 *   Layout → Slots
 *     ↓
 *   React Components → Rendered Page
 *
 * Key Principles:
 *   - Every page is a composition of reusable components
 *   - No page-specific HTML — ever
 *   - Component registry is the single source of truth
 *   - Layouts have named slots, components fill them
 *   - Pages are statically generated at build time
 *
 * Website Builder API:
 *   buildStory(data)       → StoryPage
 *   buildEntity(data)      → EntityPage
 *   buildTopic(data)       → TopicPage
 *   buildCountry(data)     → CountryPage
 *   buildTimeline(data)    → TimelinePage
 *   buildHomepage(data)    → Homepage
 *   buildSearch(data)      → SearchResults
 *   buildFeed(data)        → RSS/JSON Feed
 */

import registry from '../registry/components.json';
import templates from '../registry/page-templates.json';
import type {
  StoryJSON,
  EntityJSON,
  TopicJSON,
  CountryJSON,
  HomepageJSON,
  FixJSON,
  SearchResult,
  PageSpec,

  SEOData,
  Breadcrumb,
} from './types';

// ── Public API ──────────────────────────────────────────────────────────

export function buildStory(data: StoryJSON): PageSpec {
  const template = templates.find(t => t.id === 'story');
  if (!template) throw new Error('Template not found: story');
  const sections = filterSections(template.sections, data);

  return {
    type: 'story',
    slug: data.slug,
    template: template.id,
    layout: template.layout,
    sections: sections.map(s => ({
      id: s,
      component: resolveComponent(s),
      props: mapSectionProps(s, data),
    })),
    seo: generateSEO(data),
    breadcrumbs: generateBreadcrumbs('story', data),
    schema: [generateBreadcrumbSchema('story', data), generateSchema('story', data)],
    metadata: extractMetadata(data),
  };
}

export function buildEntity(data: EntityJSON): PageSpec {
  const template = templates.find(t => t.id === 'entity');
  if (!template) throw new Error('Template not found: entity');
  const sections = filterSections(template.sections, data);

  return {
    type: 'entity',
    slug: data.slug,
    template: template.id,
    layout: template.layout,
    sections: sections.map(s => ({
      id: s,
      component: resolveComponent(s),
      props: mapEntitySectionProps(s, data),
    })),
    seo: generateEntitySEO(data),
    breadcrumbs: generateBreadcrumbs('entity', data),
    schema: [generateBreadcrumbSchema('entity', data), generateSchema('entity', data)],
    metadata: extractEntityMetadata(data),
  };
}

export function buildTopic(data: TopicJSON): PageSpec {
  const template = templates.find(t => t.id === 'topic');
  if (!template) throw new Error('Template not found: topic');
  const sections = filterSections(template.sections, data);

  return {
    type: 'topic',
    slug: data.slug,
    template: template.id,
    layout: template.layout,
    sections: sections.map(s => ({
      id: s,
      component: resolveComponent(s),
      props: mapTopicSectionProps(s, data),
    })),
    seo: generateTopicSEO(data),
    breadcrumbs: generateBreadcrumbs('topic', data),
    schema: [generateBreadcrumbSchema('topic', data), generateSchema('topic', data)],
    metadata: extractTopicMetadata(data),
  };
}

export function buildCountry(data: CountryJSON): PageSpec {
  return buildEntity({
    ...data,
    type: 'country',
  });
}

export function buildHomepage(data: HomepageJSON): PageSpec {
  const template = templates.find(t => t.id === 'homepage');
  if (!template) throw new Error('Template not found: homepage');
  const sections = filterSections(template.sections, data);

  return {
    type: 'homepage',
    slug: '',
    template: template.id,
    layout: template.layout,
    sections: sections.map(s => ({
      id: s,
      component: resolveHomepageComponent(s),
      props: mapHomepageSectionProps(s, data),
    })),
    seo: {
      title: 'The Breakdown — India Explained',
      description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
      canonical: 'https://thebreakdown.in',
      ogType: 'website',
      ogImage: '/images/og-home.jpg',
    },
    breadcrumbs: [],
    schema: [{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Breakdown',
      url: 'https://thebreakdown.in',
    }],
    metadata: { readingTime: 0, updatedAt: new Date().toISOString() },
  };
}

export function buildSearch(query: string, results: SearchResult[]): PageSpec {
  return {
    type: 'search',
    slug: `search/${encodeURIComponent(query)}`,
    template: 'search',
    layout: 'search-layout',
    sections: [],
    seo: {
      title: `Search: ${query} — The Breakdown`,
      description: `Search results for "${query}" on The Breakdown`,
      canonical: `https://thebreakdown.in/search?q=${encodeURIComponent(query)}`,
      ogType: 'website',
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: `Search: ${query}`, href: `/search?q=${encodeURIComponent(query)}` },
    ],
    schema: [],
    metadata: { resultCount: results.length, query },
    searchResults: results,
  };
}

export function buildFix(data: FixJSON): PageSpec {
  return {
    type: 'fix',
    slug: data.slug,
    template: 'fix',
    layout: 'fix-layout',
    sections: [
      { id: 'fix-header', component: 'FixHeader', props: { fix: data } },
      { id: 'fix-problem', component: 'FixProblem', props: { section: data.problem } },
      { id: 'fix-affected', component: 'FixAffected', props: { section: data.whoIsAffected } },
      { id: 'fix-root-causes', component: 'FixRootCauses', props: { section: data.rootCauses } },
      { id: 'fix-evidence', component: 'FixEvidence', props: { section: data.evidence } },
      { id: 'fix-stakeholders', component: 'FixStakeholders', props: { stakeholders: data.stakeholders } },
      { id: 'fix-existing-solutions', component: 'FixExistingSolutions', props: { solutions: data.existingSolutions } },
      { id: 'fix-global-examples', component: 'FixGlobalExamples', props: { examples: data.globalExamples } },
      { id: 'fix-recommended-actions', component: 'FixRecommendedActions', props: { actions: data.recommendedActions } },
      { id: 'fix-citizen-actions', component: 'FixCitizenActions', props: { actions: data.citizenActions } },
      { id: 'fix-government-actions', component: 'FixGovernmentActions', props: { actions: data.governmentActions } },
      { id: 'fix-metrics', component: 'FixMetrics', props: { metrics: data.metricsToTrack } },
    ],
    seo: {
      title: `${data.headline} — The Breakdown Fix`,
      description: data.summary.slice(0, 160),
      canonical: `https://thebreakdown.in/fix/${data.slug}`,
      ogType: 'article',
      ogPublishDate: data.publishedAt,
      keywords: data.tags.join(', '),
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'The Fix', href: '/fix' },
      { label: data.headline, href: `/fix/${data.slug}` },
    ],
    schema: [generateSchema('fix', data)],
    metadata: {
      storySlug: data.storySlug,
      evidenceScore: data.evidenceScore,
      readingTime: data.readingTime,
      frameworkSections: 11,
    },
  };
}

// ── Component Resolution ────────────────────────────────────────────────

function resolveComponent(sectionId: string): string {
  const entry = registry.find(c => c.id === sectionId);
  if (!entry) {
    console.warn(`[Website Builder] Unknown section: "${sectionId}". Using fallback.`);
    return 'Fallback';
  }
  return entry.component;
}

function resolveHomepageComponent(sectionId: string): string {
  const componentMap: Record<string, string> = {
    'top-story': 'TopStory',
    'trending-analysis': 'TrendingAnalysis',
    'latest-investigations': 'LatestInvestigations',
    'data-stories': 'DataStories',
    'the-fix': 'TheFix',
    'policy-tracker': 'PolicyTracker',
    'global-watch': 'GlobalWatch',
    'latest-updates': 'LatestUpdates',
  };
  return componentMap[sectionId] || 'StoryCard';
}

// ── Section Filtering ───────────────────────────────────────────────────

function filterSections(sections: string[], data: unknown): string[] {
  return sections.filter(id => {
    const entry = registry.find(c => c.id === id);
    if (!entry) return false;

    // Check if required props are available
    if (entry.required && entry.props.length > 0) {
      // If the section has required props and data is missing them, skip
      const hasData = entry.props.some(p => (data as Record<string, unknown>)[p] !== undefined && (data as Record<string, unknown>)[p] !== null);
      if (!hasData) return false;
    }

    return true;
  });
}

// ── Section Props Mapping ───────────────────────────────────────────────

function mapSectionProps(sectionId: string, data: StoryJSON): Record<string, unknown> {
  const propMap: Record<string, (d: StoryJSON) => Record<string, unknown>> = {
      'hero': d => ({
        headline: d.headline,
        summary: d.summary,
        heroImage: d.heroImage,
        publishedAt: d.publishedAt,
        updatedAt: d.updatedAt,
        readingTime: d.readingTime,
        author: d.author,
        evidenceScore: d.evidenceScore,
        sources: d.sources.length,
      }),
    'executive-summary': d => ({
      summary: d.summary,
      keyPoints: d.keyPoints,
    }),
    'quick-facts': d => ({ facts: d.facts }),
    'timeline': d => ({ events: d.timeline }),
    'evidence': d => ({
      claims: d.claims,
      sources: d.sources,
      verificationScore: d.verificationScore,
    }),
    'data-cards': d => ({ datasets: d.datasets }),
    'charts': d => ({ charts: d.charts }),
    'maps': d => ({ geoData: d.geoData }),
    'debate': d => ({ sides: d.debate?.sides, arguments: d.debate?.sides[0]?.arguments }),
    'faq': d => ({ questions: d.faq }),
    'primary-sources': d => ({ sources: d.primarySources }),
    'related-stories': d => ({ stories: d.relatedStories }),
    'related-entities': d => ({ entities: d.relatedEntities }),
    'author-box': d => ({ author: d.author }),
    'visuals': d => ({
      visuals: {
        globes: d.visuals?.globes,
        svgs: d.visuals?.svgs,
        animations: d.visuals?.animations,
        infographics: d.visuals?.infographics,
      },
    }),
    'newsletter': () => ({}),
  };

  return propMap[sectionId](data);
}

function mapEntitySectionProps(sectionId: string, data: EntityJSON): Record<string, unknown> {
  const propMap: Record<string, (d: EntityJSON) => Record<string, unknown>> = {
    'entity-hero': d => ({ entity: { name: d.name, type: d.type, description: d.description, image: d.image, aliases: d.aliases, storyCount: d.storyCount, updatedAt: d.updatedAt } }),
    'quick-facts': d => ({ facts: Object.entries(d.statistics).map(([label, value]) => ({ label, value: String(value) })) }),
    'entity-timeline': d => ({ events: d.timeline }),
    'entity-statistics': d => ({ statistics: d.statistics, datasets: d.datasets }),
    'entity-related-stories': d => ({ stories: d.relatedStories }),
    'entity-related-entities': d => ({ entities: d.relatedEntities ?? [], title: 'Related Entities' }),
    'entity-graph': () => ({ slug: '' }),
    'entity-faq': d => ({ questions: d.faq }),
    'entity-sources': d => ({ sources: d.sources }),
    'entity-overview': d => ({ entity: d }),
    'entity-data': d => ({ datasets: d.datasets, statistics: d.statistics }),
    'related-stories': d => ({ stories: d.relatedStories }),
    'faq': d => ({ questions: d.faq }),
  };

  return propMap[sectionId](data);
}

function mapTopicSectionProps(sectionId: string, data: TopicJSON): Record<string, unknown> {
  const propMap: Record<string, (d: TopicJSON) => Record<string, unknown>> = {
    'topic-header': d => ({ topic: d }),
    'topic-collections': d => ({
      stories: d.stories,
      people: d.people,
      organizations: d.organizations,
      policies: d.policies,
      budgets: d.budgets,
      reports: d.reports,
    }),
    'topic-charts': d => ({ charts: d.charts }),
    'topic-graph': d => ({ slug: d.slug }),
    'related-stories': d => ({ stories: d.stories }),
  };

  return propMap[sectionId](data);
}

function mapHomepageSectionProps(sectionId: string, data: HomepageJSON): Record<string, unknown> {
  const propMap: Record<string, (d: HomepageJSON) => Record<string, unknown>> = {
    'top-story': d => ({ story: d.topStory }),
    'trending-analysis': d => ({ stories: d.trendingAnalyses }),
    'latest-investigations': d => ({ stories: d.latestInvestigations }),
    'data-stories': d => ({ stories: d.dataStories }),
    'the-fix': d => ({ stories: d.theFix }),
    'policy-tracker': d => ({ policies: d.policyTracker }),
    'global-watch': d => ({ stories: d.globalWatch }),
    'latest-updates': d => ({ stories: d.latestUpdates }),
  };

  return propMap[sectionId](data);
}

// ── SEO Generation ──────────────────────────────────────────────────────

function generateSEO(data: StoryJSON): SEOData {
  return {
    title: `${data.headline} — The Breakdown`,
    description: data.summary.substring(0, 160),
    canonical: `https://thebreakdown.in/story/${data.slug}`,
    ogType: 'article',
    ogImage: data.heroImage || '/images/og-default.jpg',
    ogPublishDate: data.publishedAt,
    twitterCard: 'summary_large_image',
    keywords: data.tags.join(', '),
  };
}

function generateEntitySEO(data: EntityJSON): SEOData {
  return {
    title: `${data.name} — ${capitalize(data.type)} Profile — The Breakdown`,
    description: data.description.substring(0, 160),
    canonical: `https://thebreakdown.in/entity/${data.slug}`,
    ogType: 'profile',
    ogImage: data.image || '/images/og-entity.jpg',
    keywords: [data.name, ...(data.aliases || [])].join(', '),
  };
}

function generateTopicSEO(data: TopicJSON): SEOData {
  return {
    title: `${data.name} — Topic — The Breakdown`,
    description: data.description.substring(0, 160),
    canonical: `https://thebreakdown.in/topic/${data.slug}`,
    ogType: 'website',
    ogImage: '/images/og-topic.jpg',
    keywords: data.name,
  };
}

// ── Breadcrumbs ─────────────────────────────────────────────────────────

function generateBreadcrumbs(type: string, data: { slug: string; headline?: string; name?: string; type?: string }): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [
    { label: 'Home', href: '/' },
  ];

  switch (type) {
    case 'story':
      crumbs.push(
        { label: 'Stories', href: '/stories' },
        { label: data.headline || data.slug, href: `/story/${data.slug}` }
      );
      break;
    case 'entity':
      crumbs.push(
        { label: capitalize(data.type || 'entity') + 's', href: `/${(data.type || 'entity')}s` },
        { label: data.name || 'Entity', href: `/entity/${data.slug}` }
      );
      break;
    case 'topic':
      crumbs.push(
        { label: 'Topics', href: '/topics' },
        { label: data.name || data.slug, href: `/topic/${data.slug}` }
      );
      break;
  }

  return crumbs;
}

// ── Schema.org Generation ───────────────────────────────────────────────

function generateBreadcrumbSchema(type: string, data: { slug: string; headline?: string; name?: string }): Record<string, unknown> {
  const siteUrl = 'https://thebreakdown.in';

  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
  ];

  switch (type) {
    case 'story':
      items.push(
        { '@type': 'ListItem', position: 2, name: 'Stories', item: `${siteUrl}/stories` },
        { '@type': 'ListItem', position: 3, name: data.headline || data.slug, item: `${siteUrl}/story/${data.slug}` }
      );
      break;
    case 'entity':
      items.push(
        { '@type': 'ListItem', position: 2, name: 'Entities', item: `${siteUrl}/entities` },
        { '@type': 'ListItem', position: 3, name: data.name || data.slug, item: `${siteUrl}/entity/${data.slug}` }
      );
      break;
    case 'topic':
      items.push(
        { '@type': 'ListItem', position: 2, name: 'Topics', item: `${siteUrl}/topics` },
        { '@type': 'ListItem', position: 3, name: data.name || data.slug, item: `${siteUrl}/topic/${data.slug}` }
      );
      break;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function generateSchema(type: string, data: unknown): Record<string, unknown> {
  const d = data as Record<string, unknown>;
  const base = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'story':
      return {
        ...base,
        '@type': 'NewsArticle',
        headline: d.headline,
        description: d.summary,
        datePublished: d.publishedAt,
        dateModified: d.updatedAt,
        wordCount: d.wordCount,
        author: (() => {
          const auth = d.author as { name?: string; url?: string } | undefined;
          return auth ? { '@type': 'Person' as const, name: auth.name, url: auth.url } : undefined;
        })(),
        publisher: {
          '@type': 'Organization',
          name: 'The Breakdown',
          url: 'https://thebreakdown.in',
          logo: { '@type': 'ImageObject', url: 'https://thebreakdown.in/images/og-home.jpg' },
        },
        image: d.heroImage,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://thebreakdown.in/story/${d.slug as string}`,
        },
      };

    case 'entity':
      return {
        ...base,
        '@type': d.type === 'person' ? 'Person' : 'Organization',
        name: d.name,
        description: d.description,
        url: `https://thebreakdown.in/entity/${d.slug as string}`,
        ...(d.aliases ? { additionalName: d.aliases } : {}),
        ...(d.image ? { image: d.image } : {}),
      };

    case 'topic':
      return {
        ...base,
        '@type': 'CollectionPage',
        name: d.name,
        description: d.description,
        url: `https://thebreakdown.in/topic/${String(d.slug)}`,
      };

    case 'fix':
      return {
        ...base,
        '@type': 'Article',
        headline: d.headline,
        description: d.summary,
        datePublished: d.publishedAt,
        dateModified: d.updatedAt,
        author: {
          '@type': 'Person',
          name: (d.author as { name?: string })?.name || 'The Breakdown Editorial',
        },
        publisher: {
          '@type': 'Organization',
          name: 'The Breakdown',
          url: 'https://thebreakdown.in',
        },
      };

    default:
      return base;
  }
}

// ── Metadata Extraction ─────────────────────────────────────────────────

function extractMetadata(data: StoryJSON) {
  return {
    readingTime: data.readingTime,
    wordCount: data.wordCount,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    evidenceScore: data.evidenceScore,
    category: data.category,
    tags: data.tags,
    storyId: data.id,
  };
}

function extractEntityMetadata(data: EntityJSON) {
  return {
    type: data.type,
    name: data.name,
    storyCount: data.storyCount,
    aliases: data.aliases,
    updatedAt: data.updatedAt,
  };
}

function extractTopicMetadata(data: TopicJSON) {
  return {
    name: data.name,
    storyCount: data.storyCount,
    entityCount: data.entityCount,
    updatedAt: data.updatedAt,
  };
}

// ── Build-Time Parallelism ──────────────────────────────────────────────

export async function buildAllStories(stories: StoryJSON[]): Promise<PageSpec[]> {
  return Promise.all(stories.map(s => Promise.resolve(buildStory(s))));
}

export async function buildAllEntities(entities: EntityJSON[]): Promise<PageSpec[]> {
  return Promise.all(entities.map(e => Promise.resolve(buildEntity(e))));
}

// ── Static Paths Generation ─────────────────────────────────────────────

export function generateStaticPaths(
  items: Array<{ slug: string }>
): Array<{ params: { slug: string } }> {
  return items.map(item => ({
    params: { slug: item.slug },
  }));
}

// ── Helpers ─────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
