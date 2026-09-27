import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'screenshots/loop-04');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targets = [
  { name: 'homepage', url: 'https://thebreakdown.in/' },
  { name: 'stories', url: 'https://thebreakdown.in/stories' },
  { name: 'accountability-story', url: 'https://thebreakdown.in/story/accountability-in-india' },
  { name: 'mgnrega-story', url: 'https://thebreakdown.in/story/mgnrega-reform' },
  { name: 'entity-who', url: 'https://thebreakdown.in/entity/who' },
  { name: 'chapter-1', url: 'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance' }
];

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

async function main() {
  console.log('Capturing production screenshots...');
  const browser = await chromium.launch();
  const context = await browser.newContext();

  const manifest: Array<{ target: string; viewport: string; file: string; status: number }> = [];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const t of targets) {
      try {
        const res = await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 });
        const fileName = `${t.name}-${vp.name}.png`;
        const filePath = path.join(outDir, fileName);
        await page.screenshot({ path: filePath, fullPage: false });
        manifest.push({ target: t.name, viewport: vp.name, file: fileName, status: res ? res.status() : 200 });
        console.log(`Saved: ${fileName} (${res ? res.status() : 'OK'})`);
      } catch (err: any) {
        console.error(`Failed ${t.name} on ${vp.name}: ${err.message}`);
      }
    }
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Screenshot capture completed: ${manifest.length} captures recorded.`);
}

main().catch(console.error);
