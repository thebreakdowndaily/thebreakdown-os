import React from 'react';

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage?: string;
  ogPublishDate?: string;
  twitterCard?: string;
  keywords?: string;
}

interface SEOHeadProps {
  seo: SEOData;
}

const SEOHead: React.FC<SEOHeadProps> = ({ seo }) => (
  <>
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    {seo.keywords && <meta name="keywords" content={seo.keywords} />}
    <link rel="canonical" href={seo.canonical} />

    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
    <meta property="og:type" content={seo.ogType} />
    <meta property="og:url" content={seo.canonical} />
    {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
    {seo.ogPublishDate && <meta property="og:article:published_time" content={seo.ogPublishDate} />}

    <meta name="twitter:card" content={seo.twitterCard || 'summary_large_image'} />
    <meta name="twitter:title" content={seo.title} />
    <meta name="twitter:description" content={seo.description} />
    {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': seo.ogType === 'article' ? 'NewsArticle' : 'WebPage',
          headline: seo.title,
          description: seo.description,
          url: seo.canonical,
          ...(seo.ogImage && { image: seo.ogImage }),
          ...(seo.ogPublishDate && { datePublished: seo.ogPublishDate }),
        }),
      }}
    />
  </>
);

export default SEOHead;
