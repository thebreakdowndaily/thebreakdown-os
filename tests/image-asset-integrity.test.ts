import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getPlaceholder } from '../lib/image-intelligence/registry';
import { DefaultImageIntelligenceService } from '../services/media/intelligence';
import type { Story } from '../types/canonical';

describe('Image Asset Integrity & Security Verification', () => {
  it('ensures all static placeholders referenced in registry exist on disk and have non-zero size', () => {
    const categories = [
      'economy',
      'technology',
      'health',
      'environment',
      'policy',
      'education',
      'investigation',
      'story',
      'entity',
      'person',
      'organization',
      'country',
    ];

    for (const cat of categories) {
      const placeholderPath = getPlaceholder(cat);
      expect(placeholderPath).toMatch(/^\/images\/placeholders\/.+\.svg$/);

      const diskPath = path.join(process.cwd(), 'public', placeholderPath.slice(1));
      expect(fs.existsSync(diskPath), `Placeholder for ${cat} must exist at ${diskPath}`).toBe(true);

      const stats = fs.statSync(diskPath);
      expect(stats.size, `Placeholder for ${cat} must not be empty`).toBeGreaterThan(0);
    }
  });

  it('ensures unknown category falls back gracefully to a valid placeholder on disk', () => {
    const fallbackPath = getPlaceholder('unknown-category-12345');
    const diskPath = path.join(process.cwd(), 'public', fallbackPath.slice(1));
    expect(fs.existsSync(diskPath)).toBe(true);
    expect(fs.statSync(diskPath).size).toBeGreaterThan(0);
  });

  it('ensures no image generation secret is exposed in NEXT_PUBLIC_ env variables', () => {
    const envKeys = Object.keys(process.env);
    const exposedSecrets = envKeys.filter((k) =>
      k.startsWith('NEXT_PUBLIC_') &&
      (k.includes('OPENAI') || k.includes('DALL') || k.includes('IMAGE_KEY') || k.includes('MIDJOURNEY'))
    );
    expect(exposedSecrets).toEqual([]);
  });

  it('verifies all image references in store and knowledge libraries exist on disk', () => {
    const filesToAudit = [
      'utils/data-layer/store.ts',
      'utils/data-layer/investigation-data.ts',
      'utils/data-layer/knowledge-library-data.ts',
      'lib/image-intelligence/registry.ts',
    ];

    const regex = /(?:heroImage|image):\s*['"]([^'"]+)['"]/g;
    const missing: string[] = [];

    for (const file of filesToAudit) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = regex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/')) {
          const diskPath = path.join(process.cwd(), 'public', url.slice(1));
          if (!fs.existsSync(diskPath)) {
            missing.push(`${file} -> ${url} (NOT FOUND)`);
          } else if (fs.statSync(diskPath).size === 0) {
            missing.push(`${file} -> ${url} (0 BYTES)`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('verifies ImageIntelligenceService falls back safely to branded placeholder when no AI key is provided', async () => {
    const savedKey = process.env.OPENAI_API_KEY;
    const savedImgKey = process.env.IMAGE_GENERATION_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.IMAGE_GENERATION_API_KEY;

    try {
      const intelligence = new DefaultImageIntelligenceService();
      intelligence.fetchOfficialImage = async () => null;

      const mockStory: Story = {
        id: 'safety-test-story',
        title: 'Safety Test Story',
        slug: 'safety-test-story',
        headline: 'Safety Test Story Headline',
        summary: 'Summary of the safety test story.',
        category: 'environment',
        status: 'published',
        heroImage: '',
        author: 'Editorial Desk',
        evidenceScore: 90,
        readingTime: 5,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        blocks: [],
        sources: [],
        claims: [],
        timeline: [],
        faq: [],
        charts: [],
        relatedStoryIds: [],
        relatedEntityIds: ['NonExistentEntity'],
        relatedTopicIds: [],
      };

      const resolved = await intelligence.resolveImageForStory(mockStory);
      expect(resolved).not.toBeNull();
      expect(resolved?.src).toBe('/images/placeholders/environment-placeholder.svg');
      expect(resolved?.isAiGenerated).toBe(false);
      expect(resolved?.verificationStatus).toBe('SOURCE_VERIFIED');
    } finally {
      if (savedKey) process.env.OPENAI_API_KEY = savedKey;
      if (savedImgKey) process.env.IMAGE_GENERATION_API_KEY = savedImgKey;
    }
  });
});
