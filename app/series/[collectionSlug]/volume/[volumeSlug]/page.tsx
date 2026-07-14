import { notFound } from 'next/navigation';
import { VolumePage } from '@/components/knowledge-library/VolumePage';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const dynamic = 'force-dynamic';

export default async function VolumeRoute({ params }: { params: Promise<{ collectionSlug: string; volumeSlug: string }> }) {
  const { collectionSlug, volumeSlug } = await params;
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const volume = await repo.getVolume('india-and-the-world', collectionSlug, volumeSlug);
  if (!volume) notFound();
  return <VolumePage volume={volume} collectionSlug={collectionSlug} />;
}
