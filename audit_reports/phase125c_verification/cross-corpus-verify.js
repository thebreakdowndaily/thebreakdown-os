const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'audit_reports', 'phase125c_verification');

// Canonical published story slugs from the runtime data layer
const CANONICAL_STORIES = [
  'mgnrega-reform',
  'digital-payments-boom',
  'pm-fasal-bima-claims',
  'semiconductor-pli',
  'dpdp-bill',
  'rbi-repo-rate',
  'climate-finance',
  'education-budget',
  'groundwater-depletion',
  'ration-digitization',
  'anganwadi-icds',
  'supply-chain-shift',
  'ethanol-backlash',
  'ews-quota-upsc-investigation',
];

const MODES = ['quick', 'standard', 'deep'];
const VIEWPORTS = {
  '320px': { width: 320, height: 568 },
  '375px': { width: 375, height: 812 },
  '768px': { width: 768, height: 1024 },
  '1024px': { width: 1024, height: 768 },
  '1440px': { width: 1440, height: 900 },
};

async function verifyStory(page, slug, mode, vpName) {
  const url = `${BASE}/story/${slug}?mode=${mode}`;
  const result = { slug, mode, viewport: vpName, url };
  
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    result.httpStatus = resp.status();
    await page.waitForTimeout(800);
    
    if (result.httpStatus !== 200) {
      result.error = `HTTP ${result.httpStatus}`;
      return result;
    }

    // Structural checks
    const structure = await page.evaluate(() => {
      const body = document.body;
      const bodyWidth = body.scrollWidth;
      const viewportWidth = window.innerWidth;
      const hasHorizontalOverflow = bodyWidth > viewportWidth + 5;

      // Check for mode-specific content
      const quickBrief = document.getElementById('quick-brief');
      const orientation = document.querySelector('[class*="orientation"]') || document.getElementById('orientation');
      const narrativeSections = document.querySelectorAll('article section');
      const researchAppendix = document.getElementById('research-appendix');
      const timeline = document.getElementById('timeline');
      const progressBar = document.querySelector('[role="progressbar"]');
      const readingModeNav = document.querySelector('nav[aria-label="Reading mode"]');
      const activeModeLink = document.querySelector('nav[aria-label="Reading mode"] a[aria-current="page"]');
      const heroImg = document.querySelector('header img');
      const mainContent = document.getElementById('main-content');
      const skipLink = document.querySelector('a[href="#main-content"]');

      return {
        hasHorizontalOverflow,
        bodyWidth,
        viewportWidth,
        quickBriefPresent: !!quickBrief,
        orientationPresent: !!orientation,
        narrativeSectionCount: narrativeSections.length,
        researchAppendixPresent: !!researchAppendix,
        timelinePresent: !!timeline,
        progressBarPresent: !!progressBar,
        progressBarFill: progressBar?.querySelector('div')?.className || null,
        readingModeNavPresent: !!readingModeNav,
        activeModeLinkText: activeModeLink?.textContent?.trim() || null,
        activeModeLinkAriaCurrent: activeModeLink?.getAttribute('aria-current') || null,
        heroImgPresent: !!heroImg,
        heroImgFetchPriority: heroImg?.getAttribute('fetchpriority') || heroImg?.getAttribute('fetchPriority') || null,
        heroImgLoading: heroImg?.getAttribute('loading') || null,
        heroImgAlt: heroImg?.alt || null,
        mainContentPresent: !!mainContent,
        skipLinkPresent: !!skipLink,
        hasTablist: !!document.querySelector('[role="tablist"]'),
        hasTab: !!document.querySelector('[role="tab"]'),
      };
    });

    Object.assign(result, structure);
  } catch (e) {
    result.error = e.message.substring(0, 200);
  }
  return result;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  // Phase 1: Quick structural check across all stories × modes at desktop
  console.log('=== PHASE 1: Structural verification (all stories × modes, desktop) ===');
  const desktopCtx = await browser.newContext({ viewport: VIEWPORTS['1440px'] });
  const page = await desktopCtx.newPage();
  
  for (const slug of CANONICAL_STORIES) {
    for (const mode of MODES) {
      const result = await verifyStory(page, slug, mode, '1440px');
      allResults.push(result);
      
      const status = result.httpStatus === 200 ? '✅' : '❌';
      const modeMatch = result.activeModeLinkText ? 
        (result.activeModeLinkText.toLowerCase().includes(mode === 'quick' ? 'quick' : mode === 'deep' ? 'deep' : 'standard') ? '✅' : '❌') : '—';
      const overflow = result.hasHorizontalOverflow ? '❌ OVERFLOW' : '';
      
      console.log(`  ${status} ${slug} ${mode} | mode-link: ${modeMatch} | sections: ${result.narrativeSectionCount || 0} | progress: ${result.progressBarPresent ? '✅' : '❌'} | ${overflow}`);
    }
  }
  await desktopCtx.close();

  // Phase 2: Viewport verification on representative stories
  console.log('\n=== PHASE 2: Viewport verification (3 representative stories × 5 viewports) ===');
  const representativeStories = ['mgnrega-reform', 'ration-digitization', 'ews-quota-upsc-investigation'];
  
  for (const vpName of Object.keys(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vpName] });
    const p = await ctx.newPage();
    
    for (const slug of representativeStories) {
      for (const mode of MODES) {
        const result = await verifyStory(p, slug, mode, vpName);
        allResults.push(result);
        
        const overflow = result.hasHorizontalOverflow ? '❌ OVERFLOW' : '';
        const status = result.httpStatus === 200 ? '✅' : '❌';
        console.log(`  ${status} ${vpName} ${slug} ${mode} | overflow: ${result.hasHorizontalOverflow ? 'YES' : 'no'} | sections: ${result.narrativeSectionCount || 0}`);
      }
    }
    await ctx.close();
  }

  // Phase 3: Keyboard verification on 1 representative story
  console.log('\n=== PHASE 3: Keyboard verification (mgnrega-reform, desktop) ===');
  const kbCtx = await browser.newContext({ viewport: VIEWPORTS['1440px'] });
  const kbPage = await kbCtx.newPage();
  await kbPage.goto(`${BASE}/story/mgnrega-reform?mode=standard`, { waitUntil: 'networkidle', timeout: 15000 });
  await kbPage.waitForTimeout(1000);

  // Tab to skip link
  const skipLinkEl = await kbPage.$('a[href="#main-content"]');
  if (skipLinkEl) {
    await skipLinkEl.focus();
    await kbPage.keyboard.press('Enter');
    await kbPage.waitForTimeout(300);
    const focusTarget = await kbPage.evaluate(() => ({
      id: document.activeElement?.id,
      tag: document.activeElement?.tagName,
    }));
    console.log(`  Skip link → focus: <${focusTarget.tag} id="${focusTarget.id}"> ${focusTarget.id === 'main-content' ? '✅' : '❌'}`);
  }

  // Check mode navigation links
  const modeLinks = await kbPage.$$eval('nav[aria-label="Reading mode"] a', links =>
    links.map(l => ({
      text: l.textContent?.trim(),
      href: l.getAttribute('href'),
      ariaCurrent: l.getAttribute('aria-current'),
    }))
  );
  console.log(`  Mode links: ${modeLinks.length} found`);
  modeLinks.forEach(l => {
    const correct = l.ariaCurrent === 'page' ? '✅ active' : (l.ariaCurrent === null ? '  inactive' : '❌');
    console.log(`    "${l.text}" aria-current="${l.ariaCurrent}" ${correct}`);
  });

  // Verify no role="tablist" or role="tab"
  const hasTablist = await kbPage.$('[role="tablist"]');
  const hasTab = await kbPage.$('[role="tab"]');
  console.log(`  role="tablist" present: ${hasTablist ? '❌ YES (should be removed)' : '✅ NO'}`);
  console.log(`  role="tab" present: ${hasTab ? '❌ YES (should be removed)' : '✅ NO'}`);

  await kbCtx.close();

  // Write report
  const reportPath = path.join(OUT, 'structural-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  console.log(`\nReport written to ${reportPath}`);

  // Summary
  const total = allResults.length;
  const passed = allResults.filter(r => r.httpStatus === 200 && !r.error).length;
  const overflows = allResults.filter(r => r.hasHorizontalOverflow).length;
  const noProgress = allResults.filter(r => r.httpStatus === 200 && !r.progressBarPresent).length;
  const noNav = allResults.filter(r => r.httpStatus === 200 && !r.readingModeNavPresent).length;
  const hasTabs = allResults.filter(r => r.httpStatus === 200 && r.hasTablist).length;

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total verifications: ${total}`);
  console.log(`HTTP 200: ${passed}/${total}`);
  console.log(`Horizontal overflows: ${overflows}`);
  console.log(`Missing progress bar: ${noProgress}`);
  console.log(`Missing reading mode nav: ${noNav}`);
  console.log(`Residual role="tablist": ${hasTabs}`);

  await browser.close();
})();
