import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories } from '../utils/data-layer/store';
import { apiStoryToCanonical } from '../lib/bootstrap';
import { getManifestEntry, type VerifiedImageRecord } from '../lib/image-intelligence/manifest';
import { resolveStoryHeroImage } from '../lib/image-intelligence/service';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';
import {
  detectImageQualityIssues,
  validateImageQualityBaseline,
  type ImageQualityException,
  type ImageQualityRecord,
} from '../lib/image-intelligence/quality-audit';

interface ImageQualityBaseline {
  version: number;
  generatedAt: string;
  policy: string;
  exceptions: ImageQualityException[];
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function sha256ForPublicAsset(assetPath: string): string {
  const relative = path.posix.normalize(assetPath.startsWith('/') ? assetPath.slice(1) : assetPath);
  if (!relative || relative === '.' || relative.startsWith('../') || path.isAbsolute(relative)) {
    throw new Error(`Unsafe local asset path: ${assetPath}`);
  }

  const fullPath = path.join(process.cwd(), 'public', relative);
  return crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
}

function issueLine(issue: { kind: string; slugs: string[]; assets: string[] }): string {
  return `kind=${issue.kind} | stories=${issue.slugs.join(',')} | assets=${issue.assets.join(',')}`;
}

function runPublicStoryImageQualityAudit(): void {
  console.log('========================================================================');
  console.log('THE BREAKDOWN OS — PUBLIC STORY IMAGE QUALITY GATE');
  console.log('Technical file integrity and editorial image quality are separate checks.');
  console.log('========================================================================');

  const baselinePath = path.join(process.cwd(), 'data', 'image-quality-baseline.json');
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as ImageQualityBaseline;
  if (!Array.isArray(baseline.exceptions)) {
    throw new Error('Image quality baseline is missing its exceptions array.');
  }

  const publicStories = getPublicStories({ pageSize: 1000 }).data;
  const qualityRecords: ImageQualityRecord[] = [];
  const technicalFailures: Array<{ slug: string; assetPath: string; error: string }> = [];
  const auditDetails: Array<Record<string, unknown>> = [];

  for (const apiStory of publicStories) {
    const canonicalStory = apiStoryToCanonical(apiStory);
    const resolved = resolveStoryHeroImage(canonicalStory);
    const assetPath = resolved.hero.src;
    const manifest = getManifestEntry(apiStory.slug) as
      | (VerifiedImageRecord & { sourceUrl?: string })
      | null;
    const fileValidation = validateImageFile(assetPath);

    if (!fileValidation.isValid) {
      technicalFailures.push({
        slug: apiStory.slug,
        assetPath,
        error: fileValidation.error || 'Resolved hero failed technical file validation.',
      });
    }

    let sha256 = '';
    if (fileValidation.isValid) {
      try {
        sha256 = sha256ForPublicAsset(assetPath);
      } catch (error) {
        technicalFailures.push({
          slug: apiStory.slug,
          assetPath,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const sourceUrl = manifest?.sourceUrl;
    const sourceUrlValid = isHttpsUrl(sourceUrl);
    const manifestComplete = Boolean(
      manifest &&
      manifest.provenance?.trim() &&
      manifest.license &&
      manifest.description?.trim() &&
      sourceUrlValid
    );
    const isPlaceholder =
      manifest?.assetType === 'branded-placeholder' ||
      assetPath.includes('/images/placeholders/');

    qualityRecords.push({
      slug: apiStory.slug,
      assetPath,
      sha256,
      hasManifest: Boolean(manifest),
      manifestMatchesResolvedAsset: Boolean(manifest && manifest.approvedImage === assetPath),
      manifestComplete,
      isPlaceholder,
      publicationStatus: canonicalStory.publicationStatus || 'unknown',
      manifestProvenance: manifest?.provenance || '',
      manifestLicense: manifest?.license || '',
      manifestSourceUrl: sourceUrl || '',
      resolutionType: resolved.hero.type,
      isFallback: resolved.hero.isFallback,
    });

    auditDetails.push({
      slug: apiStory.slug,
      headline: apiStory.headline,
      publicationStatus: canonicalStory.publicationStatus || 'unknown',
      resolvedHero: assetPath,
      technicalFileValid: fileValidation.isValid,
      technicalFormat: fileValidation.format,
      technicalSizeBytes: fileValidation.sizeBytes,
      resolutionType: resolved.hero.type,
      resolverFallback: resolved.hero.isFallback,
      manifestApproved: Boolean(manifest && manifest.approvedImage === assetPath),
      manifestProvenance: manifest?.provenance || null,
      manifestLicense: manifest?.license || null,
      manifestSourceUrl: sourceUrl || null,
      manifestSourceUrlValid: sourceUrlValid,
      placeholder: isPlaceholder,
    });
  }

  const issues = detectImageQualityIssues(qualityRecords);
  const today = new Date().toISOString().slice(0, 10);
  const disposition = validateImageQualityBaseline(issues, baseline.exceptions, today);

  console.log(`Public stories audited: ${publicStories.length}`);
  const technicalFailureSlugs = new Set(technicalFailures.map((failure) => failure.slug));
  console.log(`Resolved images with valid file format/existence: ${publicStories.length - technicalFailureSlugs.size}/${publicStories.length}`);
  console.log(`Public images using generic placeholders: ${qualityRecords.filter((r) => r.isPlaceholder).length}`);
  console.log(`Public images without an individually matching manifest: ${qualityRecords.filter((r) => !r.hasManifest || !r.manifestMatchesResolvedAsset).length}`);
  console.log(`Public images without a verifiable HTTPS source URL: ${qualityRecords.filter((r) => !isHttpsUrl(r.manifestSourceUrl)).length}`);
  console.log(`Quality findings: ${issues.length}; exact legacy exceptions matched: ${disposition.approvedLegacy.length}; unapproved findings: ${disposition.unapproved.length}`);

  console.log('--- Per-story resolved image audit (JSON) ---');
  for (const detail of auditDetails) {
    console.log(JSON.stringify({ type: 'PUBLIC_STORY_IMAGE', ...detail }));
  }

  console.log('--- Matched legacy findings (allowed temporarily; not quality-approved) ---');
  for (const { issue, exception } of disposition.approvedLegacy) {
    console.log(`[LEGACY EXCEPTION ${exception.id}; expires ${exception.expiresAt}] ${issueLine(issue)} | reason=${exception.reason} | owner=${exception.owner} | evidence=${exception.evidence}`);
  }

  console.log('--- Unapproved findings (must be fixed before this gate passes) ---');
  for (const issue of disposition.unapproved) console.error(`[UNAPPROVED] ${issueLine(issue)}`);

  console.log('--- Technical asset failures ---');
  for (const failure of technicalFailures) {
    console.error(`[TECHNICAL FAILURE] slug=${failure.slug} | asset=${failure.assetPath} | error=${failure.error}`);
  }
  for (const exception of disposition.expired) {
    console.error(`[EXPIRED EXCEPTION ${exception.id}] ${issueLine(exception)} | expired=${exception.expiresAt}`);
  }
  for (const exception of disposition.stale) {
    console.error(`[STALE EXCEPTION ${exception.id}] ${issueLine(exception)} | exception no longer matches a current finding; remove it after review.`);
  }
  for (const exception of disposition.invalidExceptions) {
    console.error(`[INVALID EXCEPTION ${exception.id || '(missing id)'}] ${issueLine(exception)} | a unique ID, reason, owner, evidence URL, and valid expiry date are required.`);
  }

  const failed =
    technicalFailures.length > 0 ||
    disposition.unapproved.length > 0 ||
    disposition.expired.length > 0 ||
    disposition.stale.length > 0 ||
    disposition.invalidExceptions.length > 0;

  console.log('========================================================================');
  console.log(failed
    ? 'IMAGE QUALITY GATE FAILED — fix new findings or renew/reconcile legacy exceptions explicitly.'
    : 'IMAGE QUALITY GATE PASSED — all known defects are explicitly recorded as temporary exceptions; this does not mean they are editorially acceptable.');
  console.log('========================================================================');

  if (failed) process.exitCode = 1;
}

try {
  runPublicStoryImageQualityAudit();
} catch (error) {
  console.error('[IMAGE QUALITY GATE ERROR]', error);
  process.exitCode = 1;
}
