import fs from 'fs';

const BASE_URL = 'https://thebreakdown.in';

const routes = [
  { path: '/', type: 'homepage', expected_status: 200, expected_title_part: 'The Breakdown' },
  { path: '/stories', type: 'stories_index', expected_status: 200, expected_title_part: 'Stories' },
  { path: '/topics', type: 'topics_index', expected_status: 200, expected_title_part: 'Topics' },
  { path: '/topic/economy', type: 'topic', expected_status: 200, expected_title_part: 'Economy' },
  { path: '/topic/governance', type: 'topic', expected_status: 200, expected_title_part: 'Governance' },
  { path: '/topic/technology', type: 'topic', expected_status: 200, expected_title_part: 'Technology' },
  { path: '/entity/rbi', type: 'entity', expected_status: 200, expected_title_part: 'Reserve Bank of India' },
  { path: '/story/accountability-in-india', type: 'flagship_story', expected_status: 200, expected_title_part: 'The Machinery of Accountability' },
  { path: '/story/mgnrega-reform', type: 'story', expected_status: 200, expected_title_part: 'MGNREGA' },
  { path: '/story/semiconductor-pli', type: 'story', expected_status: 200, expected_title_part: 'Semiconductor' },
  { path: '/story/electoral-bonds', type: 'story', expected_status: 200, expected_title_part: 'Electoral Bonds' },
  { path: '/story/kashmir-the-first-test', type: 'story', expected_status: 200, expected_title_part: 'Kashmir' },
  { path: '/story/groundwater-depletion', type: 'story', expected_status: 200, expected_title_part: 'Groundwater' },
  { path: '/story/digital-payments-boom', type: 'story', expected_status: 200, expected_title_part: 'Digital Payments' },
  { path: '/sitemap.xml', type: 'sitemap', expected_status: 200, expected_title_part: 'xml' },
  { path: '/robots.txt', type: 'robots', expected_status: 200, expected_title_part: 'User-agent' },
  { path: '/feed.xml', type: 'rss', expected_status: 200, expected_title_part: 'xml' },
];

async function run() {
  const rows = [
    'route,type,expected_status,actual_status,expected_title,actual_title,canonical,hero,json_ld,critical_content,errors,status'
  ];

  for (const item of routes) {
    const fullUrl = BASE_URL + item.path;
    try {
      const res = await fetch(fullUrl, { cache: 'no-store' });
      const actual_status = res.status;
      const text = await res.text();

      let actual_title = '';
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) actual_title = titleMatch[1].replace(/,/g, ' ');

      let canonical = '';
      const canMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      if (canMatch) canonical = canMatch[1];

      let hero = 'N/A';
      const heroMatch = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']Hero[^"']*["']/i) ||
                        text.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (heroMatch) hero = heroMatch[1];

      const hasJsonLd = text.includes('application/ld+json') ? 'YES' : 'NO';
      
      let critical_content = 'PRESENT';
      if (text.length < 500) {
        critical_content = 'EMPTY_OR_SHORT';
      }

      let errors = 'NONE';
      if (text.includes('Internal Server Error') || text.includes('Application error')) {
        errors = 'SERVER_ERROR';
      }

      const pass = (actual_status === item.expected_status) && errors === 'NONE';
      const status = pass ? 'PASS' : 'FAIL';

      rows.push(`"${item.path}","${item.type}",${item.expected_status},${actual_status},"${item.expected_title_part}","${actual_title}","${canonical}","${hero}","${hasJsonLd}","${critical_content}","${errors}","${status}"`);
      console.log(`[${status}] ${item.path} (${actual_status}) - Title: ${actual_title.slice(0, 30)}...`);
    } catch (err) {
      console.error(`[ERROR] ${item.path}`, err);
      rows.push(`"${item.path}","${item.type}",${item.expected_status},0,"${item.expected_title_part}","ERROR","NONE","NONE","NO","FAIL","${err.message}","FAIL"`);
    }
  }

  fs.writeFileSync('LOOP_ROUTE_MATRIX.csv', rows.join('\n') + '\n', 'utf8');
  console.log('Saved LOOP_ROUTE_MATRIX.csv');
}

run();
