/**
 * ─── The Breakdown OS — Stories Registry Check ────────────────────────────────
 * Verifies the canonical stories registry (`stories/stories-registry.ts`) is
 * consistent with the filesystem:
 *
 *   1. Every registered story has a directory under `stories/<slug>/`.
 *   2. Every registered story directory contains a parseable `story.yaml`.
 *   3. The story.yaml slug matches the registry slug.
 *   4. No duplicate slugs across the stories directory.
 *   5. No orphan story directories (a story.yaml exists but is not registered).
 *   6. Season 1 registry entries are unique by week and chapter.
 *
 * Exits non-zero on any violation. Run with: npm run check:registry
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { load } from 'js-yaml';
import { STORY_REGISTRY } from '../stories/stories-registry';

const STORIES_DIR = path.join(__dirname, '..', 'stories');
const ALLOWED_NON_STORY_DIRS = new Set(['reference']);

// Pre-existing data condition (documented in docs/story-structure-phase0-audit.md):
// stories/kashmir-first-test is a legacy duplicate of stories/kashmir-the-first-test
// (the canonical slug used by the store and knowledge library). It has no production
// consumer. It is surfaced as a warning, not a hard failure, to avoid destroying a
// tracked working directory. Resolution requires an editorial decision to merge or
// remove the duplicate.
const KNOWN_LEGACY_DUPLICATES = new Set(['kashmir-first-test']);

interface StoryYamlShape {
  story?: {
    slug?: unknown;
    title?: unknown;
  };
  id?: unknown;
  title?: unknown;
  slug?: unknown;
}

const failures: string[] = [];
const warnings: string[] = [];

function fail(message: string): void {
  failures.push(message);
  console.error(`  [FAIL] ${message}`);
}

function warn(message: string): void {
  warnings.push(message);
  console.warn(`  [WARN] ${message}`);
}

function readStoryYaml(storyDir: string): { ok: boolean; slug?: string; error?: string } {
  const yamlPath = path.join(storiesDir, storyDir, 'story.yaml');
  if (!fs.existsSync(yamlPath)) {
    return { ok: false, error: `missing story.yaml` };
  }
  const raw = fs.readFileSync(yamlPath, 'utf8');
  let doc: StoryYamlShape;
  try {
    doc = load(raw) as StoryYamlShape;
  } catch (e) {
    return { ok: false, error: `story.yaml is not valid YAML: ${(e as Error).message}` };
  }
  if (typeof doc !== 'object' || doc === null) {
    return { ok: false, error: 'story.yaml is empty' };
  }
  const nested = doc.story;
  const slug = typeof nested?.slug === 'string' ? nested.slug : typeof doc.slug === 'string' ? doc.slug : typeof doc.id === 'string' ? doc.id : undefined;
  if (!slug) {
    return { ok: false, error: 'story.yaml has no slug (expected story.slug, slug, or id)' };
  }
  return { ok: true, slug };
}

const storiesDir = STORIES_DIR;
const dirEntries = fs.readdirSync(storiesDir, { withFileTypes: true });

const dirsWithYaml = new Map<string, string | undefined>(); // dirName -> yaml slug (undefined if parse failed)
const yamlSlugOwners = new Map<string, string>(); // yaml slug -> dirName

for (const entry of dirEntries) {
  if (!entry.isDirectory()) continue;
  if (ALLOWED_NON_STORY_DIRS.has(entry.name)) continue;

  const result = readStoryYaml(entry.name);
  if (!result.ok) {
    dirsWithYaml.set(entry.name, undefined);
    if (result.error !== 'missing story.yaml') {
      warn(`story dir "${entry.name}": ${result.error}`);
    }
    continue;
  }
  dirsWithYaml.set(entry.name, result.slug);
  if (yamlSlugOwners.has(result.slug!)) {
    fail(`duplicate story slug "${result.slug}" in directories "${yamlSlugOwners.get(result.slug)}" and "${entry.name}"`);
  } else {
    yamlSlugOwners.set(result.slug!, entry.name);
  }
}

console.log('--- Stories Registry Check ---');
console.log(`Registered stories: ${STORY_REGISTRY.length}`);
const storyDirsWithYaml = [...dirsWithYaml.entries()].filter(([, yamlSlug]) => yamlSlug !== undefined);
const storyDirsMissingYaml = [...dirsWithYaml.entries()].filter(([, yamlSlug]) => yamlSlug === undefined);
console.log(`Story directories with story.yaml: ${storyDirsWithYaml.length}`);
if (storyDirsMissingYaml.length > 0) {
  console.log(`Story directories missing story.yaml: ${storyDirsMissingYaml.length} (${storyDirsMissingYaml.map(([d]) => d).join(', ')})`);
}

// 1 & 2 & 3: registered entries must exist with valid matching yaml
for (const entry of STORY_REGISTRY) {
  if (!fs.existsSync(path.join(storiesDir, entry.slug))) {
    fail(`registered story "${entry.slug}" has no directory under stories/`);
    continue;
  }
  const result = readStoryYaml(entry.slug);
  if (!result.ok) {
    fail(`registered story "${entry.slug}": ${result.error}`);
    continue;
  }
  if (result.slug !== entry.slug) {
    fail(`registered story dir "${entry.slug}" contains story.yaml with mismatched slug "${result.slug}"`);
  }
}

// 5: orphan story directories (yaml exists but slug not registered)
for (const [dirName, yamlSlug] of dirsWithYaml.entries()) {
  if (!yamlSlug) continue;
  const registered = STORY_REGISTRY.some((e) => e.slug === yamlSlug);
  if (!registered) {
    if (KNOWN_LEGACY_DUPLICATES.has(dirName)) {
      warn(`story directory "${dirName}" (slug "${yamlSlug}") is a KNOWN legacy duplicate of the canonical "${yamlSlug.replace(/-first-test$/, '-the-first-test')}" story; pending editorial decision`);
    } else {
      fail(`orphan story directory "${dirName}" (slug "${yamlSlug}") is not registered in stories/stories-registry.ts`);
    }
  }
}

// 6: week/chapter uniqueness within season 1
const seenWeeks = new Set<number>();
const seenChapters = new Set<number>();
for (const entry of STORY_REGISTRY.filter((e) => e.season === 1)) {
  if (seenWeeks.has(entry.week)) fail(`duplicate week ${entry.week} in season 1 registry`);
  seenWeeks.add(entry.week);
  if (seenChapters.has(entry.chapter)) fail(`duplicate chapter ${entry.chapter} in season 1 registry`);
  seenChapters.add(entry.chapter);
}

// 4: registry internal duplicate slugs
const registrySlugs = new Set<string>();
for (const entry of STORY_REGISTRY) {
  if (registrySlugs.has(entry.slug)) fail(`duplicate slug "${entry.slug}" in registry`);
  registrySlugs.add(entry.slug);
}

console.log(`Failures: ${failures.length}, Warnings: ${warnings.length}`);

if (failures.length > 0) {
  console.error('\n❌ Stories Registry Check FAILED:');
  failures.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

console.log('\n✅ Stories Registry Check PASSED.');
