import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'iPhone SE (compact mobile)', width: 375, height: 667 },
  { name: 'iPhone 12/14/15 (standard mobile)', width: 390, height: 844 },
  { name: 'Pixel 7 (Android mobile)', width: 412, height: 915 },
  { name: 'iPad Mini (tablet)', width: 768, height: 1024 },
  { name: 'MacBook Air / Standard Laptop', width: 1280, height: 800 },
  { name: 'Desktop Display', width: 1440, height: 900 },
];

async function run() {
  console.log('========================================================================');
  console.log('LIVE PRODUCTION VIEWPORT FORENSICS: /story/accountability-in-india');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    
    try {
      const response = await page.goto('https://thebreakdown.in/story/accountability-in-india', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const status = response ? response.status() : 0;

      // Locate hero image
      const heroImg = page.locator('img[src*="accountability-in-india.jpg"]');
      const count = await heroImg.count();

      if (count === 0) {
        console.error(`❌ [${vp.name} (${vp.width}x${vp.height})] Hero image not found!`);
        allPassed = false;
        await page.close();
        continue;
      }

      const isVisible = await heroImg.first().isVisible();
      const naturalWidth = await heroImg.first().evaluate((img) => img.naturalWidth);
      const naturalHeight = await heroImg.first().evaluate((img) => img.naturalHeight);
      const boundingBox = await heroImg.first().boundingBox();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasHorizontalScroll = scrollWidth > clientWidth;

      const alt = await heroImg.first().getAttribute('alt');
      const renderedAspect = boundingBox ? (boundingBox.width / boundingBox.height).toFixed(2) : 'N/A';

      console.log(`[PASS] ${vp.name.padEnd(35)} | HTTP ${status} | Visible: ${isVisible} | Box: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)} (Aspect: ${renderedAspect}) | Natural: ${naturalWidth}x${naturalHeight} | Overflow: ${hasHorizontalScroll ? 'YES' : 'NO'}`);
      
      if (!isVisible || hasHorizontalScroll || naturalWidth === 0) {
        allPassed = false;
      }
    } catch (err) {
      console.error(`❌ [${vp.name}] Error:`, err.message);
      allPassed = false;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  if (allPassed) {
    console.log('\n✅ ALL 6 VIEWPORTS PASSED LIVE PRODUCTION VISUAL FORENSICS.');
  } else {
    console.error('\n❌ ONE OR MORE VIEWPORTS FAILED.');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
