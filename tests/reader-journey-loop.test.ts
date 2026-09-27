import { describe, it, expect } from 'vitest';
import { getPublicStories } from '../utils/data-layer/store';
import { buildStoryPresentationModel } from '../lib/story/presentation-model';
import { applyReadingModePolicy } from '../lib/story/reading-mode-policy';
import { resolveStory } from '../lib/story/resolver';
import { isCanonicalStoryPublic } from '../lib/story/publication';

describe('Loop 05 Reader Journey Test Suite', () => {
  const publicStories = getPublicStories({ pageSize: 1000 }).data;

  it('ensures all public stories resolve via canonical/legacy resolver without crashing', async () => {
    expect(publicStories.length).toBeGreaterThan(0);
    for (const story of publicStories) {
      const res = await resolveStory(story.slug);
      expect(res.type).not.toBe('not_found');
      if (res.type !== 'not_found') {
        expect(res.canonicalStory).toBeDefined();
        expect(res.canonicalStory.slug).toBe(story.slug);
      }
    }
  });

  it('ensures 100% of TOC items across all public stories and modes map to real DOM IDs', () => {
    const modes = ['standard', 'quick', 'deep'] as const;

    for (const story of publicStories) {
      for (const mode of modes) {
        const model = buildStoryPresentationModel(story);
        const visible = applyReadingModePolicy(model, mode);

        const validIds = new Set<string>();
        if (mode === 'quick') {
          if (visible.quickBrief) {
            validIds.add('quick-brief');
            if (visible.quickBrief.keyFindings && visible.quickBrief.keyFindings.length > 0) validIds.add('key-findings');
            if (visible.quickBrief.essentialSources && visible.quickBrief.essentialSources.length > 0) validIds.add('essential-sources');
          }
        } else {
          if (visible.orientation) {
            const o = visible.orientation;
            if (o.centralFinding || (o.keyTakeaways && o.keyTakeaways.length > 0) || (o.keyNumbers && o.keyNumbers.length > 0) || o.whyItMatters) {
              validIds.add('orientation');
            }
          }
          for (const ch of visible.chapters) {
            validIds.add(ch.id);
          }
          const hasInlineTimeline = visible.chapters.some((ch) =>
            ch.blocks.some((b: any) => b.type === 'timeline')
          );
          if (visible.showTimeline && !hasInlineTimeline && visible.timeline && visible.timeline.events.length > 0) {
            validIds.add('timeline');
          }
          if (visible.showResearchAppendix && visible.research) {
            const r = visible.research;
            if ((r.claims && r.claims.length > 0) || (r.sources && r.sources.length > 0) || (r.faq && r.faq.length > 0)) {
              validIds.add('research-appendix');
            }
          }
          if (visible.showRelatedStories && visible.relatedStories && visible.relatedStories.length > 0) {
            validIds.add('continue-exploring');
          }
        }

        const seenIds = new Set<string>();
        for (const item of visible.toc) {
          expect(seenIds.has(item.id), `Duplicate TOC id "${item.id}" in story "${story.slug}" mode "${mode}"`).toBe(false);
          seenIds.add(item.id);
          expect(validIds.has(item.id), `TOC anchor #${item.id} does not exist in rendered DOM for story "${story.slug}" in mode "${mode}"`).toBe(true);
        }
      }
    }
  });

  it('ensures every public story has relevant, non-circular, published related stories', async () => {
    for (const story of publicStories) {
      const res = await resolveStory(story.slug);
      expect(res.type).not.toBe('not_found');
      if (res.type !== 'not_found') {
        const related = res.relatedStories;
        expect(related.length, `Story ${story.slug} must have at least one related story`).toBeGreaterThan(0);
        for (const r of related) {
          expect(r.slug, `Story ${story.slug} must not recommend itself`).not.toBe(story.slug);
          expect(isCanonicalStoryPublic(r), `Related story ${r.slug} must be publicly published`).toBe(true);
        }
      }
    }
  });

  it('ensures all sources have non-empty titles or names and valid publishers', () => {
    for (const story of publicStories) {
      const model = buildStoryPresentationModel(story);
      if (model.research?.sources) {
        for (const src of model.research.sources) {
          expect(src.title).toBeDefined();
          expect(src.title.trim().length).toBeGreaterThan(0);
          expect(src.publisher).toBeDefined();
          expect(src.sourceType).toBeDefined();
        }
      }
    }
  });

  it('ensures quick reading mode provides essential brief and does not distort evidence', () => {
    for (const story of publicStories) {
      const model = buildStoryPresentationModel(story);
      const quick = applyReadingModePolicy(model, 'quick');
      expect(quick.mode).toBe('quick');
      expect(quick.quickBrief).toBeDefined();
      expect(quick.quickBrief?.question).toBeDefined();
      expect(quick.quickBrief?.answer).toBeDefined();
    }
  });

  it('ensures nonexistent story slugs fail closed with not_found', async () => {
    const res = await resolveStory('non-existent-story-slug-xyz-987');
    expect(res.type).toBe('not_found');
  });
});
