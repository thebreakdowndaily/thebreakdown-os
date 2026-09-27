import https from 'node:https';

const routes = [
  'https://thebreakdown.in/',
  'https://thebreakdown.in/stories',
  'https://thebreakdown.in/story/accountability-in-india',
  'https://thebreakdown.in/story/mgnrega-reform',
  'https://thebreakdown.in/entity/who',
  'https://thebreakdown.in/entity/wto',
  'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance'
];

async function checkRoute(url: string): Promise<any> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        const ogImageMatch = data.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) ||
                             data.match(/<meta name=["']twitter:image["'] content=["']([^"']+)["']/i);
        const heroMatch = data.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        resolve({
          url,
          status: res.statusCode,
          ogImage: ogImageMatch ? ogImageMatch[1] : null,
          hasImg: !!heroMatch,
          firstImgSrc: heroMatch ? heroMatch[1] : null
        });
      });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function main() {
  console.log('=== PRODUCTION LIVE ROUTE PROBES ===');
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(JSON.stringify(res));
  }
}

main().catch(console.error);
