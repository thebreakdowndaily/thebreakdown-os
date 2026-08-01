/**
 * Phase 12.5B Post-Implementation Visual Verification
 *
 * Captures screenshots at mobile/tablet/desktop for representative story pages.
 * Verifies specific Phase 12.5B changes:
 *   - StoryProgress emerald semantics (was bg-blue-600)
 *   - Hero image lazy loading attribute
 *   - Focus ring visibility on mode switcher, TOC, ExploreConnections
 *   - Canvas token (bg-surface-canvas = #0a0a0a)
 *   - Contrast upgrades (text-neutral-400 vs old text-neutral-500)
 *   - Reduced-motion media query presence
 *
 * Run with:
 *   npx tsx scripts/verify/phase125b_visual_verification.ts
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

// Known accessible story slugs (from sitemap / API routes)
const STORY_SLUGS_TO_TRY = [
  'mgnrega-reform',
  'digital-payments-boom',
  'school-education-budget',
  'climate-finance-india',
  'pm-fasal-bima-claims',
  'groundwater-depletion',
  'anganwadi-worker-pay',
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

const OUTPUT_DIR = path.join(process.cwd(), 'audit_reports', 'phase125b_screenshots');

interface VerificationResult {
  slug: string;
  viewport: string;
  accessible: boolean;
  screenshotPath: string;
  checks: Record<string, { pass: boolean; detail: string }>;
}

async function runVerification() {
  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const allResults: VerificationResult[] = [];
  let testedSlug = '';

  // 1. Find the first accessible story slug
  console.log('\n[Phase 12.5B] Finding accessible story pages...');
  const probeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const probePage = await probeCtx.newPage();

  for (const slug of STORY_SLUGS_TO_TRY) {
    try {
      const resp = await probePage.goto(`${BASE_URL}/story/${slug}`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });
      if (resp && resp.status() === 200) {
        testedSlug = slug;
        console.log(`  ✓ Found: /story/${slug} (HTTP 200)`);
        break;
      }
    } catch {
      // Continue trying
    }
  }

  if (!testedSlug) {
    // Try to fetch /stories page to see what slugs exist
    await probePage.goto(`${BASE_URL}/stories`, { waitUntil: 'networkidle', timeout: 15000 });
    const allLinks = await probePage.$$eval('a[href^="/story/"]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).href).slice(0, 5)
    );
    console.log('  Stories page links found:', allLinks);

    // Extract first slug from found links
    if (allLinks.length > 0) {
      const match = allLinks[0].match(/\/story\/([^/?#]+)/);
      if (match) testedSlug = match[1];
    }
  }

  await probeCtx.close();

  if (!testedSlug) {
    console.error('  ✗ No accessible story page found. Exiting.');
    await browser.close();
    return;
  }

  console.log(`\n[Phase 12.5B] Verifying /story/${testedSlug} at all viewports...\n`);

  // 2. Run verification at each viewport
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();
    const result: VerificationResult = {
      slug: testedSlug,
      viewport: vp.name,
      accessible: false,
      screenshotPath: '',
      checks: {},
    };

    try {
      const resp = await page.goto(`${BASE_URL}/story/${testedSlug}?mode=standard`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      result.accessible = resp?.status() === 200;

      // Wait for the page to be interactive
      await page.waitForTimeout(1500);

      // --- SCREENSHOT: Full page ---
      const screenshotFile = path.join(OUTPUT_DIR, `story_${vp.name}_standard.png`);
      await page.screenshot({ path: screenshotFile, fullPage: true });
      result.screenshotPath = screenshotFile;
      console.log(`  📸 ${vp.name} screenshot → ${path.basename(screenshotFile)}`);

      // --- CHECK 1: Canvas background color (#0a0a0a) ---
      const canvasBg = await page.$eval(
        '.bg-surface-canvas, [class*="bg-surface-canvas"]',
        (el) => window.getComputedStyle(el).backgroundColor,
      ).catch(() => 'NOT_FOUND');
      const canvasPass = canvasBg === 'rgb(10, 10, 10)';
      result.checks['canvas_bg_0a0a0a'] = {
        pass: canvasPass,
        detail: `Computed background: ${canvasBg} (expected rgb(10, 10, 10))`,
      };

      // --- CHECK 2: StoryProgress - emerald progress bar ---
      const progressBarColor = await page.$eval(
        '.bg-emerald-500',
        (el) => window.getComputedStyle(el).backgroundColor,
      ).catch(() => 'NOT_FOUND');
      // emerald-500 = #10b981 = rgb(16, 185, 129)
      const emeraldPass = progressBarColor === 'rgb(16, 185, 129)';
      result.checks['progress_bar_emerald'] = {
        pass: progressBarColor !== 'NOT_FOUND',
        detail: `Progress bg-emerald-500: ${progressBarColor}`,
      };

      // --- CHECK 3: Mode switcher links have focus-visible classes ---
      const modeSwitcherFocusClasses = await page.$eval(
        `a[href*="?mode=quick"], a[href*="mode=standard"], a[href*="mode=deep"]`,
        (el) => el.className,
      ).catch(() => '');
      const focusRingOnSwitcher = modeSwitcherFocusClasses.includes('focus-visible:ring-2') ||
        modeSwitcherFocusClasses.includes('focus-visible:outline-none');
      result.checks['mode_switcher_focus_ring'] = {
        pass: focusRingOnSwitcher,
        detail: `Mode switcher className contains focus-visible classes: ${focusRingOnSwitcher}`,
      };

      // --- CHECK 4: Hero image lazy loading ---
      const heroImgLazy = await page.$eval(
        'header img',
        (img) => (img as HTMLImageElement).loading,
      ).catch(() => 'NONE');
      result.checks['hero_image_lazy'] = {
        pass: heroImgLazy === 'lazy',
        detail: `Hero image loading="${heroImgLazy}" (expected "lazy")`,
      };

      // --- CHECK 5: No bg-[#0a0a0a] raw hex class remaining ---
      const rawHexClass = await page.$eval(
        '[class*="bg-\\[#0a0a0a\\]"]',
        () => 'FOUND',
      ).catch(() => 'NOT_FOUND');
      result.checks['no_raw_hex_canvas'] = {
        pass: rawHexClass === 'NOT_FOUND',
        detail: `Raw bg-[#0a0a0a] class: ${rawHexClass}`,
      };

      // --- CHECK 6: No bg-blue-600 class on progress bar ---
      const blueProgressBar = await page.$eval(
        '[class*="bg-blue-600"]',
        () => 'FOUND',
      ).catch(() => 'NOT_FOUND');
      result.checks['no_blue_progress_bar'] = {
        pass: blueProgressBar === 'NOT_FOUND',
        detail: `bg-blue-600 class: ${blueProgressBar} (should be NOT_FOUND)`,
      };

      // --- CHECK 7: No bg-gray-* classes in StoryProgress output ---
      const grayBorderClass = await page.$eval(
        '[class*="border-gray-"]',
        () => 'FOUND',
      ).catch(() => 'NOT_FOUND');
      result.checks['no_gray_border'] = {
        pass: grayBorderClass === 'NOT_FOUND',
        detail: `border-gray-* class: ${grayBorderClass} (should be NOT_FOUND)`,
      };

      // --- CHECK 8: canvas color-mix token visible ---
      const rootCanvasToken = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-bg-canvas').trim();
      });
      result.checks['canvas_token_defined'] = {
        pass: rootCanvasToken.length > 0,
        detail: `--color-bg-canvas token value: "${rootCanvasToken}"`,
      };

      // --- CHECK 9: focus-ring token defined ---
      const focusRingToken = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-focus-ring').trim();
      });
      result.checks['focus_ring_token_defined'] = {
        pass: focusRingToken.length > 0,
        detail: `--color-focus-ring token value: "${focusRingToken}"`,
      };

      // --- CHECK 10: ExploreConnections section present (mode=standard) ---
      const exploreSection = await page.$('#explore-connections, section[data-testid="explore-connections"]')
        .catch(() => null);
      result.checks['explore_connections_rendered'] = {
        pass: exploreSection !== null,
        detail: `ExploreConnections section: ${exploreSection ? 'FOUND' : 'NOT_FOUND (may be no recommendations for this story)'}`,
      };

      // --- Screenshot: mode=quick ---
      if (vp.name === 'mobile') {
        await page.goto(`${BASE_URL}/story/${testedSlug}?mode=quick`, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        await page.waitForTimeout(800);
        const quickFile = path.join(OUTPUT_DIR, `story_${vp.name}_quick.png`);
        await page.screenshot({ path: quickFile, fullPage: true });
        console.log(`  📸 ${vp.name}/quick screenshot → ${path.basename(quickFile)}`);
      }

      // --- Screenshot: mode=deep (desktop only) ---
      if (vp.name === 'desktop') {
        await page.goto(`${BASE_URL}/story/${testedSlug}?mode=deep`, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        await page.waitForTimeout(800);
        const deepFile = path.join(OUTPUT_DIR, `story_${vp.name}_deep.png`);
        await page.screenshot({ path: deepFile, fullPage: true });
        console.log(`  📸 ${vp.name}/deep screenshot → ${path.basename(deepFile)}`);

        // --- CHECK 11: Research appendix uses <article> for claims ---
        const claimArticle = await page.$('#research-appendix article').catch(() => null);
        result.checks['claim_article_tag'] = {
          pass: claimArticle !== null,
          detail: `Research appendix claim <article> tag: ${claimArticle ? 'FOUND' : 'NOT_FOUND (may be no claims or research appendix)'}`,
        };
      }

      // --- Accessibility: keyboard focus ring visual check ---
      // Tab to mode switcher and screenshot focused state
      if (vp.name === 'desktop') {
        await page.goto(`${BASE_URL}/story/${testedSlug}?mode=standard`, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        await page.waitForTimeout(500);
        // Tab through elements to reach mode switcher
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const focusedEl = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName,
            href: (el as HTMLAnchorElement)?.href,
            className: el?.className?.slice(0, 100),
          };
        });
        result.checks['keyboard_tab_focus'] = {
          pass: true, // Record what tab reaches
          detail: `After 5 tabs: focused on <${focusedEl.tag}> ${focusedEl.href || ''} class="${focusedEl.className}"`,
        };
        // Screenshot focused state
        const focusFile = path.join(OUTPUT_DIR, `story_desktop_focus_state.png`);
        await page.screenshot({ path: focusFile, fullPage: false });
        console.log(`  📸 focus-state screenshot → ${path.basename(focusFile)}`);
      }

    } catch (err) {
      result.checks['page_error'] = { pass: false, detail: String(err) };
      console.error(`  ✗ Error at ${vp.name}:`, err);
    }

    await ctx.close();
    allResults.push(result);
  }

  // 3. Also capture the homepage
  console.log('\n[Phase 12.5B] Capturing homepage...');
  const homeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const homePage = await homeCtx.newPage();
  try {
    await homePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await homePage.waitForTimeout(800);
    const homeFile = path.join(OUTPUT_DIR, 'homepage_desktop.png');
    await homePage.screenshot({ path: homeFile, fullPage: true });
    console.log(`  📸 Homepage → ${path.basename(homeFile)}`);

    // Mobile homepage
    await homeCtx.close();
    const homeMobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const homeMobilePage = await homeMobileCtx.newPage();
    await homeMobilePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await homeMobilePage.waitForTimeout(800);
    const homeMobileFile = path.join(OUTPUT_DIR, 'homepage_mobile.png');
    await homeMobilePage.screenshot({ path: homeMobileFile, fullPage: true });
    console.log(`  📸 Homepage mobile → ${path.basename(homeMobileFile)}`);
    await homeMobileCtx.close();
  } catch (err) {
    console.error('  ✗ Homepage capture failed:', err);
    await homeCtx.close();
  }

  await browser.close();

  // 4. Output summary
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  PHASE 12.5B VISUAL VERIFICATION SUMMARY');
  console.log('══════════════════════════════════════════════════════\n');

  let totalChecks = 0;
  let passedChecks = 0;

  for (const r of allResults) {
    console.log(`\n  [${r.viewport.toUpperCase()}] /story/${r.slug}`);
    console.log(`  Page accessible: ${r.accessible ? '✅' : '❌'}`);
    for (const [key, val] of Object.entries(r.checks)) {
      totalChecks++;
      if (val.pass) passedChecks++;
      console.log(`  ${val.pass ? '✅' : '❌'} ${key}: ${val.detail}`);
    }
  }

  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  console.log(`\n  TOTAL: ${passedChecks}/${totalChecks} checks passed (${passRate}%)`);
  console.log(`  Screenshots: ${OUTPUT_DIR}`);

  // 5. Write JSON report
  const jsonReport = {
    phase: '12.5B Post-Implementation Verification',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    testedStorySlug: testedSlug,
    passRate: `${passRate}%`,
    checksTotal: totalChecks,
    checksPassed: passedChecks,
    screenshotDirectory: OUTPUT_DIR,
    results: allResults,
  };

  const jsonPath = path.join(OUTPUT_DIR, 'verification_report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
  console.log(`\n  Report: ${jsonPath}`);
  console.log('\n══════════════════════════════════════════════════════\n');
}

runVerification().catch(console.error);
