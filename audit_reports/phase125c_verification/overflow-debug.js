const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/story/semiconductor-pli?mode=standard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  
  const overflow = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const results = [];
    
    // Find elements wider than viewport
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 2 || rect.left < -2) {
        results.push({
          tag: el.tagName,
          className: (el.className || '').toString().substring(0, 100),
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          left: Math.round(rect.left),
          text: el.textContent?.substring(0, 40),
        });
      }
    }
    return { bodyScrollWidth: body.scrollWidth, viewportWidth: window.innerWidth, overflowingElements: results.slice(0, 10) };
  });
  
  console.log('Overflow analysis:', JSON.stringify(overflow, null, 2));
  await browser.close();
})();
