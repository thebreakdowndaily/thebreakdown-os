import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'screenshots/loop-05');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const flagshipUrl = 'https://thebreakdown.in/story/accountability-in-india';

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

async function main() {
  console.log('Capturing Loop 05 Reader Journey Forensics across viewports...');
  const browser = await chromium.launch();
  const context = await browser.newContext();

  const manifest: Array<{ viewport: string; step: string; file: string; status: number }> = [];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    const res = await page.goto(flagshipUrl, { waitUntil: 'networkidle', timeout: 35000 });
    const status = res ? res.status() : 200;

    // Step 1: First screen
    const f1 = `flagship-step1-first-screen-${vp.name}.png`;
    await page.screenshot({ path: path.join(outDir, f1) });
    manifest.push({ viewport: vp.name, step: '1_first_screen', file: f1, status });

    // Step 2: TOC interaction (open details on mobile, observe rail on desktop)
    if (vp.width < 1024) {
      const summary = await page.$('details summary');
      if (summary) {
        await summary.click();
        await page.waitForTimeout(300);
      }
    }
    const f2 = `flagship-step2-toc-${vp.name}.png`;
    await page.screenshot({ path: path.join(outDir, f2) });
    manifest.push({ viewport: vp.name, step: '2_toc_interaction', file: f2, status });

    // Step 3: Middle story reading (scroll down to middle chapter)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.4);
    });
    await page.waitForTimeout(400);
    const f3 = `flagship-step3-middle-story-${vp.name}.png`;
    await page.screenshot({ path: path.join(outDir, f3) });
    manifest.push({ viewport: vp.name, step: '3_middle_story', file: f3, status });

    // Step 4: Evidence & Sources Appendix
    const appendix = await page.$('#research-appendix');
    if (appendix) {
      await appendix.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.75));
    }
    const f4 = `flagship-step4-sources-appendix-${vp.name}.png`;
    await page.screenshot({ path: path.join(outDir, f4) });
    manifest.push({ viewport: vp.name, step: '4_sources_appendix', file: f4, status });

    // Step 5: Related Stories & Footer
    const exploring = await page.$('#continue-exploring');
    if (exploring) {
      await exploring.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    const f5 = `flagship-step5-related-footer-${vp.name}.png`;
    await page.screenshot({ path: path.join(outDir, f5) });
    manifest.push({ viewport: vp.name, step: '5_related_footer', file: f5, status });

    await page.close();
    console.log(`Completed forensics for viewport: ${vp.name}`);
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Saved ${manifest.length} forensic captures in ${outDir}`);
}

main().catch(console.error);
