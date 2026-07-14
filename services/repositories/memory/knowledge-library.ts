import type {
  KnowledgeLibrary, KnowledgeCollection, Volume, Chapter,
} from '@/types/canonical';
import type { KnowledgeLibraryService } from '../../interfaces/knowledge-library';

export class MemoryKnowledgeLibraryRepository implements KnowledgeLibraryService {
  private store = new Map<string, KnowledgeLibrary>();

  constructor(libraries: KnowledgeLibrary[] = []) {
    libraries.forEach(l => this.store.set(l.id, l));
  }

  async getLibrary(slug: string): Promise<KnowledgeLibrary | null> {
    return Array.from(this.store.values()).find(l => l.slug === slug) || null;
  }

  async getCollection(
    librarySlug: string,
    collectionSlug: string,
  ): Promise<KnowledgeCollection | null> {
    const lib = await this.getLibrary(librarySlug);
    if (!lib) return null;
    return lib.collections.find(c => c.slug === collectionSlug) || null;
  }

  async getVolume(
    librarySlug: string,
    collectionSlug: string,
    volumeSlug: string,
  ): Promise<Volume | null> {
    const collection = await this.getCollection(librarySlug, collectionSlug);
    if (!collection) return null;
    return collection.volumes.find(v => v.slug === volumeSlug) || null;
  }

  async getChapter(
    librarySlug: string,
    collectionSlug: string,
    volumeSlug: string,
    chapterSlug: string,
  ): Promise<Chapter | null> {
    const volume = await this.getVolume(librarySlug, collectionSlug, volumeSlug);
    if (!volume) return null;
    return volume.chapters.find(c => c.slug === chapterSlug) || null;
  }

  async getAllLibraries(): Promise<KnowledgeLibrary[]> {
    return Array.from(this.store.values());
  }
}
