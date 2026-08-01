// scripts/audit/editorial/batch1Audit.ts
// Audit‑only script – enumerates public stories, checks required UI sections, and validates reading‑mode policies.
// No production changes are made.

import { resolveStory, getAllStoryAndChapterSlugs } from '../../../lib/story/resolver.ts';
import { isCanonicalStoryPublic } from '../../../lib/story/publication.ts';
import { bootstrapServices } from '../../../lib/bootstrap.ts';
import { seedAll } from '../../../lib/knowledge/knowledge-core.ts';
import { applyReadingModePolicy } from '../../../lib/story/reading-mode-policy.ts';
import { writeFileSync } from 'fs'; import { buildStoryPresentationModel } from '../../../lib/story/presentation-model.ts';
import { join } from 'path';

// Required UI sections – mirrors scripts/check-stories.ts
const requiredIds = ['hero', 'executive-summary', 'evidence', 'related-stories', 'author-box'];

function hasSection(id: string, story: any): boolean {
  switch (id) {
    case 'hero':
      return !!(
        story.headline ||
        story.summary ||
        story.heroImage ||
        story.publishedAt ||
        story.updatedAt ||
        story.readingTime ||
        story.author ||
        story.evidenceScore
      );
    case 'executive-summary':
      return !!(story.summary || (story.keyPoints && story.keyPoints.length > 0));
    case 'evidence':
      return !!(
        (story.claims && story.claims.length > 0) ||
        (story.sources && story.sources.length > 0) ||
        story.evidenceScore !== undefined
      );
    case 'related-stories':
      return !!(story.relatedStories && story.relatedStories.length > 0);
    case 'author-box':
      return !!(story.author && story.author.name);
    default:
      return false;
  }
}

async function runBatch1Audit() {
  console.log('--- Batch 1 editorial audit start ---');
  seedAll();
  // bootstrap with publicOnly to avoid loading non‑public heavy data
  const services = bootstrapServices({ publicOnly: true });

  const all = await getAllStoryAndChapterSlugs();
  const publicSlugs: string[] = [];

  // First pass: collect public story/chapter slugs
  for (const { slug } of all) {
    try {
      const resolution = await resolveStory(slug);
      if (resolution.type === 'not_found') continue;
      const isPublic = isCanonicalStoryPublic(resolution.canonicalStory);
      if (isPublic) publicSlugs.push(slug);
    } catch (_) {
      // ignore resolution errors – they will be reported in detailed audit later
    }
  }

  // Batch 1: take first N public items (e.g., 5) – adjustable as needed
  const BATCH_SIZE = 5;
  const batch = publicSlugs.slice(0, BATCH_SIZE);
  console.log(`Auditing ${batch.length} public stories/chapters (Batch 1).`);

  const auditResults: any[] = [];

  for (const slug of batch) {
    try {
      const resolution = await resolveStory(slug);
      const story = resolution.canonicalStory; // canonical object contains UI fields

      // Section completeness
      const missingSections = requiredIds.filter(id => !hasSection(id, story));

      // Reading‑mode policy validation – ensure the function runs without throwing
      let readingModePass = true;
      try {
        const presentation = buildStoryPresentationModel(
          resolution.canonicalStory,
          resolution.candidateTimelineEvents,
          resolution.relatedStories
        );
        applyReadingModePolicy(presentation, 'quick');
        applyReadingModePolicy(presentation, 'standard');
        applyReadingModePolicy(presentation, 'deep');
      } catch (e) {
        readingModePass = false;
      }

      auditResults.push({ slug, missingSections, readingModePass });
    } catch (e) {
      console.error(`Error auditing ${slug}:`, (e as Error).message);
      auditResults.push({ slug, error: (e as Error).message });
    }
  }

  const report = {
    totalPublic: publicSlugs.length,
    batchSize: BATCH_SIZE,
    auditedCount: auditResults.length,
    results: auditResults,
  };

  const outPath = join(__dirname, 'batch1_audit_report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log('Batch 1 audit report written to', outPath);
}

runBatch1Audit();
