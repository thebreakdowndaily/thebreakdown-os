import { chromium } from 'playwright';
import path from 'path';

const viewports = [
  { name: 'mobile_375', width: 375, height: 667 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'mobile_412', width: 412, height: 915 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'desktop_1280', width: 1280, height: 800 },
  { name: 'desktop_1440', width: 1440, height: 900 },
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const imgPath = 'file:///' + path.resolve('public/images/stories/accountability-in-india.jpg').replace(/\\/g, '/');

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    
    // Set up the exact StoryHeroCanonical heroMedia markup
    const html = `
      <!DOCTYPE html>
      <html style="background:#0a0a0a; color:#f5f5f5; font-family:sans-serif; margin:0; padding:16px;">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          .container { max-width: 800px; margin: 0 auto; width: 100%; }
          .hero-media {
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: 1rem;
            overflow: hidden;
            border: 1px solid #262626;
            margin: 1.5rem 0;
            position: relative;
            background: #171717;
          }
          .hero-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .caption {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            padding: 1rem;
            font-size: 0.75rem;
            color: #d4d4d4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div style="color:#34d399; font-size:12px; font-weight:bold; letter-spacing:1px;">GOVERNANCE • INVESTIGATION</div>
            <h1 style="font-size:${vp.width < 640 ? '24px' : '36px'}; font-weight:900; margin:8px 0;">When Something Goes Wrong, Who Actually Answers?</h1>
            <p style="color:#a3a3a3; font-size:16px; line-height:1.5;">India has created one of the most layered oversight systems in any democracy...</p>
          </header>
          <div class="hero-media" id="heroMediaBox">
            <img id="heroImg" class="hero-img" src="${imgPath}" alt="The Machinery of Public Accountability in India" />
            <div class="caption">The Machinery of Accountability: Constitutional oversight, parliamentary audit trails, and institutional responsibility.</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      const box = document.getElementById('heroMediaBox').getBoundingClientRect();
      const img = document.getElementById('heroImg');
      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      return {
        boxWidth: Math.round(box.width),
        boxHeight: Math.round(box.height),
        aspectRatio: (box.width / box.height).toFixed(2),
        imgNaturalWidth: img.naturalWidth,
        imgNaturalHeight: img.naturalHeight,
        hasHorizontalScroll,
      };
    });

    console.log(`[Viewport ${vp.name} (${vp.width}x${vp.height})] Container: ${metrics.boxWidth}x${metrics.boxHeight} (${metrics.aspectRatio}:1) | Natural: ${metrics.imgNaturalWidth}x${metrics.imgNaturalHeight} | H-Scroll: ${metrics.hasHorizontalScroll ? 'FAIL' : 'OK'}`);
  }

  await browser.close();
  console.log('Visual Forensics check complete across all 6 viewports.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
