import { bootstrapServices } from '../lib/bootstrap';
import { buildSearchPage } from '../features/search/view-model';

async function testSearch() {
  const services = bootstrapServices({ publicOnly: true });
  const queries = [
    { type: 'story', q: 'accountability' },
    { type: 'story', q: 'mgnrega' },
    { type: 'story', q: 'semiconductor' },
    { type: 'topic', q: 'economy' },
    { type: 'topic', q: 'technology' },
    { type: 'entity', q: 'rbi' },
    { type: 'entity', q: 'who' },
    { type: 'partial', q: 'elect' },
    { type: 'historical', q: 'nehru' },
  ];

  console.log('=== SEARCH PRECISION & RECALL TEST ===');
  for (const item of queries) {
    const vm = await buildSearchPage(services, item.q);
    console.log(`Query "${item.q}" (${item.type}): total=${vm.total}, spotlight=${vm.spotlight ? 'YES' : 'NO'}, results=${vm.results.length}`);
    if (vm.results.length > 0) {
      console.log(`   Top 3: ${vm.results.slice(0, 3).map(r => `[${r.type}] ${r.title}`).join(' | ')}`);
    }
  }
}

testSearch().catch(console.error);
