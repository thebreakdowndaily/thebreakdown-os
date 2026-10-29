import fs from 'fs';
import path from 'path';
import { getStories, getInvestigations } from '../utils/data-layer/store';
import { validateImageFile, validateLocalAssetDetailed } from '../lib/image-intelligence/asset-validator';
import { matchImageToStoryContext } from '../lib/image-intelligence/context-matcher';
import { getManifestEntry } from '../lib/image-intelligence/manifest';
import { resolveStoryHeroImage } from '../lib/image-intelligence/service';
import { EDITORIAL_RELEASE_HOLDS } from '../lib/editorial/release-holds';

interface StoryAuditResult {
  slug: string;
  category: string;
  heroImage: string;
  fileValid: boolean;
  integrityValid: boolean;
  format: string;
  contextValid: boolean;
  matchType: string;
  reason: string;
  blockedByHold: boolean;
  expectedHold: boolean;
  fallback: boolean;
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
    // Resolve first. The gate must validate the image actually rendered by
    // public pages, not a raw database path that may be pending/rejected.
    const imageResolution = resolveStoryHeroImage(story);
    const hero = imageResolution.hero.src;

    // 1. File & Format validation (MIME / Magic bytes)
    const fileValidation = validateImageFile(hero);

    // 1b. Cryptographic digest parity for any explicitly approved asset.
    // The browser resolver cannot hash bytes at runtime, so CI validates the
    // exact on-disk bytes before an approved manifest asset can ship.
    const record = getManifestEntry(story.slug);
    let integrityValid = true;
    let integrityError: string | undefined;
    if (record && !imageResolution.hero.isFallback) {
      const localAsset = validateLocalAssetDetailed(hero);
      if (!localAsset.isPathContained || !localAsset.isValid) {
        integrityValid = false;
        integrityError = localAsset.error || 'Approved asset path or file is invalid.';
      } else {
        if (record.expectedDigest && record.expectedDigest !== localAsset.digest) {
          integrityValid = false;
          integrityError = `Expected digest ${record.expectedDigest} does not match file digest ${localAsset.digest}.`;
        }
        if (record.approvedDigest && record.approvedDigest !== localAsset.digest) {
          integrityValid = false;
          integrityError = `Approved digest ${record.approvedDigest} does not match file digest ${localAsset.digest}.`;
        }
        if (record.expectedDigest && record.approvedDigest && record.expectedDigest !== record.approvedDigest) {
          integrityValid = false;
          integrityError = 'Expected and approved digests disagree.';
        }
      }
    }

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

    const isSuccess = fileValidation.isValid && integrityValid && contextValidation.isMatch;
    const blockedByHold = Object.prototype.hasOwnProperty.call(EDITORIAL_RELEASE_HOLDS, story.slug);
    // A known held story may remain blocked while a valid safe placeholder is
    // rendered. Only that expected placeholder state is non-failing here.
    // Corrupt files and other failures remain CI failures even for held stories.
    const expectedHold = blockedByHold && imageResolution.hero.isFallback
      && fileValidation.isValid && !contextValidation.isMatch;
    if (!isSuccess && !expectedHold) {
      hasFailures = true;
    }

    results.push({
      slug: story.slug,
      category: story.category,
      heroImage: hero,
      fileValid: fileValidation.isValid,
      integrityValid,
      format: fileValidation.format,
      contextValid: contextValidation.isMatch,
      matchType: contextValidation.matchType,
      reason: imageResolution.hero.isFallback
        ? `Safe category placeholder used because the story-specific hero is not approved. ${contextValidation.reason}`
        : contextValidation.reason,
      blockedByHold,
      expectedHold,
      fallback: imageResolution.hero.isFallback,
      error: integrityError || fileValidation.error,
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
    const statusTag = r.blockedByHold ? ' HOLD ' : r.fallback ? ' FALLBACK ' : r.fileValid && r.integrityValid && r.contextValid ? ' PASS ' : ' FAIL ';
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
    if (!r.fileValid || !r.integrityValid || !r.contextValid || r.fallback) {
      const label = r.expectedHold ? 'EDITORIAL HOLD (not publishable)' : r.fallback ? 'SAFE PLACEHOLDER (manual image review required)' : 'ERROR';
      console.log(`       >>> ${label}: ${r.error || r.reason}`);
    }
  }

  console.log('\n------------------------------------------------------------------------');
  const passCount = results.filter((r) => r.fileValid && r.integrityValid && r.contextValid && !r.blockedByHold).length;
  const holdCount = results.filter((r) => r.blockedByHold).length;
  const fallbackCount = results.filter((r) => r.fallback && !r.blockedByHold).length;
  const failCount = results.filter((r) => !(r.fileValid && r.integrityValid && r.contextValid) && !r.expectedHold).length;
  console.log(`TOTAL STORIES: ${results.length}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`HELD (NOT PUBLISHABLE): ${holdCount}`);
  console.log(`SAFE PLACEHOLDERS (IMAGE REVIEW REQUIRED): ${fallbackCount}`);
  console.log(`FAILED (UNHELD): ${failCount}`);
  console.log('------------------------------------------------------------------------\n');

  if (hasFailures) {
    console.error('❌ GATE FAILED: Some stories have invalid, corrupt, or context-mismatched images.');
    return false;
  }

  console.log(`✅ IMAGE SAFETY CHECK PASSED FOR UNHELD STORIES. ${fallbackCount} story/stories use explicit safe placeholders pending image review; ${holdCount} held story/stories remain blocked and must not be published until the independent editorial gate passes.`);
  return true;
}

const success = runStoryImageGate();
if (!success) {
  process.exit(1);
}
