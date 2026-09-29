import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionLanding } from '@/components/knowledge-library/CollectionLanding';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ collectionSlug: string }> }): Promise<Metadata> {
  const { collectionSlug } = await params;
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  const library = libraries.find((lib) => lib.collections.some((c) => c.slug === collectionSlug));
  const collection = library ? await repo.getCollection(library.slug, collectionSlug) : null;
  if (!collection) return { title: 'Collection Not Found — The Breakdown' };

  const title = `${collection.title} — The Breakdown Knowledge Library`;
  const description = collection.summary || collection.subtitle || `Explore ${collection.title} on The Breakdown.`;
  const canonical = `https://thebreakdown.in/series/${collectionSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
    },
    alternates: {
      canonical,
    },
  };
}

export async function generateStaticParams() {
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  const params = [];
  
  for (const lib of libraries) {
    for (const col of lib.collections) {
      params.push({ collectionSlug: col.slug });
    }
  }
  
  return params;
}

export default async function CollectionPage({ params }: { params: Promise<{ collectionSlug: string }> }) {
  const { collectionSlug } = await params;
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  const library = libraries.find((lib) => lib.collections.some((c) => c.slug === collectionSlug));
  if (!library) notFound();
  const collection = await repo.getCollection(library.slug, collectionSlug);
  if (!collection) notFound();
  return <CollectionLanding collection={collection} />;
}
