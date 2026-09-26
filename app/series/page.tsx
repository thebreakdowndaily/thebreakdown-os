import type { Metadata } from 'next';
import { KnowledgeLibraryIndex } from '@/components/knowledge-library/KnowledgeLibraryIndex';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Series & Collections — The Breakdown',
  description: 'Structured knowledge series and flagship historical volumes on Indian strategic policy, diplomacy, and governance.',
  alternates: {
    canonical: 'https://thebreakdown.in/series',
  },
  openGraph: {
    title: 'Series & Collections — The Breakdown',
    description: 'Structured knowledge series and flagship historical volumes on Indian strategic policy, diplomacy, and governance.',
    url: 'https://thebreakdown.in/series',
  },
};

export default async function SeriesPage() {
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  return <KnowledgeLibraryIndex libraries={libraries} />;
}
