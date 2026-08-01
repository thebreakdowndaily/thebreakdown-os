const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'audit_reports', 'editorial', 'phase125d_screenshots');

const PAGES = [
  { slug: 'homepage', url: '/', name: 'Homepage' },
  { slug: 'founding-edition', url: '/founding-edition', name: 'Founding Edition' },
  { slug: 'methodology', url: '/methodology', name: 'Methodology' },
  { slug: 'editorial-constitution', url: '/editorial-constitution', name: 'Editorial Constitution' },
  { slug: 'trust', url: '/trust', name: 'Trust Dashboard' },
  { slug: 'newsletter', url: '/newsletter', name: 'Newsletter' },
  { slug: 'subscribe', url: '/subscribe', name: 'Subscribe' },
  { slug: 'about', url: '/about', name: 'About' },
  { slug: 'about-team', url: '/about/team', name: 'Team' },
  { slug: 'about-methodology', url: '/about/methodology', name: 'About Methodology' },
  { slug: 'about-contact', url: '/about/contact', name: 'Contact' },
  { slug: 'series', url: '/series', name: 'Knowledge Library' },
  { slug: 'stories', url: '/stories', name: 'Stories Index' },
  { slug: 'story-mgnrega', url: '/story/mgnrega-reform', name: 'Story (MGNREGA)' },
  { slug: 'story-ews', url: '/story/ews-quota-upsc-investigation', name: 'Story (EWS Quota)' },
  { slug: 'investigations', url: '/investigations', name: 'Investigations' },
  { slug: 'topics', url: '/topics', name: 'Topics Index' },
  { slug: 'topic-india-pak', url: '/topic/india-pakistan-relations', name: 'Topic (India-Pak)' },
  { slug: 'entities', url: '/entities', name: 'Entities Index' },
  { slug: 'entity-rbi', url: '/entity/reserve-bank-of-india', name: 'Entity (RBI)' },
  { slug: 'countries', url: '/countries', name: 'Countries Index' },
  { slug: 'fix', url: '/fix', name: 'The Fix Index' },
  { slug: 'data', url: '/data', name: 'Data Hub' },
  { slug: 'datasets', url: '/datasets', name: 'Datasets Index' },
  { slug: 'graph', url: '/graph', name: 'Knowledge Graph' },
  { slug: 'timeline', url: '/timeline', name: 'Global Timeline' },
  { slug: 'search', url: '/search?q=MGNREGA', name: 'Search' },
  { slug: '404', url: '/nonexistent-page', name: '404 Page' },
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile_375: { width: 375, height: 812 },
  mobile_768: { width: 768, height: 1024 },
};

async function captureAll() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    console.log(`\n=== ${vpName.toUpperCase()} (${vp.width}x${vp.height}) ===`);
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();

    for (const pg of PAGES) {
      const url = `${BASE}${pg.url}`;
      const screenshotPath = path.join(OUT, vpName, `${pg.slug}.png`);

      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        const status = resp.status();
        await page.waitForTimeout(1000);

        // Full-page screenshot
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Collect page metrics
        const metrics = await page.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          const bodyWidth = body.scrollWidth;
          const viewportWidth = window.innerWidth;
          const hasHorizontalOverflow = bodyWidth > viewportWidth + 5;

          // Heading hierarchy
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const headingHierarchy = headings.map(h => ({
            level: parseInt(h.tagName[1]),
            text: h.textContent?.trim().substring(0, 80),
          }));

          // Images without alt
          const imgs = Array.from(document.querySelectorAll('img'));
          const imgsNoAlt = imgs.filter(i => !i.alt && !i.getAttribute('aria-hidden')).length;

          // Focusable elements
          const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
          
          // Landmark regions
          const landmarks = {
            nav: document.querySelectorAll('nav, [role="navigation"]').length,
            main: document.querySelectorAll('main, [role="main"]').length,
            banner: document.querySelectorAll('header, [role="banner"]').length,
            contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
            search: document.querySelectorAll('[role="search"]').length,
          };

          // Skip links
          const skipLinks = document.querySelectorAll('a[href^="#"]');

          // Text contrast issues (neutral-500 at small sizes)
          const neutral500Small = [];
          document.querySelectorAll('[class*="text-neutral-500"]').forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize < 18) {
              neutral500Small.push({
                tag: el.tagName,
                text: el.textContent?.trim().substring(0, 40),
                fontSize: Math.round(fontSize),
              });
            }
          });

          // Touch target sizes
          const smallTouchTargets = [];
          document.querySelectorAll('a, button').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
              const text = el.textContent?.trim().substring(0, 30);
              if (text) {
                smallTouchTargets.push({
                  tag: el.tagName,
                  text,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                });
              }
            }
          });

          return {
            bodyWidth,
            viewportWidth,
            hasHorizontalOverflow,
            headingCount: headings.length,
            headingHierarchy: headingHierarchy.slice(0, 15),
            imgsTotal: imgs.length,
            imgsNoAlt,
            focusableCount: focusable.length,
            landmarks,
            skipLinksCount: skipLinks.length,
            neutral500Small: neutral500Small.slice(0, 5),
            smallTouchTargetsCount: smallTouchTargets.length,
            smallTouchTargets: smallTouchTargets.slice(0, 5),
          };
        });

        results.push({ ...pg, status, vpName, ...metrics });
        console.log(`  ${status === 200 ? '✅' : '⚠️ '} ${pg.name} (${status}) | h=${metrics.headingCount} imgs=${metrics.imgsTotal} overflow=${metrics.hasHorizontalOverflow} a11y-skip=${metrics.skipLinksCount} landmarks: nav=${metrics.landmarks.nav} main=${metrics.landmarks.main} footer=${metrics.landmarks.contentinfo}`);
      } catch (e) {
        results.push({ ...pg, status: 'error', vpName, error: e.message.substring(0, 100) });
        console.log(`  ❌ ${pg.name} ERROR: ${e.message.substring(0, 80)}`);
      }
    }
    await ctx.close();
  }

  // Write results
  const resultsPath = path.join(OUT, 'page-audit-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${resultsPath}`);

  // Summary
  const total = results.length;
  const ok = results.filter(r => r.status === 200).length;
  const errors = results.filter(r => r.status !== 200 && r.status !== 404);
  const overflows = results.filter(r => r.hasHorizontalOverflow);
  const noSkipLink = results.filter(r => r.skipLinksCount === 0 && r.status === 200);
  const noMainLandmark = results.filter(r => r.landmarks?.main === 0 && r.status === 200);
  const noNavLandmark = results.filter(r => r.landmarks?.nav === 0 && r.status === 200);
  const imgsNoAlt = results.filter(r => r.imgsNoAlt > 0);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total pages captured: ${total}`);
  console.log(`HTTP 200: ${ok}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Horizontal overflows: ${overflows.length}`);
  console.log(`Missing skip link: ${noSkipLink.length}`);
  console.log(`Missing main landmark: ${noMainLandmark.length}`);
  console.log(`Missing nav landmark: ${noNavLandmark.length}`);
  console.log(`Images without alt: ${imgsNoAlt.length}`);

  await browser.close();
}

captureAll().catch(console.error);
