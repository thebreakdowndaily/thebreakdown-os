import type { KnowledgeLibrary, KnowledgeCollection, Volume, Chapter } from '@/types/canonical';

export interface KnowledgeLibraryService {
  getLibrary(slug: string): Promise<KnowledgeLibrary | null>;
  getCollection(librarySlug: string, collectionSlug: string): Promise<KnowledgeCollection | null>;
  getVolume(librarySlug: string, collectionSlug: string, volumeSlug: string): Promise<Volume | null>;
  getChapter(librarySlug: string, collectionSlug: string, volumeSlug: string, chapterSlug: string): Promise<Chapter | null>;
  getAllLibraries(): Promise<KnowledgeLibrary[]>;
}
