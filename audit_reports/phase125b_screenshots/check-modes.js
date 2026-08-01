const http = require('http');
const modes = ['quick', 'standard', 'deep'];
let done = 0;
modes.forEach(mode => {
  http.get(`http://localhost:3000/story/mgnrega-reform?mode=${mode}`, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      const ids = [...d.matchAll(/id=['"]([^'"]+)['"]/g)].map(m => m[1]);
      console.log(`\n=== mode=${mode} | status=${r.statusCode} | length=${d.length} ===`);
      console.log('IDs found:', ids.join(', '));
      console.log('has <article>:', d.includes('<article'));
      console.log('has "quick-brief":', d.includes('quick-brief'));
      console.log('has "orientation":', d.includes('orientation'));
      console.log('has "research-appendix":', d.includes('research-appendix'));
      console.log('has "timeline":', d.includes('timeline'));
      console.log('has role="progressbar":', d.includes('role="progressbar"'));
      console.log('has role="tablist":', d.includes('role="tablist"'));
      console.log('has "#main-content":', d.includes('id="main-content"'));
      console.log('has skip link:', d.includes('skip') || d.includes('Skip'));
      console.log('has fetchPriority:', d.includes('fetchPriority') || d.includes('fetchpriority'));
      if (++done === modes.length) process.exit(0);
    });
  });
});
