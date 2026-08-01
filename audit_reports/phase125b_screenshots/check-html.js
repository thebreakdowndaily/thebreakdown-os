const http = require('http');
http.get('http://localhost:3000/story/mgnrega-reform', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('progressbar in HTML:', d.includes('progressbar'));
    console.log('emerald-500 in HTML:', d.includes('emerald-500'));
    console.log('emerald in HTML:', d.includes('emerald'));
    console.log('blue-600 in HTML:', d.includes('blue-600'));
    console.log('loading=lazy in HTML:', d.includes('loading="lazy"'));
    console.log('Reading mode in HTML:', d.includes('Reading mode'));
    const idx = d.indexOf('Reading mode');
    if (idx > -1) console.log('Context around Reading mode:', d.substring(Math.max(0, idx - 200), idx + 200));
    
    // Check for StoryProgress rendered HTML
    const progressIdx = d.indexOf('progress');
    if (progressIdx > -1) console.log('Context around progress:', d.substring(Math.max(0, progressIdx - 100), progressIdx + 200));
    else console.log('No progress text found in SSR HTML');
  });
});
