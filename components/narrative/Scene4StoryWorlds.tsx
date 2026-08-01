/**
 * Scene 4 — Story Worlds & Seasons (Entry into Investigations + Legacy Epilogue)
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6 Scene 4 & § 10
 * One Question: "Where do I begin my journey?"
 *
 * Server Component — receives HomepageTopic[] and maps to Story World tiles
 * via pure presentation mapper. HomepageViewModel untouched.
 * Includes the Universal Legacy Epilogue synthesis block.
 */

import Link from 'next/link';
import type { HomepageTopic, HomepageLeadStory } from '@/features/home/view-model';
import { STORY_WORLD_THEMES, STORY_WORLD_LABELS, type StoryWorldKey } from './StoryWorldTheme';

interface StoryWorldTile {
  worldKey: StoryWorldKey;
  label: string;
  href: string;
  description: string;
}

/**
 * Pure presentation mapper — derives Story World tiles from flat topic list.
 * Story World is a presentation concept, not homepage state.
 */
function mapTopicsToStoryWorldTiles(topics: HomepageTopic[]): StoryWorldTile[] {
  // Typed as Partial so index access returns StoryWorldKey | undefined (not just StoryWorldKey).
  const SLUG_TO_WORLD: Partial<Record<string, StoryWorldKey>> = {
    'state': 'state', 'foreign-policy': 'state', 'geopolitics': 'state', 'defence': 'state',
    'citizen': 'citizen', 'rights': 'citizen', 'identity': 'citizen', 'society': 'citizen',
    'planet': 'planet', 'climate': 'planet', 'environment': 'planet', 'water': 'planet',
    'economy': 'economy', 'economics': 'economy', 'trade': 'economy', 'finance': 'economy',
    'constitution': 'constitution', 'law': 'constitution', 'judiciary': 'constitution',
    'future': 'future', 'technology': 'future', 'ai': 'future', 'digital': 'future',
  };


  const worldOrder: StoryWorldKey[] = ['state', 'citizen', 'planet', 'economy', 'constitution', 'future'];
  const assigned = new Map<StoryWorldKey, StoryWorldTile>();

  for (const topic of topics) {
    const worldKey = SLUG_TO_WORLD[topic.slug] ?? SLUG_TO_WORLD[topic.name.toLowerCase()];
    if (worldKey !== undefined && !assigned.has(worldKey)) {
      assigned.set(worldKey, {
        worldKey,
        label: STORY_WORLD_LABELS[worldKey],
        href: `/topics/${topic.slug}`,
        description: topic.description ?? `Investigations into ${STORY_WORLD_LABELS[worldKey].toLowerCase()}.`,
      });
    }
  }

  // Fill any worlds not matched from topics with default hrefs
  for (const worldKey of worldOrder) {
    if (!assigned.has(worldKey)) {
      assigned.set(worldKey, {
        worldKey,
        label: STORY_WORLD_LABELS[worldKey],
        href: `/topics/${worldKey}`,
        description: `Investigations into ${STORY_WORLD_LABELS[worldKey].toLowerCase()}.`,
      });
    }
  }

  return worldOrder.map((k) => {
    // After the fill loop above, every world key is guaranteed to be in assigned.
    // Use a typed fallback to satisfy strict linting without a non-null assertion.
    const tile = assigned.get(k);
    if (tile === undefined) {
      // Defensive fallback — should never be reached given the fill loop.
      return {
        worldKey: k,
        label: STORY_WORLD_LABELS[k],
        href: `/topics/${k}`,
        description: `Investigations into ${STORY_WORLD_LABELS[k].toLowerCase()}.`,
      } satisfies StoryWorldTile;
    }
    return tile;
  });
}

interface Scene4StoryWorldsProps {
  topics: HomepageTopic[];
  leadStory: HomepageLeadStory | null;
}

export default function Scene4StoryWorlds({ topics, leadStory }: Scene4StoryWorldsProps) {
  const tiles = mapTopicsToStoryWorldTiles(topics);

  return (
    <div className="relative flex flex-col min-h-screen px-6 py-24 bg-neutral-950 overflow-hidden">
      {/* Ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,_#1a0a2e_0%,_#030712_70%)]"
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-16 flex-1">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            Every journey begins with{' '}
            <span className="text-emerald-400">a question</span>.
          </h2>
          <p className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Select your world. Enter the investigation. Leave understanding more than when you arrived.
          </p>
        </div>

        {/* Story World Tiles */}
        <nav aria-label="Enter an investigation world">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
            {tiles.map((tile) => {
              const theme = STORY_WORLD_THEMES[tile.worldKey];
              return (
                <li key={tile.worldKey}>
                  <Link
                    href={tile.href}
                    className={`group relative flex flex-col justify-between h-40 p-6 rounded-2xl border ${theme.border} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`}
                    style={{ backgroundColor: theme.hex }}
                    aria-label={`Enter ${tile.label} investigations`}
                  >
                    <p className={`text-lg font-serif font-bold text-white leading-tight`}>
                      {tile.label}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-mono ${theme.accent} opacity-70 max-w-[80%]`}>
                        {tile.description}
                      </p>
                      <span
                        aria-hidden="true"
                        className={`${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity text-lg`}
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Featured Investigation — if lead story is available */}
        {leadStory && (
          <div className="border-t border-neutral-800/60 pt-12 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
              Begin here — Featured Investigation
            </p>
            <Link
              href={`/story/${leadStory.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-800/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <div className="flex-1 space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-500">
                  {leadStory.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {leadStory.headline}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                  {leadStory.dek}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="text-emerald-500 text-2xl opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              >
                →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Universal Legacy Epilogue Synthesis */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mt-20 pt-12 border-t border-neutral-800/40 text-center space-y-6">
        <div className="space-y-3">
          <p className="text-2xl sm:text-3xl font-serif text-white leading-relaxed">
            Knowledge isn&apos;t collected.
          </p>
          <p className="text-2xl sm:text-3xl font-serif text-emerald-400 leading-relaxed font-bold">
            It is connected.
          </p>
        </div>

        <p className="text-sm text-neutral-500 font-mono leading-relaxed max-w-md mx-auto">
          The next question awaits.
        </p>

        <Link
          href="/investigations"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          Continue The Journey
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
