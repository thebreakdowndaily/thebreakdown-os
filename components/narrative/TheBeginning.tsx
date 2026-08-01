/**
 * TheBeginning — Narrative Experience Root (4-Scene Trailer)
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6 | docs/philosophy/narrative-operating-system.md
 *
 * Server Component root orchestrator. Fetches HomepageViewModel via existing
 * buildHomepage() — no new canonical models or services.
 * Architecture: Server-first. Only Scene2Inquiry and NarrativeMemory hydrate client-side.
 *
 * Component tree:
 *   TheBeginning (Server)
 *     NarrativeMemory (Client island — localStorage read only)
 *     NarrativeSection#scene-1 → Scene1Opening (Server)
 *     SceneTransition
 *     NarrativeSection#scene-2 → Scene2Inquiry (Client — input only)
 *     SceneTransition
 *     NarrativeSection#scene-3 → Scene3KnowledgeMap (Server — static projection)
 *     SceneTransition
 *     NarrativeSection#scene-4 → Scene4StoryWorlds (Server + LegacyEpilogue)
 */

import { bootstrapServices } from '@/lib/bootstrap';
import { buildHomepage } from '@/features/home/view-model';
import NarrativeSection from './NarrativeSection';
import SceneTransition from './SceneTransition';
import Scene1Opening from './Scene1Opening';
import Scene2Inquiry from './Scene2Inquiry';
import Scene3KnowledgeMap from './Scene3KnowledgeMap';
import Scene4StoryWorlds from './Scene4StoryWorlds';
import NarrativeMemory from './NarrativeMemory';
import NarrativeReveal from './NarrativeReveal';

export default async function TheBeginning() {
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildHomepage(services);

  return (
    <div className="bg-neutral-950 text-white">
      {/* IntersectionObserver — adds .narrative-revealed on viewport entry */}
      <NarrativeReveal />

      {/* Returning reader banner — client island, renders null on SSR */}
      <NarrativeMemory />

      {/* ─── Scene I: The Opening Scene ─── */}
      <NarrativeSection id="scene-1" label="The Opening Scene — Platform Identity">
        <Scene1Opening />
      </NarrativeSection>

      {/* Contemplative pause */}
      <SceneTransition text="Every headline is part of a bigger story." />

      {/* ─── Scene II: Begin With a Question ─── */}
      <NarrativeSection id="scene-2" label="Begin With a Question — Inquiry Terminal">
        <Scene2Inquiry />
      </NarrativeSection>

      {/* Contemplative pause */}
      <SceneTransition text="Every answer reveals another question." />

      {/* ─── Scene III: The Living Map ─── */}
      <NarrativeSection id="scene-3" label="The Living Map — Story Worlds">
        <Scene3KnowledgeMap />
      </NarrativeSection>

      {/* Contemplative pause */}
      <SceneTransition text="Understanding is not a destination. It is a practice." />

      {/* ─── Scene IV: Choose Your World ─── */}
      <NarrativeSection id="scene-4" label="Choose Your World — Enter Investigation">
        <Scene4StoryWorlds topics={vm.topics} leadStory={vm.leadStory} />
      </NarrativeSection>
    </div>
  );
}
