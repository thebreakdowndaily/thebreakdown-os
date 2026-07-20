import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import FixLayout from '@/layouts/FixLayout';
import FixRenderer from '@/components/fix/FixRenderer';
import type { Fix, ExistingSolution } from '@/types/canonical';

export async function generateStaticParams() {
  const services = bootstrapServices({ publicOnly: true });
  return (await services.fixes.getFixes({ pageSize: 100 })).data.map((f) => ({ slug: f.slug }));
}

function toFixJSON(fix: Record<string, unknown>): Fix {
  const raw = (fix._raw || fix) as Record<string, unknown>;
  return {
    id: raw.id as string,
    slug: raw.slug as string,
    storySlug: raw.storySlug as string,
    headline: raw.headline as string,
    summary: raw.summary as string,
    heroImage: raw.heroImage as string | undefined,
    publishedAt: raw.publishedAt as string,
    updatedAt: raw.updatedAt as string,
    readingTime: raw.readingTime as number,
    author: raw.author as Fix['author'],
    evidenceScore: raw.evidenceScore as number,
    tags: (raw.tags || []) as string[],
    problem: raw.problem as Fix['problem'],
    whoIsAffected: raw.whoIsAffected as Fix['whoIsAffected'],
    rootCauses: raw.rootCauses as Fix['rootCauses'],
    evidence: raw.evidence as Fix['evidence'],
    stakeholders: raw.stakeholders as Fix['stakeholders'],
    existingSolutions: ((raw.existingSolutions || []) as Array<Record<string, unknown>>).map((s): ExistingSolution => ({
      name: s.name as string,
      description: s.description as string,
      status: s.status as ExistingSolution['status'],
      effectiveness: s.effectiveness as ExistingSolution['effectiveness'],
      source: s.source as string | undefined,
    })),
    globalExamples: raw.globalExamples as Fix['globalExamples'],
    recommendedActions: raw.recommendedActions as Fix['recommendedActions'],
    citizenActions: raw.citizenActions as Fix['citizenActions'],
    governmentActions: raw.governmentActions as Fix['governmentActions'],
    metricsToTrack: raw.metricsToTrack as Fix['metricsToTrack'],
    relatedStories: raw.relatedStories as Fix['relatedStories'],
    relatedEntities: raw.relatedEntities as Fix['relatedEntities'],
    sources: (raw.sources || []) as Fix['sources'],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const fix = await services.fixes.getFixBySlug(slug);
  if (!fix) return { title: 'Fix Not Found — The Breakdown' };
  const f = fix as unknown as Record<string, unknown>;
  return {
    title: `${f.headline} — The Breakdown Fix`,
    description: ((f.summary as string) || '').slice(0, 160),
    alternates: { canonical: `https://thebreakdown.in/fix/${fix.slug}` },
    keywords: ((f.tags as string[]) || []).join(', '),
    openGraph: {
      title: `${f.headline} — The Breakdown Fix`,
      description: ((f.summary as string) || '').slice(0, 160),
      type: 'article',
      url: `https://thebreakdown.in/fix/${fix.slug}`,
      images: f.heroImage ? [{ url: f.heroImage as string, width: 1200, height: 630, alt: f.headline as string }] : [{ url: '/images/og-home.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: `${f.headline} — The Breakdown Fix`, description: ((f.summary as string) || '').slice(0, 160) },
  };
}

export default async function FixPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const fix = await services.fixes.getFixBySlug(slug);
  if (!fix) notFound();

  const f = fix as unknown as Record<string, unknown>;
  const fixJSON = toFixJSON(f);
  const headline = f.headline as string;
  const summary = (f.summary as string) || '';
  const tags = (f.tags || []) as string[];

  return (
    <>
      <Script id="schema-fix" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline,
          description: summary.slice(0, 160),
          url: `https://thebreakdown.in/fix/${fix.slug}`,
          publisher: { '@type': 'Organization', name: 'The Breakdown' },
        })}
      </Script>
      <FixLayout
        seo={{
          title: `${headline} — The Breakdown Fix`,
          description: summary.slice(0, 160),
          canonical: `https://thebreakdown.in/fix/${fix.slug}`,
          ogType: 'article',
        }}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'The Fix', href: '/fix' },
          { label: headline, href: `/fix/${fix.slug}` },
        ]}
      >
        <FixRenderer fix={fixJSON} />
      </FixLayout>
    </>
  );
}
