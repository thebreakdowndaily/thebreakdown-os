const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // Desktop context for full checks
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // --- PAGE 1: mgnrega-reform ---
  await page.goto(`${BASE}/story/mgnrega-reform`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const checks1 = {};

  // A1: StoryProgress renders (Reading mode toggle)
  checks1.storyProgress_renders = await page.$eval('fieldset[aria-label="Reading depth"]', el => ({
    pass: true, detail: 'Reading depth fieldset found',
  })).catch(() => ({ pass: false, detail: 'Reading depth fieldset NOT found' }));

  // A2: Emerald classes on progress-related elements
  checks1.emerald_semantics = await page.$$eval('[class*="emerald"]', els => ({
    pass: els.length > 0,
    detail: `${els.length} elements with emerald classes`,
    classes: els.slice(0, 5).map(e => e.className.substring(0, 100)),
  }));

  // A3: No blue-600 anywhere (old color)
  checks1.no_blue_600 = await page.$$eval('[class*="blue-600"]', els => ({
    pass: els.length === 0,
    detail: `${els.length} elements with blue-600`,
  }));

  // A4: Hero image lazy loading
  checks1.hero_lazy = await page.$$eval('img', imgs => {
    const lazy = imgs.filter(i => i.getAttribute('loading') === 'lazy');
    const eager = imgs.filter(i => i.getAttribute('loading') === 'eager');
    const none = imgs.filter(i => !i.getAttribute('loading'));
    return { pass: lazy.length > 0, lazy: lazy.length, eager: eager.length, none: none.length };
  });

  // A5: ARIA labels on interactive elements
  checks1.aria_labels = await page.$$eval('button, a[href]', els => {
    const withLabel = els.filter(e => e.getAttribute('aria-label') || e.textContent.trim());
    return { pass: withLabel.length === els.length, total: els.length, withLabel: withLabel.length };
  });

  // A6: Focus ring styles
  checks1.focus_styles = await page.$$eval('button, a[href]', els => {
    const withFocus = els.filter(e => {
      const style = window.getComputedStyle(e);
      return style.outlineStyle !== 'none' || e.className.includes('focus-visible') || e.className.includes('focus:');
    });
    return { total: els.length, withFocusStyles: withFocus.length };
  });

  // A7: Skip-to-content link
  checks1.skip_to_content = await page.$('a[href="#main"], a[href="#content"], [class*="skip"]')
    ? { pass: true, detail: 'skip link found' }
    : { pass: false, detail: 'no skip-to-content link' };

  // A8: Heading hierarchy
  checks1.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
    els.map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 60) }))
  );

  // A9: Low contrast text (text-neutral-500 on dark bg)
  checks1.low_contrast = await page.$$eval('[class*="text-neutral-500"]', els => ({
    count: els.length,
    elements: els.slice(0, 5).map(e => ({
      tag: e.tagName,
      text: e.textContent.trim().substring(0, 50),
      className: e.className.substring(0, 80),
    })),
  }));

  // A10: Canvas token (bg-[#0a0a0a] or bg-surface-canvas)
  checks1.canvas_token = await page.$$eval('[class*="#0a0a0a"], [class*="surface-canvas"]', els => ({
    count: els.length,
  }));

  // A11: Reduced motion
  checks1.reduced_motion = await page.$eval('style, link[rel="stylesheet"]', () => {
    const sheets = Array.from(document.styleSheets);
    let hasReducedMotion = false;
    for (const sheet of sheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText && rule.cssText.includes('prefers-reduced-motion')) {
            hasReducedMotion = true;
            break;
          }
        }
      } catch(e) {}
    }
    return { pass: hasReducedMotion };
  }).catch(() => ({ pass: false, detail: 'could not check' }));

  // Full page screenshot for manual review
  await page.screenshot({ path: path.join(OUT, 'mgnrega-reform_desktop_full.png'), fullPage: true });

  results.mgnrega_reform = checks1;
  
  // --- PAGE 2: ration-digitization (newly published) ---
  await page.goto(`${BASE}/story/ration-digitization`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'ration-digitization_desktop_full.png'), fullPage: true });

  const checks2 = {};
  checks2.hero_lazy = await page.$$eval('img', imgs => {
    const lazy = imgs.filter(i => i.getAttribute('loading') === 'lazy');
    return { pass: lazy.length > 0, lazy: lazy.length };
  });
  checks2.emerald_semantics = await page.$$eval('[class*="emerald"]', els => ({
    pass: els.length > 0,
    detail: `${els.length} elements with emerald classes`,
  }));
  checks2.low_contrast = await page.$$eval('[class*="text-neutral-500"]', els => ({
    count: els.length,
  }));
  results.ration_digitization = checks2;

  // --- PAGE 3: mobile viewport of mgnrega ---
  await ctx.close();
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(`${BASE}/story/mgnrega-reform`, { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(OUT, 'mgnrega-reform_mobile_top.png'), fullPage: false });
  
  // Scroll down and capture mid-page
  await mobilePage.evaluate(() => window.scrollTo(0, 1200));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(OUT, 'mgnrega-reform_mobile_mid.png'), fullPage: false });
  await mobileCtx.close();

  // Write report
  fs.writeFileSync(path.join(OUT, 'accessibility-report.json'), JSON.stringify(results, null, 2));
  console.log('Accessibility report written');
  
  // Print summary
  for (const [page, checks] of Object.entries(results)) {
    console.log(`\n=== ${page} ===`);
    for (const [name, check] of Object.entries(checks)) {
      const status = check.pass === undefined ? 'ℹ️' : check.pass ? '✅' : '❌';
      console.log(`  ${status} ${name}: ${JSON.stringify(check.detail || check).substring(0, 120)}`);
    }
  }

  await browser.close();
})();
