import { KnowledgeLibraryIndex } from '@/components/knowledge-library/KnowledgeLibraryIndex';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const revalidate = 3600;

export default async function SeriesPage() {
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  return <KnowledgeLibraryIndex libraries={libraries} />;
}
