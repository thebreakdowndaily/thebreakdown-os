import type { Story } from '@/types/canonical';
import { createArticleSchema, createBreadcrumbSchema, createFAQSchema } from '@/lib/seo/jsonld';

export function createStoryJsonLd(story: Story): Record<string, unknown>[] {
  const breadcrumbs = story.slug.split('-').slice(0, 2).join(' ').toUpperCase();

  const ld: Record<string, unknown>[] = [
    createArticleSchema({
      headline: story.headline,
      summary: story.summary,
      url: `https://thebreakdown.in/story/${story.slug}`,
      image: story.heroImage,
      publishedAt: story.publishedAt,
      updatedAt: story.updatedAt,
      authorName: story.author,
      wordCount: story.blocks?.reduce((sum, b) => sum + (JSON.stringify(b).length / 5), 0) || 0,
      category: story.category,
      tags: story.tags,
      isNews: true,
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: breadcrumbs, url: '/stories' },
      { name: story.headline.slice(0, 60), url: `/story/${story.slug}` },
    ]),
  ];

  const faqBlocks = story.blocks?.filter((b) => b.type === 'faq') || [];
  if (faqBlocks.length > 0) {
    const questions: { question: string; answer: string }[] = [];
    faqBlocks.forEach((block) => {
      const data = block.data as any;
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q: any) => {
          questions.push({ question: q.question, answer: q.answer });
        });
      }
    });

    const faqSchema = createFAQSchema(questions);
    if (faqSchema) {
      ld.push(faqSchema);
    }
  }

  ld.push({
    '@context': 'https://thebreakdown.in/schema',
    '@type': 'TheBreakdownKnowledgeStory',
    headline: story.headline,
    summary: story.summary,
    entities: story.tags || [],
    topics: story.category ? [story.category] : [],
    claims: story.claims?.map((c) => ({
      claim: c.claim,
      source: c.source,
      verification: c.status,
      confidence: c.confidence,
    })) || [],
    sources: story.sources?.map((s: any) => ({
      title: s.title,
      url: s.url,
      tier: s.tier,
    })) || [],
    timeline: story.timeline?.map((t) => ({
      date: t.date,
      title: t.title,
      description: t.description,
    })) || [],
    relationships: story.stakeholderNames || [],
  });

  return ld;
}
