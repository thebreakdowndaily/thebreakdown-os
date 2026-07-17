import { notFound } from 'next/navigation';
import { VolumePage } from '@/components/knowledge-library/VolumePage';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  const params = [];
  
  for (const lib of libraries) {
    for (const col of lib.collections) {
      for (const vol of col.volumes) {
        params.push({ 
          collectionSlug: col.slug,
          volumeSlug: vol.slug
        });
      }
    }
  }
  
  return params;
}

export default async function VolumeRoute({ params }: { params: Promise<{ collectionSlug: string; volumeSlug: string }> }) {
  const { collectionSlug, volumeSlug } = await params;
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const volume = await repo.getVolume('india-and-the-world', collectionSlug, volumeSlug);
  if (!volume) notFound();
  const collection = await repo.getCollection('india-and-the-world', collectionSlug);
  const collectionTitle = collection?.title || collectionSlug;
  return <VolumePage volume={volume} collectionSlug={collectionSlug} collectionTitle={collectionTitle} />;
}
