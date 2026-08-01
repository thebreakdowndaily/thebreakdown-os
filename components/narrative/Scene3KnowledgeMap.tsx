/**
 * Scene 3 — The Living Story (Static Knowledge Map)
 * Governance: ERD-GRAPH-001 | ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6 Scene 3
 * One Question: "How does everything connect?"
 *
 * Phase N-1: Static illustrative projection of the 6 Story Worlds.
 * Phase N-2: Graph-backed real-time traversal (deferred).
 * Server Component — no client JS.
 */

import Link from 'next/link';
import { STORY_WORLD_THEMES, STORY_WORLD_LABELS, type StoryWorldKey } from './StoryWorldTheme';

const WORLDS: StoryWorldKey[] = ['state', 'citizen', 'planet', 'economy', 'constitution', 'future'];

const WORLD_HREFS: Record<StoryWorldKey, string> = {
  state: '/topics/state',
  citizen: '/topics/citizen',
  planet: '/topics/planet',
  economy: '/topics/economy',
  constitution: '/topics/constitution',
  future: '/topics/future',
};

const WORLD_ICONS: Record<StoryWorldKey, string> = {
  state: '⚖️',
  citizen: '🧑‍🤝‍🧑',
  planet: '🌍',
  economy: '📈',
  constitution: '📜',
  future: '🔭',
};

export default function Scene3KnowledgeMap() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-24 bg-neutral-950 overflow-hidden">
      {/* Ambient radial gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,_#0f172a_0%,_#030712_80%)]"
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            Six worlds.{' '}
            <span className="text-violet-400">One story</span>.
          </h2>
          <p className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Every investigation belongs to a world. Every world connects to every other.
            Knowledge is not collected — it is connected.
          </p>
        </div>

        {/* Story World Grid */}
        <nav aria-label="Story Worlds — Choose your investigation domain">
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 list-none p-0 m-0">
            {WORLDS.map((worldKey) => {
              const theme = STORY_WORLD_THEMES[worldKey];
              const label = STORY_WORLD_LABELS[worldKey];
              const icon = WORLD_ICONS[worldKey];
              const href = WORLD_HREFS[worldKey];

              return (
                <li key={worldKey}>
                  <Link
                    href={href}
                    className={`group relative flex flex-col justify-between h-44 sm:h-52 p-6 rounded-2xl border ${theme.border} ${theme.bg} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`}
                    aria-label={`Explore ${label}`}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-60 group-hover:opacity-80 transition-opacity`}
                    />

                    {/* World icon */}
                    <span
                      className="relative z-10 text-3xl"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>

                    {/* World name + ambience */}
                    <div className="relative z-10 space-y-1">
                      <p className={`text-lg font-serif font-bold text-white leading-tight`}>
                        {label}
                      </p>
                      <p className={`text-xs font-mono ${theme.accent} opacity-70`}>
                        {theme.ambience}
                      </p>
                    </div>

                    {/* Arrow — appears on hover */}
                    <div
                      aria-hidden="true"
                      className={`absolute top-5 right-5 ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity text-lg`}
                    >
                      →
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


      </div>
    </div>
  );
}
