import https from 'node:https';

const urls = [
  'https://thebreakdown.in/images/entities/who.jpg',
  'https://thebreakdown.in/images/entities/wto.jpg',
  'https://thebreakdown.in/images/entities/ministry-of-finance.jpg',
  'https://thebreakdown.in/images/og-default.jpg',
  'https://thebreakdown.in/images/og-home.jpg',
  'https://thebreakdown.in/images/stories/accountability-in-india.jpg',
  'https://thebreakdown.in/images/library/chapter-1/maps/map-kashmir-1947.svg',
  'https://thebreakdown.in/images/charts/semiconductor-capacity.png'
];

async function checkUrl(url: string): Promise<any> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const head = buf.subarray(0, 30).toString('utf8');
        const isHtml = head.includes('<html') || head.includes('<!DOCTYPE');
        const headerHex = buf.subarray(0, 4).toString('hex');
        resolve({
          url,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          size: buf.length,
          isHtml,
          headerHex
        });
      });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function main() {
  console.log('=== PRODUCTION LIVE VISUAL PROBES ===');
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(JSON.stringify(res));
  }
}

main().catch(console.error);
