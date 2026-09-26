import fs from 'fs';
import path from 'path';
import { getStories, getInvestigations } from '../utils/data-layer/store';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';
import { matchImageToStoryContext } from '../lib/image-intelligence/context-matcher';
import { getManifestEntry } from '../lib/image-intelligence/manifest';

interface StoryAuditResult {
  slug: string;
  category: string;
  heroImage: string;
  fileValid: boolean;
  format: string;
  contextValid: boolean;
  matchType: string;
  reason: string;
  error?: string;
}

function runStoryImageGate(): boolean {
  console.log('========================================================================');
  console.log('THE BREAKDOWN OS — STORY IMAGE INTEGRITY & CONTEXT ALIGNMENT GATE');
  console.log('========================================================================\n');

  const stories = getStories({ pageSize: 1000 }).data;
  const results: StoryAuditResult[] = [];
  let hasFailures = false;

  console.log(`Auditing ${stories.length} stories...\n`);

  for (const story of stories) {
    const hero = story.heroImage;
    if (!hero) {
      results.push({
        slug: story.slug,
        category: story.category,
        heroImage: 'NONE',
        fileValid: false,
        format: 'missing',
        contextValid: false,
        matchType: 'MISMATCH',
        reason: 'No hero image defined',
        error: 'Missing heroImage property',
      });
      hasFailures = true;
      continue;
    }

    // 1. File & Format validation (MIME / Magic bytes)
    const fileValidation = validateImageFile(hero);

    // 2. Context & Needs validation
    const contextValidation = matchImageToStoryContext(
      hero,
      {
        slug: story.slug,
        headline: story.headline,
        category: story.category,
        tags: story.tags,
        primaryEntityId: story.primaryEntityId,
        relatedEntityIds: story.relatedEntities ? story.relatedEntities.map((e) => e.id) : [],
      },
      getManifestEntry
    );

    const isSuccess = fileValidation.isValid && contextValidation.isMatch;
    if (!isSuccess) {
      hasFailures = true;
    }

    results.push({
      slug: story.slug,
      category: story.category,
      heroImage: hero,
      fileValid: fileValidation.isValid,
      format: fileValidation.format,
      contextValid: contextValidation.isMatch,
      matchType: contextValidation.matchType,
      reason: contextValidation.reason,
      error: fileValidation.error,
    });
  }

  // Print results table
  console.log(
    'STATUS | ' +
      'STORY SLUG'.padEnd(30) +
      ' | ' +
      'CATEGORY'.padEnd(12) +
      ' | ' +
      'FORMAT'.padEnd(8) +
      ' | ' +
      'MATCH TYPE'.padEnd(26) +
      ' | ' +
      'IMAGE PATH'
  );
  console.log('-'.repeat(120));

  for (const r of results) {
    const statusTag = r.fileValid && r.contextValid ? ' PASS ' : ' FAIL ';
    console.log(
      `[${statusTag}] ` +
        r.slug.padEnd(30) +
        ' | ' +
        r.category.padEnd(12) +
        ' | ' +
        r.format.padEnd(8) +
        ' | ' +
        r.matchType.padEnd(26) +
        ' | ' +
        r.heroImage
    );
    if (!r.fileValid || !r.contextValid) {
      console.log(`       >>> ERROR: ${r.error || r.reason}`);
    }
  }

  console.log('\n------------------------------------------------------------------------');
  const passCount = results.filter((r) => r.fileValid && r.contextValid).length;
  const failCount = results.length - passCount;
  console.log(`TOTAL STORIES: ${results.length}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('------------------------------------------------------------------------\n');

  if (hasFailures) {
    console.error('❌ GATE FAILED: Some stories have invalid, corrupt, or context-mismatched images.');
    return false;
  }

  console.log('✅ GATE PASSED: All story images are verified on disk, valid format, and context-aligned.');
  return true;
}

const success = runStoryImageGate();
if (!success) {
  process.exit(1);
}
