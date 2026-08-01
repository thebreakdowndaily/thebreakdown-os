const http = require('http');
const slugs = ['mgnrega-reform', 'ration-digitization', 'dpdp-bill', 'ethanol-backlash', 'ews-quota-upsc-investigation', 'supply-chain-shift', 'anganwadi-icds', 'digital-payments-boom', 'pm-fasal-bima-claims', 'semiconductor-pli', 'rbi-repo-rate', 'climate-finance', 'education-budget', 'groundwater-depletion'];
let done = 0;
slugs.forEach(slug => {
  http.get('http://localhost:3000/story/' + slug, r => {
    console.log(slug + ': ' + r.statusCode);
    r.resume();
    if (++done === slugs.length) process.exit(0);
  }).on('error', e => {
    console.log(slug + ': ERROR ' + e.message);
    if (++done === slugs.length) process.exit(0);
  });
});
