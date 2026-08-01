// ── Volume I Chapters Registry (Phase 15C Specification) ─────────────────────
// Discovery registry referencing Volume I chapter content modules.
// Does NOT embed raw content directly; imports certified ChapterPackages.

import { ChapterPackage } from './chapter-factory';
import { CHAPTER_1_PACKAGE } from './chapter-1-data';
import { CHAPTER_2_PACKAGE } from './chapter-2-data';
import { CHAPTER_3_PACKAGE } from './chapter-3-data';
import { CHAPTER_4_PACKAGE } from './chapter-4-data';
import { CHAPTER_5_PACKAGE } from './chapter-5-data';
import { CHAPTER_6_PACKAGE } from './chapter-6-data';
import { CHAPTER_7_PACKAGE } from './chapter-7-data';

export const VOLUME_1_CHAPTERS: ChapterPackage[] = [
  CHAPTER_1_PACKAGE,
  CHAPTER_2_PACKAGE,
  CHAPTER_3_PACKAGE,
  CHAPTER_4_PACKAGE,
  CHAPTER_5_PACKAGE,
  CHAPTER_6_PACKAGE,
  CHAPTER_7_PACKAGE,
];

export class VolumeRegistryService {
  /**
   * Retrieves all published chapters in Volume I ordered deterministically.
   */
  public static getPublishedChapters(volumeSlug = 'vol-1-india-and-the-world-1947-1962'): ChapterPackage[] {
    return VOLUME_1_CHAPTERS.filter(
      (c) => c.volumeSlug === volumeSlug && c.status === 'published'
    );
  }

  /**
   * Resolves a single chapter by slug.
   */
  public static getChapterBySlug(slug: string): ChapterPackage | null {
    const found = VOLUME_1_CHAPTERS.find((c) => c.slug === slug);
    if (!found || found.status !== 'published') {
      return null;
    }
    return found;
  }
}
