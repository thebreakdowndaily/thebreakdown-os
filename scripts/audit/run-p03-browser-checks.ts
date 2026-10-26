import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve('public/images/audit/p03_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface CheckResult {
  route: string;
  viewport: string;
  status: number;
  expectedStatus: number;
  heroImageSrc?: string;
  heroImageLoaded?: boolean;
  heroNaturalWidth?: number;
  heroNaturalHeight?: number;
  heroAlt?: string;
  overflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  consoleErrors: string[];
}

const viewports = [
  { name: 'Desktop (1440x900)', width: 1440, height: 900 },
  { name: 'Mobile (390x844)', width: 390, height: 844 },
];

const routes = [
  {
    path: '/story/accountability-in-india',
    expectedStatus: 200,
    expectedHeroSubstr: 'accountability-in-india.jpg',
    description: 'Published flagship investigation'
  },
  {
    path: '/preview/story/bcci-domestic-mandate-ranji-economics',
    expectedStatus: 200,
    expectedHeroSubstr: 'bcci-ranji-trophy.jpg',
    description: 'Editorial preview of remediated BCCI draft (Release Hold Active)'
  },
  {
    path: '/story/bcci-domestic-mandate-ranji-economics',
    expectedStatus: 404,
    expectedHeroSubstr: '',
    description: 'Public path for held BCCI story (must fail-closed with 404 until released)'
  },
  {
    path: '/evidence/src-bcci-retainership-2024',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Primary Evidence Dossier: Retainership 2024'
  },
  {
    path: '/evidence/src-bcci-test-incentive',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Primary Evidence Dossier: Test Incentive Scheme'
  },
  {
    path: '/evidence/src-bcci-domestic-remuneration',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Primary Evidence Dossier: Domestic Fee Schedule'
  },
  {
    path: '/evidence/src-bcci-tournament-regulations',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Primary Evidence Dossier: Tournament Regulations'
  },
  {
    path: '/evidence/src-bcci-ipl-auction-rules',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Primary Evidence Dossier: IPL Auction Regulations'
  },
  {
    path: '/',
    expectedStatus: 200,
    expectedHeroSubstr: '',
    description: 'Homepage'
  },
];

async function main() {
  console.log('Launching headless Chromium browser for P0.3 audit checks...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const results: CheckResult[] = [];

  for (const r of routes) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        // Ignore 404 expected errors on the held route
        if (msg.type() === 'error' && !msg.text().includes('404')) {
          consoleErrors.push(msg.text());
        }
      });

      const url = `http://localhost:3000${r.path}`;
      console.log(`Checking ${r.description} (${url}) on ${vp.name}...`);
      const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      const status = response ? response.status() : 0;

      await page.waitForTimeout(1000);

      // Overflow check
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      const overflow = scrollWidth > clientWidth + 1;

      // Hero image check
      let heroInfo: any = {};
      if (r.expectedHeroSubstr) {
        heroInfo = await page.evaluate((expectedSubstr) => {
          const imgs = Array.from(document.querySelectorAll('img'));
          const heroImg = imgs.find((img) => img.src.includes(expectedSubstr) || (img.closest('figure') && img.src.includes('.jpg')));
          if (!heroImg) return { found: false };
          return {
            found: true,
            src: heroImg.src,
            alt: heroImg.alt,
            complete: heroImg.complete,
            naturalWidth: heroImg.naturalWidth,
            naturalHeight: heroImg.naturalHeight,
          };
        }, r.expectedHeroSubstr);
      }

      // Save screenshot
      const safeSlug = r.path.replace(/[^a-z0-9]/gi, '_').replace(/^_+/, '') || 'home';
      const screenshotFilename = `${safeSlug}_${vp.width}x${vp.height}.png`;
      const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFilename);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.push({
        route: r.path,
        viewport: vp.name,
        status,
        expectedStatus: r.expectedStatus,
        heroImageSrc: heroInfo.src,
        heroImageLoaded: heroInfo.complete && heroInfo.naturalWidth > 0,
        heroNaturalWidth: heroInfo.naturalWidth,
        heroNaturalHeight: heroInfo.naturalHeight,
        heroAlt: heroInfo.alt,
        overflow,
        scrollWidth,
        clientWidth,
        consoleErrors,
      });

      await page.close();
    }
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('P0.3 BROWSER VERIFICATION AUDIT RESULTS');
  console.log('======================================================');
  let allPassed = true;

  for (const res of results) {
    const statusMatches = res.status === res.expectedStatus;
    const heroOk = !res.expectedHeroSubstr || res.heroImageLoaded === true;
    const isOk = statusMatches && !res.overflow && heroOk;
    if (!isOk) allPassed = false;

    console.log(`\nRoute: ${res.route} | Viewport: ${res.viewport}`);
    console.log(`  HTTP Status: ${res.status} (Expected: ${res.expectedStatus}) -> ${statusMatches ? 'PASS' : 'FAIL'}`);
    console.log(`  Horizontal Overflow: ${res.overflow ? 'FAIL' : 'PASS'} (scrollWidth: ${res.scrollWidth}, clientWidth: ${res.clientWidth})`);
    if (res.heroImageSrc) {
      console.log(`  Hero Image Src: ${res.heroImageSrc}`);
      console.log(`  Hero Image Loaded: ${res.heroImageLoaded ? 'YES' : 'NO'} (${res.heroNaturalWidth}x${res.heroNaturalHeight})`);
      console.log(`  Hero Alt Text: "${res.heroAlt}"`);
    }
    if (res.consoleErrors.length > 0) {
      console.log(`  Console Errors: ${res.consoleErrors.join(', ')}`);
    } else {
      console.log(`  Console Errors: None`);
    }
  }

  console.log('\n======================================================');
  console.log(`FINAL BROWSER VERIFICATION: ${allPassed ? 'ALL PASSED (100% OK)' : 'FAILED'}`);
  console.log('======================================================');
  if (!allPassed) process.exit(1);
}

main().catch((err) => {
  console.error('Browser QA check failed:', err);
  process.exit(1);
});
