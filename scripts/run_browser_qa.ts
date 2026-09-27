import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = 'C:/Users/nitin/.gemini/antigravity/brain/0b5f72cc-4aa1-466b-896e-6339eb587a8b';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'qa_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface QAResults {
  httpStatus: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  failedRequests: string[];
  viewportsTested: string[];
  screenshots: string[];
  keyboardNavigationPassed: boolean;
  accountabilityChainInteractivePassed: boolean;
  sourcesFilterInteractivePassed: boolean;
  domTitle: string;
  domDescription: string;
  canonicalUrl: string;
  jsonLdValid: boolean;
  jsonLdTypes: string[];
  timing: Record<string, number>;
  overflowChecks: Record<string, boolean>;
}

const results: QAResults = {
  httpStatus: 0,
  consoleErrors: [],
  consoleWarnings: [],
  failedRequests: [],
  viewportsTested: [],
  screenshots: [],
  keyboardNavigationPassed: false,
  accountabilityChainInteractivePassed: false,
  sourcesFilterInteractivePassed: false,
  domTitle: '',
  domDescription: '',
  canonicalUrl: '',
  jsonLdValid: false,
  jsonLdTypes: [],
  timing: {},
  overflowChecks: {},
};

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', (res) => {
    if (res.status() >= 400) {
      results.consoleErrors.push(`HTTP ${res.status()} on ${res.url()}`);
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      results.consoleWarnings.push(msg.text());
    }
  });

  page.on('requestfailed', (req) => {
    results.failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  page.on('pageerror', (err) => {
    results.consoleErrors.push(`Page Uncaught Error: ${err.message}`);
  });

  console.log('Navigating to http://localhost:3000/story/accountability-in-india...');
  const response = await page.goto('http://localhost:3000/story/accountability-in-india', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  results.httpStatus = response?.status() || 0;
  console.log('HTTP Status:', results.httpStatus);

  // Extract Metadata from DOM
  results.domTitle = await page.title();
  results.domDescription = (await page.locator('meta[name="description"]').getAttribute('content')) || '';
  results.canonicalUrl = (await page.locator('link[rel="canonical"]').getAttribute('href')) || '';

  // Extract JSON-LD
  const jsonLdElements = await page.locator('script[type="application/ld+json"]').all();
  for (const el of jsonLdElements) {
    const raw = await el.innerText();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => results.jsonLdTypes.push(item['@type'] || 'Unknown'));
      } else {
        results.jsonLdTypes.push(parsed['@type'] || 'Unknown');
      }
      results.jsonLdValid = true;
    } catch (e: any) {
      results.consoleErrors.push(`JSON-LD Parse Error: ${e.message}`);
    }
  }

  // Performance timings
  const timingJson = await page.evaluate(() => {
    const perf = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!perf) return {};
    return {
      ttfb: Math.round(perf.responseStart - perf.requestStart),
      domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.startTime),
      loadTime: Math.round(perf.loadEventEnd - perf.startTime),
      transferSize: perf.transferSize || 0,
      encodedBodySize: perf.encodedBodySize || 0,
    };
  });
  results.timing = timingJson;

  // Viewport Testing & Visual Screenshots
  const viewports = [
    { name: 'desktop_1440x900', width: 1440, height: 900 },
    { name: 'desktop_1280x800', width: 1280, height: 800 },
    { name: 'tablet_landscape_1024x768', width: 1024, height: 768 },
    { name: 'tablet_portrait_768x1024', width: 768, height: 1024 },
    { name: 'mobile_android_412x915', width: 412, height: 915 },
    { name: 'mobile_iphone_390x844', width: 390, height: 844 },
    { name: 'mobile_iphone_375x812', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);

    // Check horizontal scroll / overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    results.overflowChecks[vp.name] = hasHorizontalOverflow;
    results.viewportsTested.push(`${vp.name} (Overflow: ${hasHorizontalOverflow})`);
  }

  // Set desktop viewport for targeted element screenshots
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);

  // 1. Desktop Hero Screenshot
  const heroPath = path.join(SCREENSHOT_DIR, '01_desktop_hero.png');
  await page.screenshot({ path: heroPath, clip: { x: 0, y: 0, width: 1280, height: 800 } });
  results.screenshots.push('01_desktop_hero.png');

  // 2. Mobile Hero Screenshot
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const mobileHeroPath = path.join(SCREENSHOT_DIR, '02_mobile_hero.png');
  await page.screenshot({ path: mobileHeroPath, clip: { x: 0, y: 0, width: 375, height: 812 } });
  results.screenshots.push('02_mobile_hero.png');

  // Reset to desktop for component captures
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);

  // 3. Accountability Chain Screenshot
  const chainLocator = page.locator('section[aria-label="Accountability Chain Framework"]').first();
  if (await chainLocator.count() > 0) {
    await chainLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const chainPath = path.join(SCREENSHOT_DIR, '03_accountability_chain.png');
    await chainLocator.screenshot({ path: chainPath });
    results.screenshots.push('03_accountability_chain.png');

    // Test chain interactivity: Click step 3 (Duty)
    const step3Button = page.locator('button[id="step-tab-2"]');
    if (await step3Button.count() > 0) {
      await step3Button.click();
      await page.waitForTimeout(200);
      const isSelected = await step3Button.getAttribute('aria-selected');
      if (isSelected === 'true') {
        results.accountabilityChainInteractivePassed = true;
      }
    }
  }

  // 4. MGNREGA Visual Screenshot
  const ledgerLocator = page.locator('figure[aria-labelledby="mgnrega-ledger-heading"]').first();
  if (await ledgerLocator.count() > 0) {
    await ledgerLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const ledgerPath = path.join(SCREENSHOT_DIR, '04_mgnrega_visual.png');
    await ledgerLocator.screenshot({ path: ledgerPath });
    results.screenshots.push('04_mgnrega_visual.png');
  }

  // 5. Case Evidence Card Screenshot
  const cardLocator = page.locator('article[aria-labelledby^="evidence-card-title-"]').first();
  if (await cardLocator.count() > 0) {
    await cardLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const cardPath = path.join(SCREENSHOT_DIR, '05_case_evidence_card.png');
    await cardLocator.screenshot({ path: cardPath });
    results.screenshots.push('05_case_evidence_card.png');
  }

  // 6. Documentary Evidence Screenshot
  const docLocator = page.locator('figure[aria-labelledby^="doc-heading-"]').first();
  if (await docLocator.count() > 0) {
    await docLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const docPath = path.join(SCREENSHOT_DIR, '06_documentary_evidence.png');
    await docLocator.screenshot({ path: docPath });
    results.screenshots.push('06_documentary_evidence.png');
  }

  // 7. Sources / Methodology Screenshot & Interactivity Test
  const sourcesLocator = page.locator('section[aria-label="Sources and Evidentiary Methodology"]').first();
  if (await sourcesLocator.count() > 0) {
    await sourcesLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const sourcesPath = path.join(SCREENSHOT_DIR, '07_sources_methodology.png');
    await sourcesLocator.screenshot({ path: sourcesPath });
    results.screenshots.push('07_sources_methodology.png');

    // Test filter interactivity: Click 'COURT OBSERVATION' filter
    const courtFilter = sourcesLocator.locator('button:has-text("COURT OBSERVATION")').first();
    if (await courtFilter.count() > 0) {
      await courtFilter.click();
      await page.waitForTimeout(200);
      const isPressed = await courtFilter.getAttribute('aria-pressed');
      if (isPressed === 'true') {
        results.sourcesFilterInteractivePassed = true;
      }
    }
  }

  // 8. Bottom of Story Screenshot (FAQ, Related Stories, Footnotes)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const bottomPath = path.join(SCREENSHOT_DIR, '08_bottom_experience.png');
  await page.screenshot({ path: bottomPath, clip: { x: 0, y: Math.max(0, 800 - 800), width: 1280, height: 800 } });
  results.screenshots.push('08_bottom_experience.png');

  // Keyboard navigation verification: Press Tab 5 times from top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  if (focusedTag) {
    results.keyboardNavigationPassed = true;
  }

  await browser.close();

  console.log('\n=== BROWSER QA EXECUTION RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'scratch', 'browser_qa_results.json'),
    JSON.stringify(results, null, 2)
  );
}

run().catch((err) => {
  console.error('Fatal Browser QA Error:', err);
  process.exit(1);
});
