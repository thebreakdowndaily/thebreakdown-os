'use client';

import Image from 'next/image';
import type { TBSStory } from '@/types/canonical';
import type { StoryBlock, ValidationResult } from '@/lib/story/tbs-converter';
import { BlockRenderer } from './blocks/registry';

interface TBSRendererProps {
  story: TBSStory;
  blocks: StoryBlock[];
  validation: ValidationResult;
}

function TBSHero({ story }: { story: TBSStory }) {
  return (
    <div className="relative mb-8">
      {story.hero.image && (
        <div className="relative w-full aspect-video bg-[#151515] rounded-xl overflow-hidden border border-[#2A2A2A]">
          <Image
            src={story.hero.image}
            alt={story.hero.altText || story.title}
            fill
            className="object-cover"
            loading="eager"
          />
          {story.hero.statistic && (
            <div className="absolute bottom-4 left-4 bg-[#0A0A0A]/90 backdrop-blur-sm border border-[#D4A843]/30 rounded-lg px-4 py-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#D4A843] tabular-nums">{story.hero.statistic}</div>
              {story.hero.statisticSource && (
                <div className="text-xs text-[#A1A1AA] mt-1">{story.hero.statisticSource}</div>
              )}
            </div>
          )}
        </div>
      )}
      <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-[#F5F5F5] leading-tight mb-2">{story.title}</h1>
      {story.subtitle && (
        <p className="mt-2 text-lg text-[#A1A1AA] mb-6 leading-relaxed">{story.subtitle}</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
        <span className="font-semibold uppercase tracking-wider text-[#D4A843]">{story.storyType}</span>
        <span>·</span>
        <span>{story.metadata.readingTimeMinutes} min read</span>
        <span>·</span>
        <span>Confidence: {story.metadata.confidence}</span>
        <span>·</span>
        <span>Updated: {story.metadata.lastVerified}</span>
      </div>
    </div>
  );
}

export function TBSRenderer({ story, blocks, validation }: TBSRendererProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {validation.errors.length > 0 && (
        <div className="mb-10 p-4 rounded-xl bg-red-950/30 border border-red-500/30" role="alert">
          <h3 className="text-sm font-bold text-red-400 mb-2">Publication Blocked</h3>
          <ul className="text-sm text-red-300 space-y-1">
            {validation.errors.map((e, i) => (
              <li key={i}>· {e}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mb-10 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30" role="alert">
          <h3 className="text-sm font-bold text-amber-400 mb-2">Editorial Warnings</h3>
          <ul className="text-sm text-amber-300 space-y-1">
            {validation.warnings.map((w, i) => (
              <li key={i}>· {w}</li>
            ))}
          </ul>
        </div>
      )}

      <TBSHero story={story} />

      <div className="space-y-12">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>

      <footer className="mt-20 pt-10 border-t border-[#2A2A2A]">
        <div className="flex flex-wrap gap-2">
          {story.metadata.tags.map((tag) => (
            <span key={tag} className="text-xs font-semibold uppercase tracking-wider text-[#D4A843] bg-[#D4A843]/10 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#737373]">
          Last verified: {story.metadata.lastVerified}
          {story.metadata.nextVerificationDue ? ` · Next verification due: ${story.metadata.nextVerificationDue}` : ''}
        </p>
      </footer>
    </article>
  );
}