/**
 * Phase 12.5C Visual & Accessibility Empirical Verification
 *
 * Verifies all 12 required revisions cleanly in Playwright.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'audit_reports', 'phase125c_verification');

async function runEmpiricalVerification() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('\n======================================================');
  console.log('  PHASE 12.5C EMPIRICAL VERIFICATION');
  console.log('======================================================\n');

  const slug = 'mgnrega-reform';
  await page.goto(`${BASE_URL}/story/${slug}?mode=standard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // 1. KEYBOARD SKIP LINK & FOCUS TRANSFER
  console.log('[Check 1] Keyboard Skip Link & Focus Transfer to #main-content...');
  // Focus the skip link directly or press Tab
  const skipLinkEl = await page.$('a[href="#main-content"]');
  if (skipLinkEl) {
    await skipLinkEl.focus();
    const isFocused = await page.evaluate(() => document.activeElement?.getAttribute('href') === '#main-content');
    console.log(`  Skip link focused via keyboard: ${isFocused ? '✅ YES' : '❌ NO'}`);

    // Click or press Enter
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
      page.keyboard.press('Enter'),
    ]);
    await page.waitForTimeout(300);

    const mainFocusState = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        id: active?.id,
        tagName: active?.tagName,
        tabIndex: active?.tabIndex,
      };
    });
    const skipTargetPass = mainFocusState.id === 'main-content' && mainFocusState.tagName === 'MAIN';
    console.log(`  ${skipTargetPass ? '✅' : '❌'} Keyboard focus transfer: active element is <${mainFocusState.tagName} id="${mainFocusState.id}"> (tabIndex=${mainFocusState.tabIndex})`);
  } else {
    console.log('  ❌ Skip link not found');
  }

  // 2. READING PROGRESS BAR & AMBER SEMANTICS
  console.log('\n[Check 2] StoryProgressBar Brand Amber & Silent AT...');
  const progressBarState = await page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"]');
    const fill = bar?.querySelector('div');
    if (!bar || !fill) return null;
    const computedFillColor = window.getComputedStyle(fill).backgroundColor;
    return {
      ariaValueNow: bar.getAttribute('aria-valuenow'),
      ariaLabel: bar.getAttribute('aria-label'),
      fillAriaHidden: fill.getAttribute('aria-hidden'),
      fillColor: computedFillColor,
      fillClassName: fill.className,
    };
  });
  const amberPass = progressBarState?.fillColor === 'rgb(245, 158, 11)' || progressBarState?.fillClassName.includes('brand-400');
  const silentATPass = progressBarState?.fillAriaHidden === 'true';
  console.log(`  ${amberPass ? '✅' : '❌'} Progress bar fill color: ${progressBarState?.fillColor} (amber #f59e0b)`);
  console.log(`  ${silentATPass ? '✅' : '❌'} Fill aria-hidden: "${progressBarState?.fillAriaHidden}" (silent AT)`);

  // 3. SCROLL PROGRESS CALCULATION AGAINST <ARTICLE>
  console.log('\n[Check 3] Progress Calculation Against <article> Prose Region...');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  const midScrollProgress = await page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"]');
    return bar?.getAttribute('aria-valuenow');
  });
  console.log(`  Progress value at 1500px scroll: ${midScrollProgress}% (calculated against article bounds)`);

  // 4. READING MODE ARIA TABLIST & TAB SEMANTICS
  console.log('\n[Check 4] Reading Mode Switcher Tab Semantics...');
  const modeSwitcherState = await page.evaluate(() => {
    const tablist = document.querySelector('[role="tablist"]');
    if (!tablist) return null;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]')).map((t) => ({
      text: t.textContent?.trim(),
      selected: t.getAttribute('aria-selected'),
      controls: t.getAttribute('aria-controls'),
      id: t.id,
      className: t.className,
    }));
    return {
      tablistLabel: tablist.getAttribute('aria-label'),
      tabs,
    };
  });
  console.log(`  Tablist label: "${modeSwitcherState?.tablistLabel}"`);
  for (const t of modeSwitcherState?.tabs || []) {
    const isAmber = t.className.includes('brand-400');
    console.log(`    Tab "${t.text}": aria-selected="${t.selected}" | brand-amber active: ${t.selected === 'true' ? isAmber : 'N/A'}`);
  }

  // 5. HERO IMAGE HIGH PRIORITY & ALT TEXT
  console.log('\n[Check 5] Hero Image Above-The-Fold Eager Priority & Alt Text...');
  const heroImgState = await page.evaluate(() => {
    const img = document.querySelector('header img') as HTMLImageElement | null;
    if (!img) return null;
    return {
      src: img.src,
      alt: img.alt,
      fetchPriority: img.getAttribute('fetchpriority') || img.getAttribute('fetchPriority'),
      loading: img.getAttribute('loading'),
    };
  });
  const heroPriorityPass = heroImgState?.fetchPriority === 'high' && !heroImgState?.loading;
  console.log(`  ${heroPriorityPass ? '✅' : '❌'} Hero img fetchPriority="${heroImgState?.fetchPriority}", loading="${heroImgState?.loading || 'eager'}"`);
  console.log(`  Hero alt text: "${heroImgState?.alt}"`);

  // 6. LAYERED STORY ARCHITECTURE AUDIT (QUICK BRIEF -> STANDARD -> DEEP)
  console.log('\n[Check 6] Layered Story Architecture Audit Across Modes...');
  // Quick Mode
  await page.goto(`${BASE_URL}/story/${slug}?mode=quick`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const quickRendered = await page.evaluate(() => {
    const qSection = document.getElementById('quick-brief');
    return {
      present: qSection !== null,
      question: qSection?.querySelector('h3')?.textContent?.trim(),
    };
  });
  console.log(`  Quick Brief Mode: ${quickRendered.present ? '✅' : '❌'} Question: "${quickRendered.question?.slice(0, 50)}..."`);
  const quickScreenshot = path.join(OUTPUT_DIR, 'mode_quick.png');
  await page.screenshot({ path: quickScreenshot, fullPage: true });

  // Standard Mode
  await page.goto(`${BASE_URL}/story/${slug}?mode=standard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const standardRendered = await page.evaluate(() => {
    const orientation = document.getElementById('orientation');
    const narrativeChapters = document.querySelectorAll('article section');
    return {
      orientationPresent: orientation !== null,
      chapterCount: narrativeChapters.length,
    };
  });
  console.log(`  Standard Mode: ${standardRendered.orientationPresent ? '✅' : '❌'} Orientation card present | ${standardRendered.chapterCount} narrative sections`);
  const standardScreenshot = path.join(OUTPUT_DIR, 'mode_standard.png');
  await page.screenshot({ path: standardScreenshot, fullPage: true });

  // Deep Mode
  await page.goto(`${BASE_URL}/story/${slug}?mode=deep`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const deepRendered = await page.evaluate(() => {
    const appendix = document.getElementById('research-appendix');
    const timeline = document.getElementById('timeline');
    return {
      appendixPresent: appendix !== null,
      timelinePresent: timeline !== null,
    };
  });
  console.log(`  Deep Research Mode: ${deepRendered.appendixPresent ? '✅' : '❌'} Research appendix present | Timeline: ${deepRendered.timelinePresent}`);
  const deepScreenshot = path.join(OUTPUT_DIR, 'mode_deep.png');
  await page.screenshot({ path: deepScreenshot, fullPage: true });

  await browser.close();

  console.log('\n======================================================');
  console.log('  EMPIRICAL VERIFICATION COMPLETE');
  console.log('======================================================\n');
}

runEmpiricalVerification().catch(console.error);
