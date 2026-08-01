/**
 * Phase 12.5D — Reader Experience Refinement & Editorial IA Read-Only Audit
 *
 * Captures comprehensive high-resolution screenshots across key reader surfaces:
 * 1. Story Pages (/story/mgnrega-reform, /story/digital-payments-boom) in Quick, Standard, Deep modes
 * 2. Homepage (/)
 * 3. Series / Collection (/series, /series/foundations-1947-1962)
 * 4. Topics (/topics, /topic/economy)
 * 5. Investigation (/investigation/namami-gange)
 * 6. The Fix (/fix, /fix/fix-mgnrega-reform)
 *
 * Captures Desktop (1280x900), Tablet (768x1024), and Mobile (375x812) viewports.
 * Strict READ-ONLY audit.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'audit_reports', 'phase125d_screenshots');

interface CaptureTarget {
  name: string;
  urlPath: string;
  viewports: Array<{ name: string; width: number; height: number }>;
}

const TARGETS: CaptureTarget[] = [
  {
    name: 'story_mgnrega_standard',
    urlPath: '/story/mgnrega-reform?mode=standard',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 },
    ],
  },
  {
    name: 'story_mgnrega_quick',
    urlPath: '/story/mgnrega-reform?mode=quick',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
      { name: 'mobile', width: 375, height: 812 },
    ],
  },
  {
    name: 'story_mgnrega_deep',
    urlPath: '/story/mgnrega-reform?mode=deep',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
    ],
  },
  {
    name: 'homepage',
    urlPath: '/',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
      { name: 'mobile', width: 375, height: 812 },
    ],
  },
  {
    name: 'series_index',
    urlPath: '/series',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
    ],
  },
  {
    name: 'series_collection',
    urlPath: '/series/foundations-1947-1962',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
    ],
  },
  {
    name: 'topic_economy',
    urlPath: '/topic/economy',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
      { name: 'mobile', width: 375, height: 812 },
    ],
  },
  {
    name: 'investigation_namami_gange',
    urlPath: '/investigation/namami-gange',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
    ],
  },
  {
    name: 'fix_mgnrega',
    urlPath: '/fix/fix-mgnrega-reform',
    viewports: [
      { name: 'desktop', width: 1280, height: 900 },
    ],
  },
];

async function runReadOnlyAudit() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n======================================================');
  console.log('  PHASE 12.5D — READ-ONLY BROWSER EXPERIENCE AUDIT');
  console.log('======================================================\n');

  const browser = await chromium.launch({ headless: true });
  const capturedManifest: Array<{ target: string; viewport: string; file: string; url: string }> = [];

  for (const target of TARGETS) {
    for (const vp of target.viewports) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();

      const fullUrl = `${BASE_URL}${target.urlPath}`;
      console.log(`[Capture] ${target.name} (${vp.name} ${vp.width}x${vp.height}) → ${target.urlPath}`);

      try {
        const resp = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 25000 });
        const status = resp?.status() || 0;

        if (status === 200) {
          await page.waitForTimeout(1000);
          const fileName = `${target.name}_${vp.name}.png`;
          const filePath = path.join(OUTPUT_DIR, fileName);

          await page.screenshot({ path: filePath, fullPage: true });
          console.log(`  📸 Saved screenshot: ${fileName} (HTTP ${status})`);

          capturedManifest.push({
            target: target.name,
            viewport: vp.name,
            file: filePath,
            url: fullUrl,
          });
        } else {
          console.log(`  ⚠️ Warning: ${target.urlPath} returned HTTP ${status}`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to capture ${target.urlPath}:`, err);
      }

      await ctx.close();
    }
  }

  await browser.close();

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(capturedManifest, null, 2));

  console.log('\n======================================================');
  console.log(`  AUDIT COMPLETE: ${capturedManifest.length} screenshots saved`);
  console.log(`  Output dir: ${OUTPUT_DIR}`);
  console.log('======================================================\n');
}

runReadOnlyAudit().catch(console.error);
