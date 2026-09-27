async function probe() {
  console.log('--- PROBING PRODUCTION IMAGE ASSETS ---');
  const imgUrls = [
    'https://thebreakdown.in/images/stories/accountability-in-india.jpg',
    'https://thebreakdown.in/images/stories/accountability-in-india.webp',
    'https://thebreakdown.in/images/stories/accountability-in-india-og.jpg',
    'https://thebreakdown.in/images/stories/accountability-in-india-mobile.jpg'
  ];

  for (const url of imgUrls) {
    const res = await fetch(url);
    console.log(`URL: ${url}`);
    console.log(`  Status: ${res.status}`);
    console.log(`  Content-Type: ${res.headers.get('content-type')}`);
    console.log(`  Content-Length: ${res.headers.get('content-length')}`);
    console.log(`  ETag: ${res.headers.get('etag')}`);
  }

  console.log('\n--- PROBING STORY PAGE HTML ---');
  const storyUrl = 'https://thebreakdown.in/story/accountability-in-india';
  const storyRes = await fetch(storyUrl, { headers: { 'Cache-Control': 'no-cache' } });
  console.log(`URL: ${storyUrl}`);
  console.log(`  Status: ${storyRes.status}`);
  console.log(`  Content-Type: ${storyRes.headers.get('content-type')}`);
  
  const html = await storyRes.text();
  console.log(`  HTML length: ${html.length} bytes`);
  
  const hasJpg = html.includes('/images/stories/accountability-in-india.jpg');
  const hasSvgPlaceholder = html.includes('governance-placeholder.svg');
  console.log(`  Contains accountability-in-india.jpg: ${hasJpg}`);
  console.log(`  Contains governance-placeholder.svg: ${hasSvgPlaceholder}`);

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  console.log(`  OG Image: ${ogImageMatch ? ogImageMatch[1] : 'NONE'}`);

  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  console.log(`  Twitter Image: ${twitterImageMatch ? twitterImageMatch[1] : 'NONE'}`);

  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  console.log(`  Found ${imgMatches.length} <img> tags in page:`);
  for (const match of imgMatches) {
    if (match[1].includes('accountability') || match[1].includes('placeholder')) {
      console.log(`    src: ${match[1]}`);
    }
  }

  console.log('\n--- PROBING STORIES DIRECTORY HTML ---');
  const storiesRes = await fetch('https://thebreakdown.in/stories');
  const storiesHtml = await storiesRes.text();
  const storiesHasJpg = storiesHtml.includes('/images/stories/accountability-in-india.jpg');
  console.log(`  /stories listing contains accountability-in-india.jpg: ${storiesHasJpg}`);
}

probe().catch(console.error);
