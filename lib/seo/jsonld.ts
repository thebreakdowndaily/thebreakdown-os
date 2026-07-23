export interface ArticleSchemaArgs {
  headline: string;
  summary: string;
  url: string;
  image?: string;
  publishedAt: string;
  updatedAt: string;
  authorName?: string;
  wordCount?: number;
  category?: string;
  tags?: string[];
  isNews?: boolean;
}

export function createArticleSchema(args: ArticleSchemaArgs): Record<string, unknown> {
  const {
    headline,
    summary,
    url,
    image,
    publishedAt,
    updatedAt,
    authorName = 'The Breakdown',
    wordCount = 0,
    category,
    tags,
    isNews = false,
  } = args;

  return {
    '@context': 'https://schema.org',
    '@type': isNews ? 'NewsArticle' : 'Article',
    headline,
    description: summary,
    ...(image
      ? {
          image: {
            '@type': 'ImageObject',
            url: image.startsWith('http') ? image : `https://thebreakdown.in${image}`,
            width: 1200,
            height: 630,
          },
        }
      : {}),
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: { '@type': 'Organization', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'The Breakdown',
      logo: { '@type': 'ImageObject', url: 'https://thebreakdown.in/logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    wordCount,
    articleSection: category,
    keywords: tags?.join(', '),
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://thebreakdown.in${item.url}`,
    })),
  };
}

export function createFAQSchema(questions: { question: string; answer: string }[]): Record<string, unknown> | null {
  if (!questions || questions.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}
