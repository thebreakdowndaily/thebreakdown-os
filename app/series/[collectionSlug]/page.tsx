import { notFound } from 'next/navigation';
import { CollectionLanding } from '@/components/knowledge-library/CollectionLanding';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({ params }: { params: Promise<{ collectionSlug: string }> }) {
  const { collectionSlug } = await params;
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const collection = await repo.getCollection('india-and-the-world', collectionSlug);
  if (!collection) notFound();
  return <CollectionLanding collection={collection} />;
}
