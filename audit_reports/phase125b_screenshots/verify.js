const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname);
const SLUGS = ['mgnrega-reform', 'ration-digitization', 'dpdp-bill', 'climate-finance'];
const VIEWPORTS = [
  { name: 'mobile', w: 375, h: 812 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'desktop', w: 1280, h: 900 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const slug of SLUGS) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      const page = await ctx.newPage();
      const url = `${BASE}/story/${slug}`;
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

        const file = `${slug}_${vp.name}.png`;
        await page.screenshot({ path: path.join(OUT, file), fullPage: false });

        // CHECK 1: StoryProgress emerald semantics
        const progressBar = await page.$('[role="progressbar"]');
        let progressCheck = { pass: false, detail: 'no progressbar found' };
        if (progressBar) {
          const barInner = await progressBar.$('div');
          if (barInner) {
            const classes = await barInner.getAttribute('class');
            const hasEmerald = classes && classes.includes('emerald');
            const hasBlue = classes && classes.includes('blue');
            progressCheck = {
              pass: hasEmerald && !hasBlue,
              detail: `inner div classes: "${classes}" | emerald=${hasEmerald} blue=${hasBlue}`,
            };
          }
        }

        // CHECK 2: Hero image lazy loading
        const heroImg = await page.$('img[loading="lazy"]');
        let heroCheck = { pass: false, detail: 'no lazy img found' };
        if (heroImg) {
          const loading = await heroImg.getAttribute('loading');
          heroCheck = { pass: loading === 'lazy', detail: `loading="${loading}"` };
        }

        // CHECK 3: Any hero img at all
        const anyHeroImg = await page.$('header img, .hero img, [class*="hero"] img');
        let anyHeroDetail = 'none';
        if (anyHeroImg) {
          anyHeroDetail = await anyHeroImg.getAttribute('loading') || 'no loading attr';
        }

        // CHECK 4: Focus ring on interactive elements
        const focusables = await page.$$('button, a[href], [tabindex]');
        const focusCheck = { pass: focusables.length > 0, detail: `${focusables.length} focusable elements` };

        // CHECK 5: Text contrast - check for text-neutral-500 (low contrast)
        const lowContrast = await page.$$eval('[class*="text-neutral-500"]', els => els.length);
        const goodContrast = await page.$$eval('[class*="text-neutral-400"]', els => els.length);

        results.push({
          slug, viewport: vp.name, file,
          progress: progressCheck,
          heroImg: heroCheck,
          anyHeroImg: anyHeroDetail,
          focusables: focusCheck,
          contrast: { lowContrast, goodContrast },
        });

        console.log(`✓ ${slug} ${vp.name} | progress: ${progressCheck.pass ? 'PASS' : 'FAIL'} (${progressCheck.detail}) | hero: ${heroCheck.pass ? 'PASS' : 'FAIL'} (${heroCheck.detail}) | anyHero: ${anyHeroDetail} | contrast: ${goodContrast} good / ${lowContrast} low`);
      } catch (e) {
        console.log(`✗ ${slug} ${vp.name} ERROR: ${e.message}`);
        results.push({ slug, viewport: vp.name, error: e.message });
      }
      await ctx.close();
    }
  }

  // Full-page screenshot of one story for detailed inspection
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/story/mgnrega-reform`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'mgnrega-reform_fullpage_desktop.png'), fullPage: true });
  console.log('✓ Full-page screenshot saved');
  await ctx.close();

  // Write JSON report
  fs.writeFileSync(path.join(OUT, 'verification-report.json'), JSON.stringify(results, null, 2));
  console.log(`\nReport written to ${path.join(OUT, 'verification-report.json')}`);
  
  await browser.close();
})();
