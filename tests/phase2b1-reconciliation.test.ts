import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getPublicStories, getFixes } from '@/utils/data-layer/store';
import { SupabaseStoryRepository } from '@/services/repositories/supabase/story';
import { SupabaseFixRepository } from '@/services/repositories/supabase/fix';
import { resolveNextBestUnderstanding } from '@/lib/comprehension/next-best-understanding';
import { getFixesForStory } from '@/lib/fix-helpers';

// Bootstrap environment from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

describe('Phase 2B-1: Publication State Reconciliation & Runtime Decoupling', () => {
  it('achieves 1:1 public story count and slug parity between Memory and Supabase', async () => {
    const memoryStories = await getPublicStories({ pageSize: 100 });
    const memorySlugs = memoryStories.data.map((s) => s.slug).sort();

    const storyRepo = new SupabaseStoryRepository();
    const supabaseStories = await storyRepo.getPublicStories({ pageSize: 100 });
    const supabaseSlugs = supabaseStories.data.map((s) => s.slug).sort();

    expect(memorySlugs.length).toBe(41);
    expect(supabaseSlugs.length).toBe(41);
    expect(supabaseSlugs).toEqual(memorySlugs);
  }, 15000);

  it('achieves 1:1 public fix count and slug parity between Memory and Supabase', async () => {
    const memoryFixes = await getFixes();
    const memoryFixSlugs = memoryFixes.data.map((f) => f.slug).sort();

    const fixRepo = new SupabaseFixRepository();
    const supabaseFixes = await fixRepo.getFixes();
    const supabaseFixSlugs = supabaseFixes.data.map((f) => f.slug).sort();

    expect(memoryFixSlugs.length).toBe(6);
    expect(supabaseFixSlugs.length).toBe(6);
    expect(supabaseFixSlugs).toEqual(memoryFixSlugs);
  }, 15000);

  it('ensures all 15 Namami Gange draft chapters remain strictly invisible in Supabase public read', async () => {
    const storyRepo = new SupabaseStoryRepository();
    const supabaseStories = await storyRepo.getPublicStories();
    const draftChapterFound = supabaseStories.data.some(s => s.slug.startsWith('ng-ch-'));
    expect(draftChapterFound).toBe(false);
  }, 15000);

  it('ensures all 17 quarantined test artifacts remain strictly invisible in Supabase public read', async () => {
    const storyRepo = new SupabaseStoryRepository();
    const supabaseStories = await storyRepo.getPublicStories();
    const quarantinedFound = supabaseStories.data.some(s => s.isTestArtifact === true);
    expect(quarantinedFound).toBe(false);
  }, 15000);

  it('resolves Next Best Understanding plans dynamically using injected canonical context with zero fixture bypass', () => {
    const plan = resolveNextBestUnderstanding('mgnrega-reform');
    expect(plan.storySlug).toBe('mgnrega-reform');
    expect(plan.steps.length).toBeGreaterThanOrEqual(2);

    // Test with service-injected context
    const customPlan = resolveNextBestUnderstanding('custom-story', {
      story: {
        id: 'cust-1',
        slug: 'custom-story',
        title: 'Custom Title',
        headline: 'Custom Headline',
        summary: 'Summary',
        category: 'policy',
        tags: [],
        author: 'Staff',
        status: 'published',
        readingTime: 5,
        evidenceScore: 90,
        publishedAt: '2026-01-01',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        storyType: 'standard',
        blocks: [],
        sources: [],
        claims: [],
        timeline: [],
        faq: [],
        charts: [],
        relatedStoryIds: [],
        relatedEntityIds: [],
        relatedTopicIds: ['governance'],
      } as any,
      fixes: [
        {
          id: 'fix-custom',
          slug: 'fix-custom',
          storySlug: 'custom-story',
          headline: 'Custom Policy Fix',
          primaryCategory: 'administrative',
          problemStatement: 'Problem statement',
          tags: [],
          author: { name: 'Staff', role: 'Editor' },
          problem: { title: 'P', content: 'C' },
          whoIsAffected: { title: 'W', content: 'C' },
          rootCauses: { title: 'R', content: 'C' },
          evidence: { title: 'E', content: 'C' },
          stakeholders: [],
          existingSolutions: [],
          globalExamples: [],
          recommendedActions: [],
          citizenActions: [],
          governmentActions: [],
          metricsToTrack: [],
          relatedStories: [],
          relatedEntities: [],
          sources: [],
        } as any,
      ],
      otherStories: [],
    });

    expect(customPlan.storySlug).toBe('custom-story');
    expect(customPlan.steps.some(s => s.url === '/fix/fix-custom')).toBe(true);
    expect(customPlan.steps.some(s => s.url === '/topic/governance')).toBe(true);
  });
});
