import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import FixLayout from '@/layouts/FixLayout';
import FixRenderer from '@/components/fix/FixRenderer';
import { FixMetadataService } from '@/services/fixes/fix-metadata.service';
import type { Fix } from '@/types/canonical';

export async function generateStaticParams() {
  const services = bootstrapServices({ publicOnly: true });
  const fixes = await services.fixes.getFixes({ pageSize: 100 });
  return fixes.data.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const fix = await services.fixes.getFixBySlug(slug);
  if (!fix) return { title: 'Fix Not Found — The Breakdown' };

  const canonicalFix = fix as unknown as Fix;
  const og = FixMetadataService.toOpenGraph(canonicalFix);

  return {
    title: `${canonicalFix.headline} — The Breakdown Fix`,
    description: canonicalFix.summary.slice(0, 160),
    alternates: { canonical: og.canonicalUrl },
    keywords: canonicalFix.tags.join(', '),
    openGraph: {
      title: og['og:title'],
      description: og['og:description'],
      type: 'article',
      url: og['og:url'],
      siteName: og['og:site_name'],
    },
    twitter: {
      card: 'summary_large_image',
      title: og['twitter:title'],
      description: og['twitter:description'],
    },
  };
}

export default async function FixPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const fix = await services.fixes.getFixBySlug(slug);
  if (!fix) notFound();

  const canonicalFix = fix as unknown as Fix;
  const jsonLd = FixMetadataService.toJSONLD(canonicalFix);

  return (
    <>
      <Script id="schema-fix-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
      <FixLayout
        seo={{
          title: `${canonicalFix.headline} — The Breakdown Fix`,
          description: canonicalFix.summary.slice(0, 160),
          canonical: FixMetadataService.toCanonicalUrl(canonicalFix),
          ogType: 'article',
        }}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'The Fix Hub', href: '/fix' },
          { label: canonicalFix.headline, href: `/fix/${canonicalFix.slug}` },
        ]}
      >
        <FixRenderer fix={canonicalFix} />
      </FixLayout>
    </>
  );
}
