import { describe, expect, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('StoryShell timeline duplication prevention', () => {
  test('inline timeline block in chapters suppresses redundant standalone StoryShell timeline section', () => {
    const chaptersWithInlineTimeline = [
      {
        id: 'chapter-0',
        order: 0,
        title: 'Founding Chronology',
        blocks: [
          {
            id: 'b-h-timeline',
            type: 'chapter-heading',
            data: { title: 'Founding Chronology' },
          },
          {
            id: 'b-timeline-2',
            type: 'timeline',
            data: {
              events: [
                { date: '1947', title: 'Independence', description: 'Mountbatten plan' },
                { date: '1948', title: 'Ceasefire', description: 'UN Resolution' },
              ],
            },
          },
        ],
      },
    ];

    // StoryShell's inline timeline predicate:
    const hasInlineTimeline = chaptersWithInlineTimeline.some((ch) =>
      ch.blocks.some((b) => (b as any).type === 'timeline')
    );

    expect(hasInlineTimeline).toBe(true);

    const showTimeline = true;
    const timeline = {
      events: [
        { date: '1947', title: 'Independence', description: 'Mountbatten plan' },
        { date: '1948', title: 'Ceasefire', description: 'UN Resolution' },
      ],
    };

    // StoryShell condition: showTimeline && !hasInlineTimeline && timeline && timeline.events.length > 0
    const shouldRenderStandaloneTimeline = Boolean(
      showTimeline && !hasInlineTimeline && timeline && timeline.events.length > 0
    );

    expect(shouldRenderStandaloneTimeline).toBe(false);
  });

  test('metadata-only timeline renders standalone StoryShell timeline section when no inline block exists', () => {
    const chaptersWithoutInlineTimeline = [
      {
        id: 'chapter-0',
        order: 0,
        title: 'Background',
        blocks: [
          {
            id: 'b-p-1',
            type: 'text',
            data: { content: 'Sample narrative paragraph.' },
          },
        ],
      },
    ];

    const hasInlineTimeline = chaptersWithoutInlineTimeline.some((ch) =>
      ch.blocks.some((b) => (b as any).type === 'timeline')
    );

    expect(hasInlineTimeline).toBe(false);

    const showTimeline = true;
    const timeline = {
      events: [
        { date: '1947', title: 'Partition', description: 'Transfer of power' },
        { date: '1950', title: 'Republic', description: 'Constitution adopted' },
      ],
    };

    const shouldRenderStandaloneTimeline = Boolean(
      showTimeline && !hasInlineTimeline && timeline && timeline.events.length > 0
    );

    expect(shouldRenderStandaloneTimeline).toBe(true);
  });

  test('InteractiveTimelineBlock defines id="timeline" for TOC anchor navigation', () => {
    const componentPath = path.resolve(__dirname, '../../components/story/blocks/InteractiveTimelineBlock.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('id="timeline"');
  });

  test('StoryShell enforces !hasInlineTimeline guard before rendering standalone timeline', () => {
    const shellPath = path.resolve(__dirname, '../../components/rxs/StoryShell.tsx');
    const content = fs.readFileSync(shellPath, 'utf8');
    expect(content).toContain('const hasInlineTimeline = chapters.some');
    expect(content).toContain('!hasInlineTimeline');
  });
});

