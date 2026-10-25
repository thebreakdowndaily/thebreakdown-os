/**
 * THE BREAKDOWN OS — Architectural Fitness & Invariant Verification Suite
 *
 * Enforces the architectural boundaries, circular dependency rules, and
 * public content integrity invariants defined in ADR-0006 and ACG-1.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildTopicPage } from '@/features/topic/view-model';
import { buildPublicTopicSummaries } from '@/features/topic/public-topic-summary';
import { canPubliclyViewStory, storyPublicationContext } from '@/lib/story/publication';
import type { Story, Topic } from '@/types/canonical';

describe('Architectural Fitness Gate (ADR-0006)', () => {
  const roots = [
    'app',
    'components',
    'design-system',
    'features',
    'services',
    'lib',
    'packages',
    'plugins',
    'types',
    'utils',
    'hooks',
    'providers',
    'schemas',
    'stories',
    'data',
    'registry',
    'styles',
  ];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(e.name)) {
          getAllFiles(full, fileList);
        }
      } else if (e.isFile()) {
        const ext = path.extname(e.name);
        if (extensions.includes(ext) && !e.name.endsWith('.d.ts')) {
          fileList.push(full.replace(/\\/g, '/'));
        }
      }
    }
    return fileList;
  }

  const allSourceFiles = roots.flatMap((r) => getAllFiles(r));
  const fileMap = new Map<string, string>();
  for (const f of allSourceFiles) {
    fileMap.set(f, f);
    const withoutExt = f.substring(0, f.lastIndexOf('.'));
    if (!fileMap.has(withoutExt)) fileMap.set(withoutExt, f);
    if (f.endsWith('/index.ts') || f.endsWith('/index.tsx') || f.endsWith('/index.js')) {
      const d = path.dirname(f);
      if (!fileMap.has(d)) fileMap.set(d, f);
    }
  }

  function resolveImport(sourceFile: string, raw: string): string | null {
    let target = '';
    if (raw.startsWith('.')) {
      target = path.normalize(path.join(path.dirname(sourceFile), raw)).replace(/\\/g, '/');
    } else if (raw.startsWith('@/')) {
      target = raw.replace('@/', '');
    } else {
      return null;
    }

    if (fileMap.has(target)) return fileMap.get(target)!;
    for (const ext of extensions) {
      if (fileMap.has(target + ext)) return fileMap.get(target + ext)!;
      if (fileMap.has(`${target}/index${ext}`)) return fileMap.get(`${target}/index${ext}`)!;
    }
    return null;
  }

  it('Invar-01: Zero runtime circular dependencies across all architectural layers', () => {
    const adj = new Map<string, Set<string>>();
    for (const f of allSourceFiles) adj.set(f, new Set());

    const importRegex = /(?:import\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]|export\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)|import\(['"]([^'"]+)['"]\))/g;

    for (const file of allSourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        if (match[0].startsWith('import type') || match[0].startsWith('export type')) continue;
        const raw = match[1] || match[2] || match[3] || match[4];
        if (!raw) continue;
        const resolved = resolveImport(file, raw);
        if (resolved && resolved !== file) {
          adj.get(file)?.add(resolved);
        }
      }
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();
    const cycles: string[][] = [];

    function dfs(node: string, stack: string[]) {
      visited.add(node);
      inStack.add(node);
      stack.push(node);

      const neighbors = adj.get(node) || new Set();
      for (const next of neighbors) {
        if (!visited.has(next)) {
          dfs(next, stack);
        } else if (inStack.has(next)) {
          const cycleStart = stack.indexOf(next);
          if (cycleStart >= 0) {
            cycles.push(stack.slice(cycleStart));
          }
        }
      }

      stack.pop();
      inStack.delete(node);
    }

    for (const f of allSourceFiles) {
      if (!visited.has(f)) {
        dfs(f, []);
      }
    }

    expect(cycles, `Expected 0 runtime circular dependency chains, found ${cycles.length}: ${JSON.stringify(cycles)}`).toHaveLength(0);
  });

  it('Invar-02: Presentation components in components/ must never import from app/ (Next.js entry points)', () => {
    const componentFiles = getAllFiles('components');
    const violations: { file: string; target: string }[] = [];

    for (const f of componentFiles) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes("from '@/app/") || line.includes('from "@/app/')) {
          violations.push({ file: f, target: line.trim() });
        }
      }
    }

    expect(violations, `Component-to-app imports violate presentation boundary: ${JSON.stringify(violations)}`).toHaveLength(0);
  });

  it('Invar-03: Shared library utilities in lib/ must never import from components/', () => {
    const libFiles = getAllFiles('lib');
    const violations: { file: string; target: string }[] = [];

    for (const f of libFiles) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes("from '@/components/") || line.includes('from "@/components/')) {
          violations.push({ file: f, target: line.trim() });
        }
      }
    }

    expect(violations, `Lib-to-components imports violate dependency direction: ${JSON.stringify(violations)}`).toHaveLength(0);
  });

  it('Invar-04: Canonical models in types/ must never import from features/, components/, or app/', () => {
    const typeFiles = getAllFiles('types');
    const violations: { file: string; target: string }[] = [];

    for (const f of typeFiles) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (
          line.includes("from '@/features/") ||
          line.includes("from '@/components/") ||
          line.includes("from '@/app/")
        ) {
          violations.push({ file: f, target: line.trim() });
        }
      }
    }

    expect(violations, `Type layer inversions violate canonical contract: ${JSON.stringify(violations)}`).toHaveLength(0);
  });

  it('Invar-05: Topic Directory and Topic Page Header & Rendered Cards 100% Parity', async () => {
    const services = bootstrapServices({ publicOnly: true });
    const [topicsRes, storiesRes] = await Promise.all([
      services.topics.getTopics({ pageSize: 100 }),
      services.stories.getPublicStories({ pageSize: 100 }),
    ]);

    const topics = topicsRes.data;
    const stories = storiesRes.data;
    const summaries = buildPublicTopicSummaries(topics, stories);

    for (const topic of topics) {
      const directoryCount = summaries.get(topic.slug)?.storyCount ?? 0;
      const vm = await buildTopicPage(services, topic.slug);
      expect(vm, `Topic page view model must exist for topic: ${topic.slug}`).not.toBeNull();
      if (!vm) continue;

      const { storyGroups, totalStories: vmTotalStories, allStories = [] } = vm;

      // Simulate topic page sections
      const shown = new Set<string>();
      const sections: { key: string; stories: any[] }[] = [];
      const pushSection = (key: string, cap: number, source: any[]) => {
        const items = source.filter((s) => !shown.has(s.slug)).slice(0, cap);
        if (items.length > 0) {
          items.forEach((s) => shown.add(s.slug));
          sections.push({ key, stories: items });
        }
      };
      pushSection('focus', 3, storyGroups.recommended);
      pushSection('latest', 6, storyGroups.latest);
      pushSection('deep', 4, storyGroups.highestEvidence);
      pushSection('important', 4, storyGroups.important);
      pushSection('archive', 4, storyGroups.historical);

      const topicAllStories = allStories.length > 0 ? allStories : (storyGroups.all || []);
      const remainingStories = topicAllStories.filter((s) => !shown.has(s.slug));
      if (remainingStories.length > 0) {
        remainingStories.forEach((s) => shown.add(s.slug));
        sections.push({ key: 'archive-more', stories: remainingStories });
      }

      const renderedStoryCount = shown.size;
      const headerCount = vmTotalStories ?? shown.size;

      expect(headerCount).toBe(directoryCount);
      expect(renderedStoryCount).toBe(directoryCount);
    }
  });

  it('Invar-06: Knowledge graph projection strictly excludes unpublished drafts and quarantined test fixtures', async () => {
    const services = bootstrapServices({ publicOnly: true });
    const graph = await services.graph.build();

    const storyNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'story');
    for (const node of storyNodes) {
      const story = await services.stories.getStory(node.id);
      if (story) {
        expect(canPubliclyViewStory(storyPublicationContext(story))).toBe(true);
        expect(story.isTestArtifact).not.toBe(true);
      }
    }
  });

  it('Invar-07: Search index strictly excludes unpublished drafts and quarantined test artifacts', () => {
    const services = bootstrapServices({ publicOnly: true });
    const draftStory: Story = {
      id: 'mock-draft-adversarial-test',
      slug: 'mock-draft-adversarial-test',
      title: 'Secret Unpublished Investigation Draft',
      summary: 'This must never be searchable.',
      category: 'investigation',
      author: 'Antigravity Test',
      publishedAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
      readingTime: 5,
      evidenceScore: 90,
      impactLevel: 'high',
      tags: ['secret', 'draft'],
      relatedTopicIds: ['policy'],
      relatedEntityIds: [],
      sources: [],
      claims: [],
      status: 'draft',
      publicationStatus: 'draft',
      isTestArtifact: false,
    };

    const quarantinedArtifact: Story = {
      id: 'mock-quarantined-fixture',
      slug: 'mock-quarantined-fixture',
      title: 'Quarantined Test Fixture Story',
      summary: 'Test artifact that must be quarantined from discovery.',
      category: 'policy',
      author: 'CI Test',
      publishedAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      readingTime: 2,
      evidenceScore: 80,
      impactLevel: 'low',
      tags: ['fixture'],
      relatedTopicIds: ['policy'],
      relatedEntityIds: [],
      sources: [],
      claims: [],
      status: 'published',
      publicationStatus: 'published',
      isTestArtifact: true, // QUARANTINED
    };

    services.search.rebuild([draftStory, quarantinedArtifact], [], [], [], []);

    const searchDraft = services.search.search('Secret Unpublished Investigation Draft');
    expect(searchDraft.data).toHaveLength(0);

    const searchFixture = services.search.search('Quarantined Test Fixture Story');
    expect(searchFixture.data).toHaveLength(0);
  });

  it('Invar-08: Domain services in services/ must never import from components/ or app/', () => {
    const serviceFiles = getAllFiles('services').filter(
      (f) => !f.includes('__tests__') && !f.endsWith('.test.ts') && !f.endsWith('.spec.ts')
    );
    const violations: { file: string; target: string }[] = [];

    for (const f of serviceFiles) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (
          line.includes("from '@/components/") ||
          line.includes('from "@/components/') ||
          line.includes("from '@/app/") ||
          line.includes('from "@/app/')
        ) {
          violations.push({ file: f, target: line.trim() });
        }
      }
    }

    expect(violations, `Service layer imports violate ADR-0006 architecture boundaries: ${JSON.stringify(violations)}`).toHaveLength(0);
  });
});
