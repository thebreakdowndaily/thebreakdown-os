import https from 'node:https';
import crypto from 'node:crypto';

function fetchUrl(url: string): Promise<{
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- Probing Live Sitemaps & Robots ---');
  
  const urls = [
    'https://thebreakdown.in/sitemap.xml',
    'https://thebreakdown.in/news-sitemap.xml',
    'https://thebreakdown.in/robots.txt'
  ];

  for (const u of urls) {
    console.log(`\nFetching: ${u}`);
    const res = await fetchUrl(u);
    const hash = crypto.createHash('sha256').update(res.body).digest('hex');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length'] || res.body.length}`);
    console.log(`ETag: ${res.headers['etag']}`);
    console.log(`Last-Modified: ${res.headers['last-modified']}`);
    console.log(`Cache-Control: ${res.headers['cache-control']}`);
    console.log(`Vercel ID: ${res.headers['x-vercel-id']}`);
    console.log(`SHA256: ${hash}`);
    console.log(`Body preview (first 400 chars):\n${res.body.slice(0, 400)}`);
  }
}

run().catch(console.error);
