const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000/story/mgnrega-reform?mode=standard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const details = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[class*="text-neutral-500"]').forEach(el => {
      const s = window.getComputedStyle(el);
      const path = [];
      let node = el;
      while (node && node !== document.body) {
        if (node.id) { path.unshift('#' + node.id); break; }
        if (node.className && typeof node.className === 'string') {
          const cls = node.className.split(' ').find(c => c.startsWith('text-') || c.startsWith('bg-') || c.startsWith('flex') || c.startsWith('space'));
          if (cls) path.unshift(cls);
        }
        node = node.parentElement;
      }
      results.push({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 60),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        bg: s.backgroundColor,
        path: path.slice(0, 5).join(' < '),
        className: el.className.substring(0, 120),
      });
    });
    return results;
  });

  details.forEach(d => {
    console.log(`\n${d.tag} "${d.text}"`);
    console.log(`  font: ${d.fontSize}/${d.fontWeight} | color: ${d.color} | bg: ${d.bg}`);
    console.log(`  path: ${d.path}`);
    console.log(`  class: ${d.className}`);
  });

  await browser.close();
})();
