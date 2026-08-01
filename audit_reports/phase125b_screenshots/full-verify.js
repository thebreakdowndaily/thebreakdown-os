const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname);

const SLUGS = [
  'mgnrega-reform',
  'ration-digitization',
  'ethanol-backlash',
  'ews-quota-upsc-investigation',
];

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (const slug of SLUGS) {
    results[slug] = {};
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      try {
        const resp = await page.goto(`${BASE}/story/${slug}`, { waitUntil: 'networkidle', timeout: 20000 });
        const status = resp.status();
        await page.waitForTimeout(1500);

        const fname = `${slug}_${vpName}.png`;
        await page.screenshot({ path: path.join(OUT, fname), fullPage: true });

        const emerald = await page.$$eval('[class*="emerald"]', els => els.length);
        const blue600 = await page.$$eval('[class*="blue-600"]', els => els.length);
        const heroLazy = await page.$$eval('img[loading="lazy"]', els => els.length);
        const readingDepth = await page.$('fieldset[aria-label="Reading depth"]') !== null;
        const headings = await page.$$eval('h1, h2, h3, h4', els => els.map(e => e.tagName + ': ' + e.textContent.trim().substring(0, 60)));
        const totalImgs = await page.$$eval('img', els => els.length);

        results[slug][vpName] = { status, emerald, blue600, heroLazy, totalImgs, readingDepth, headings };
        console.log(`✓ ${slug} ${vpName} | status=${status} | emerald=${emerald} | blue600=${blue600} | heroLazy=${heroLazy}/${totalImgs} | readingDepth=${readingDepth}`);
      } catch (e) {
        results[slug][vpName] = { error: e.message.substring(0, 100) };
        console.log(`✗ ${slug} ${vpName} | ERROR: ${e.message.substring(0, 100)}`);
      }
      await ctx.close();
    }
  }

  fs.writeFileSync(path.join(OUT, 'full-verification-report.json'), JSON.stringify(results, null, 2));
  console.log('\nReport saved to full-verification-report.json');
  await browser.close();
})();
