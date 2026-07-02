'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CMSShell from '@/components/cms/CMSShell';
import StoryEditor from '@/components/cms/StoryEditor';
import { createNewStory, mockCMSStories, type CMSStory } from '@/utils/cms-data';

const TEMPLATES: Record<string, Partial<CMSStory>> = {
  explainer: {
    title: 'Explained: [Topic] — What You Need to Know',
    slug: 'explained-topic',
    blocks: [
      { id: 'blk-t-h1', type: 'hero', data: { headline: 'Explained: [Topic] — What You Need to Know', summary: '', heroImage: '', category: '', author: '', publishedAt: '' }, collapsed: false },
      { id: 'blk-t-t1', type: 'text', data: { html: '<p>Write the introduction here...</p>' }, collapsed: false },
      { id: 'blk-t-q1', type: 'quote', data: { text: '', speaker: '', context: '' }, collapsed: false },
      { id: 'blk-t-t2', type: 'text', data: { html: '<p>Continue with background and context...</p>' }, collapsed: false },
      { id: 'blk-t-tl1', type: 'timeline', data: { events: [{ date: '', title: '', description: '' }] }, collapsed: false },
      { id: 'blk-t-f1', type: 'faq', data: { items: [{ question: '', answer: '' }] }, collapsed: false },
      { id: 'blk-t-s1', type: 'sources', data: { sources: [{ title: '', url: '', accessedAt: '', tier: 2 }] }, collapsed: false },
    ],
  },
  'the-fix': {
    title: 'The Fix: [Problem] — Solutions & Recommendations',
    slug: 'fix-topic',
    blocks: [
      { id: 'blk-fx-h1', type: 'hero', data: { headline: 'The Fix: [Problem] — Solutions & Recommendations', summary: '', heroImage: '', category: '', author: '', publishedAt: '' }, collapsed: false },
      { id: 'blk-fx-t1', type: 'text', data: { html: '<p><strong>What&#39;s wrong?</strong> Define the specific, measurable problem.</p>' }, collapsed: false },
      { id: 'blk-fx-t2', type: 'text', data: { html: '<p><strong>Who is affected?</strong> Quantify the affected population with data.</p>' }, collapsed: false },
      { id: 'blk-fx-t3', type: 'text', data: { html: '<p><strong>Root causes:</strong> List 2-4 structural root causes.</p>' }, collapsed: false },
      { id: 'blk-fx-e1', type: 'evidence', data: { claim: '', data: '', source: '', sourceUrl: '', tier: 2 }, collapsed: false },
      { id: 'blk-fx-s1', type: 'statistics', data: { stats: [{ value: '', label: 'Affected population', change: '', direction: 'up' }] }, collapsed: false },
      { id: 'blk-fx-c1', type: 'chart', data: { chartType: 'bar', title: 'Key Data', data: [{ label: '', value: 0 }], caption: '' }, collapsed: false },
      { id: 'blk-fx-c2', type: 'callout', data: { type: 'global-example', title: 'Global Example', text: 'What other countries did...' }, collapsed: false },
      { id: 'blk-fx-t4', type: 'text', data: { html: '<p><strong>Recommended actions:</strong> List specific, timebound recommendations.</p>' }, collapsed: false },
      { id: 'blk-fx-t5', type: 'text', data: { html: '<p><strong>What citizens can do:</strong> Feasible actions for ordinary people.</p>' }, collapsed: false },
      { id: 'blk-fx-t6', type: 'text', data: { html: '<p><strong>What governments can do:</strong> Legislative, executive, fiscal actions.</p>' }, collapsed: false },
      { id: 'blk-fx-s2', type: 'sources', data: { sources: [{ title: '', url: '', accessedAt: '', tier: 2 }] }, collapsed: false },
    ],
  },
  'data-story': {
    title: 'Data Story: [Topic] in Charts',
    slug: 'data-story-topic',
    blocks: [
      { id: 'blk-d-h1', type: 'hero', data: { headline: 'Data Story: [Topic] in Charts', summary: '', heroImage: '', category: '', author: '', publishedAt: '' }, collapsed: false },
      { id: 'blk-d-t1', type: 'text', data: { html: '<p>Set up the context for the data...</p>' }, collapsed: false },
      { id: 'blk-d-c1', type: 'chart', data: { chartType: 'bar', title: '', data: [{ label: '', value: 0 }], caption: '' }, collapsed: false },
      { id: 'blk-d-s1', type: 'statistics', data: { stats: [{ value: '', label: '', change: '', direction: 'up' }] }, collapsed: false },
      { id: 'blk-d-e1', type: 'evidence', data: { claim: '', data: '', source: '', sourceUrl: '', tier: 2 }, collapsed: false },
      { id: 'blk-d-c2', type: 'chart', data: { chartType: 'line', title: '', data: [{ label: '', value: 0 }], caption: '' }, collapsed: false },
      { id: 'blk-d-s2', type: 'sources', data: { sources: [{ title: '', url: '', accessedAt: '', tier: 2 }] }, collapsed: false },
    ],
  },
};

function NewStoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams?.get('template') || 'blank';

  const [story, setStory] = useState<CMSStory | null>(null);

  useEffect(() => {
    // Create new story with optional template
    const base = createNewStory();
    if (template && TEMPLATES[template]) {
      const tmpl = TEMPLATES[template];
      base.title = tmpl.title || base.title;
      base.slug = tmpl.slug || base.slug;
      base.blocks = tmpl.blocks ? tmpl.blocks.map((b) => ({
        ...b,
        id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })) : base.blocks;
    }
    setStory(base);

    // Add to mock store
    mockCMSStories.unshift(base);
  }, [template]);

  const handleSave = (updated: CMSStory) => {
    console.log('New story saved:', updated.id, updated.title);
    const idx = mockCMSStories.findIndex((s) => s.id === updated.id);
    if (idx >= 0) mockCMSStories[idx] = updated;
    // Redirect to the new story
    router.replace(`/cms/story/${updated.id}`);
  };

  if (!story) {
    return (
      <CMSShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
          Creating new story...
        </div>
      </CMSShell>
    );
  }

  return (
    <CMSShell>
      <StoryEditor story={story} onSave={handleSave} />
    </CMSShell>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense fallback={
      <CMSShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
          Loading...
        </div>
      </CMSShell>
    }>
      <NewStoryForm />
    </Suspense>
  );
}
