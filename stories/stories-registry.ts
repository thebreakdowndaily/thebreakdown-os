/**
 * ─── The Breakdown OS — Stories Registry (canonical) ──────────────────────────
 * Canonical enumeration of Season 1 editorial stories. Each entry references a
 * directory under `stories/<slug>/` containing `story.yaml`.
 *
 * Governed by: AGENTS.md (Registry System / Knowledge First) and the Season 1
 * publication plan in `stories/README.md`.
 *
 * The registry is the source of truth for *which stories exist*. The check
 * script `scripts/stories-registry-check.ts` verifies the registry is
 * consistent with the filesystem (no missing directories, no parse failures,
 * no duplicate slugs, no orphan story directories).
 */

export type StoryStageStatus =
  | 'idea'
  | 'research'
  | 'verification'
  | 'knowledge'
  | 'architecture'
  | 'narrative'
  | 'editorial'
  | 'review'
  | 'learning'
  | 'publication'
  | 'observation'
  | 'first_correction_cycle';

export interface StoryRegistryEntry {
  slug: string;
  title: string;
  season: number;
  week: number;
  collection: string;
  volume: number;
  chapter: number;
}

export const STORY_REGISTRY: StoryRegistryEntry[] = [
  {
    slug: 'indias-inheritance-partition',
    title: "India's Inheritance — The Partition and Its Legacies",
    season: 1,
    week: 1,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 1,
  },
  {
    slug: 'kashmir-the-first-test',
    title: 'Kashmir: The First Test',
    season: 1,
    week: 2,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 2,
  },
  {
    slug: 'india-china-border-lac',
    title: 'India–China Border: The Cold Peace Along the LAC',
    season: 1,
    week: 3,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 3,
  },
  {
    slug: 'non-alignment',
    title: 'Non-Alignment',
    season: 1,
    week: 4,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 4,
  },
  {
    slug: 'the-1962-war',
    title: 'The 1962 War',
    season: 1,
    week: 5,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 5,
  },
  {
    slug: 'indias-nuclear-doctrine',
    title: "India's Nuclear Doctrine",
    season: 1,
    week: 6,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 6,
  },
  {
    slug: 'look-east-to-indo-pacific',
    title: 'Look East to Indo-Pacific',
    season: 1,
    week: 7,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 7,
  },
  {
    slug: 'indias-grand-strategy-today',
    title: "India's Grand Strategy Today",
    season: 1,
    week: 8,
    collection: 'india-and-the-world',
    volume: 1,
    chapter: 8,
  },
];

const registryBySlug = new Map<string, StoryRegistryEntry>();
for (const entry of STORY_REGISTRY) {
  registryBySlug.set(entry.slug, entry);
}

export function getStoryRegistryEntry(slug: string): StoryRegistryEntry | undefined {
  return registryBySlug.get(slug);
}

export function getRegisteredStorySlugs(): string[] {
  return STORY_REGISTRY.map((e) => e.slug);
}
