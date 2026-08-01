const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000/story/mgnrega-reform?mode=standard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const contrastIssues = await page.evaluate(() => {
    const results = [];
    // Check all text-neutral-500 elements
    document.querySelectorAll('[class*="text-neutral-500"]').forEach(el => {
      const s = window.getComputedStyle(el);
      const fontSize = parseFloat(s.fontSize);
      const fontWeight = parseInt(s.fontWeight) || 400;
      const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      results.push({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 50),
        fontSize: fontSize + 'px',
        fontWeight,
        color: s.color,
        bg: s.backgroundColor,
        isLargeText,
        requiredRatio: isLargeText ? '3:1' : '4.5:1',
        className: el.className.substring(0, 100),
      });
    });
    return results;
  });

  console.log('neutral-500 elements in story page:');
  contrastIssues.forEach(c => {
    console.log(`  ${c.tag} "${c.text}" — font: ${c.fontSize}/${c.fontWeight} — large: ${c.isLargeText} — need: ${c.requiredRatio}`);
  });

  await browser.close();
})();
