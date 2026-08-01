const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname);

const SLUGS_TO_CHECK = ['anganwadi-icds', 'ethanol-backlash', 'ews-quota-upsc-investigation'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (const slug of SLUGS_TO_CHECK) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}/story/${slug}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);

      const checks = {};

      // A1: StoryProgress renders
      checks.storyProgress = await page.$('fieldset[aria-label="Reading depth"]') !== null;

      // A2: Emerald classes
      checks.emeraldCount = (await page.$$eval('[class*="emerald"]', els => els.length));

      // A3: No blue-600
      checks.blue600Count = (await page.$$eval('[class*="blue-600"]', els => els.length));

      // A4: Hero image lazy loading
      checks.heroLazy = await page.$$eval('img[loading="lazy"]', els => els.length);
      checks.heroEager = await page.$$eval('img[loading="eager"]', els => els.length);
      checks.heroNone = await page.$$eval('img:not([loading])', els => els.length);

      // A5: ARIA labels
      const interactiveEls = await page.$$eval('button, a[href]', els => els.length);
      const withLabel = await page.$$eval('button, a[href]', els =>
        els.filter(e => e.getAttribute('aria-label') || e.textContent.trim()).length
      );
      checks.interactiveTotal = interactiveEls;
      checks.interactiveWithLabel = withLabel;

      // A6: Skip-to-content link
      checks.skipLink = await page.$('a[href="#main"], a[href="#content"], [class*="skip"]') !== null;

      // A7: Heading hierarchy
      checks.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
        els.map(e => e.tagName + ': ' + e.textContent.trim().substring(0, 60))
      );

      // A8: Low contrast text-neutral-500
      checks.lowContrastCount = (await page.$$eval('[class*="text-neutral-500"]', els => els.length));

      // A9: Reduced motion
      checks.reducedMotion = await page.evaluate(() => {
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.cssText && rule.cssText.includes('prefers-reduced-motion')) return true;
            }
          } catch(e) {}
        }
        return false;
      });

      // A10: Canvas token
      checks.canvasTokens = (await page.$$eval('[class*="#0a0a0a"], [class*="surface-canvas"]', els => els.length));

      // A11: Focus ring (check if focus-visible is present in stylesheets)
      checks.focusVisibleInCSS = await page.evaluate(() => {
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.cssText && rule.cssText.includes('focus-visible')) return true;
            }
          } catch(e) {}
        }
        return false;
      });

      // A12: ARIA landmarks
      checks.landmarks = await page.$$eval('[role="main"], main, nav, [role="navigation"], header, footer, [role="banner"], [role="contentinfo"]', els =>
        els.map(e => ({ tag: e.tagName, role: e.getAttribute('role'), label: e.getAttribute('aria-label') }))
      );

      // A13: Image alt text
      checks.imgsWithoutAlt = await page.$$eval('img:not([alt])', els => els.length);
      checks.imgsWithAlt = await page.$$eval('img[alt]', els => els.length);
      checks.imgsEmptyAlt = await page.$$eval('img[alt=""]', els => els.length);

      // A14: Color contrast via computed styles on key elements
      checks.contrastIssues = await page.$$eval('[class*="text-neutral-500"], [class*="text-surface-muted"]', els =>
        els.slice(0, 3).map(e => {
          const s = window.getComputedStyle(e);
          return { tag: e.tagName, color: s.color, bg: s.backgroundColor, text: e.textContent.trim().substring(0, 40) };
        })
      );

      // Full page screenshot
      await page.screenshot({ path: path.join(OUT, `${slug}_desktop_full.png`), fullPage: true });

      results[slug] = checks;
      console.log(`\n=== ${slug} ===`);
      console.log(`  storyProgress: ${checks.storyProgress ? '✅' : '❌'}`);
      console.log(`  emerald: ${checks.emeraldCount} elements`);
      console.log(`  blue-600: ${checks.blue600Count} (should be 0) ${checks.blue600Count === 0 ? '✅' : '❌'}`);
      console.log(`  hero: ${checks.heroLazy} lazy / ${checks.heroEager} eager / ${checks.heroNone} none`);
      console.log(`  aria: ${checks.interactiveWithLabel}/${checks.interactiveTotal} interactive labeled`);
      console.log(`  skipLink: ${checks.skipLink ? '✅' : '❌'}`);
      console.log(`  headings: ${checks.headings.length}`);
      console.log(`  lowContrast: ${checks.lowContrastCount}`);
      console.log(`  reducedMotion: ${checks.reducedMotion ? '✅' : '❌'}`);
      console.log(`  focusVisibleCSS: ${checks.focusVisibleInCSS ? '✅' : '❌'}`);
      console.log(`  imgAlt: ${checks.imgsWithAlt} with / ${checks.imgsWithoutAlt} without / ${checks.imgsEmptyAlt} empty`);
      console.log(`  landmarks: ${checks.landmarks.length}`);
      console.log(`  contrastIssues:`, JSON.stringify(checks.contrastIssues));
    } catch (e) {
      results[slug] = { error: e.message.substring(0, 200) };
      console.log(`\n=== ${slug} === ERROR: ${e.message.substring(0, 200)}`);
    }
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, 'new-stories-accessibility-report.json'), JSON.stringify(results, null, 2));
  console.log('\nReport saved.');
  await browser.close();
})();
