import { buildEntity } from '../utils/website-builder';
import type { PageSpec } from '../utils/types';
import { mockPersonEntity, mockOrganizationEntity } from './mock-data';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // Test 1: buildEntity returns valid PageSpec for person
  try {
    const page: PageSpec = buildEntity(mockPersonEntity);
    assert(page.type === 'entity', 'Person entity type is "entity"');
    assert(page.slug === mockPersonEntity.slug, 'Person slug matches');
    assert(page.template === 'entity', 'Person template is "entity"');
    assert(page.layout === 'entity-layout', 'Person layout is "entity-layout"');
  } catch (e) {
    console.error('  FAIL: Person entity basic structure threw exception', e);
    failed++;
  }

  // Test 2: buildEntity returns valid PageSpec for organization
  try {
    const page: PageSpec = buildEntity(mockOrganizationEntity);
    assert(page.type === 'entity', 'Org entity type is "entity"');
    assert(page.slug === mockOrganizationEntity.slug, 'Org slug matches');
    assert(page.template === 'entity', 'Org template is "entity"');
  } catch (e) {
    console.error('  FAIL: Org entity basic structure threw exception', e);
    failed++;
  }

  // Test 3: Entity sections include new intelligence sections
  try {
    const page: PageSpec = buildEntity(mockPersonEntity);
    const sectionIds = page.sections.map(s => s.id);
    assert(sectionIds.includes('entity-hero'), 'entity-hero section present');
    assert(sectionIds.includes('quick-facts'), 'quick-facts section present');
    assert(sectionIds.includes('entity-timeline'), 'entity-timeline section present');
    assert(sectionIds.includes('entity-statistics'), 'entity-statistics section present');
    assert(sectionIds.includes('entity-related-stories'), 'entity-related-stories section present');
    assert(sectionIds.includes('entity-related-entities'), 'entity-related-entities section present');
    assert(sectionIds.includes('entity-faq'), 'entity-faq section present');
    assert(sectionIds.includes('entity-sources'), 'entity-sources section present');
  } catch (e) {
    console.error('  FAIL: Entity sections check threw exception', e);
    failed++;
  }

  // Test 4: Person SEO generation
  try {
    const page: PageSpec = buildEntity(mockPersonEntity);
    assert(page.seo.title === `${mockPersonEntity.name} — Person Profile — The Breakdown`, 'Person SEO title is correct');
    assert(page.seo.description === mockPersonEntity.description.substring(0, 160), 'Person SEO description matches');
    assert(page.seo.canonical === `https://thebreakdown.in/entity/${mockPersonEntity.slug}`, 'Person canonical URL is correct');
    assert(page.seo.ogType === 'profile', 'Person OG type is "profile"');
    assert(page.seo.ogImage === mockPersonEntity.image, 'Person OG image matches');
    assert(page.seo.keywords === [mockPersonEntity.name, ...(mockPersonEntity.aliases || [])].join(', '), 'Person keywords include aliases');
  } catch (e) {
    console.error('  FAIL: Person SEO check threw exception', e);
    failed++;
  }

  // Test 5: Organization SEO generation
  try {
    const page: PageSpec = buildEntity(mockOrganizationEntity);
    assert(page.seo.title === `${mockOrganizationEntity.name} — Organization Profile — The Breakdown`, 'Org SEO title is correct');
    assert(page.seo.description === mockOrganizationEntity.description.substring(0, 160), 'Org SEO description matches');
    assert(page.seo.ogType === 'profile', 'Org OG type is "profile"');
    assert(page.seo.keywords === [mockOrganizationEntity.name, ...(mockOrganizationEntity.aliases || [])].join(', '), 'Org keywords include aliases');
  } catch (e) {
    console.error('  FAIL: Organization SEO check threw exception', e);
    failed++;
  }

  // Test 6: Person breadcrumbs
  try {
    const page: PageSpec = buildEntity(mockPersonEntity);
    assert(page.breadcrumbs.length === 3, 'Person has 3 breadcrumbs');
    assert(page.breadcrumbs[0].label === 'Home', 'First crumb is Home');
    assert(page.breadcrumbs[1].label === 'Persons', 'Second crumb is "Persons"');
    assert(page.breadcrumbs[1].href === '/persons', 'Second crumb href is /persons');
    assert(page.breadcrumbs[2].label === mockPersonEntity.name, 'Third crumb is entity name');
    assert(page.breadcrumbs[2].href === `/entity/${mockPersonEntity.slug}`, 'Third crumb href is correct');
  } catch (e) {
    console.error('  FAIL: Person breadcrumbs check threw exception', e);
    failed++;
  }

  // Test 7: Organization breadcrumbs
  try {
    const page: PageSpec = buildEntity(mockOrganizationEntity);
    assert(page.breadcrumbs.length === 3, 'Org has 3 breadcrumbs');
    assert(page.breadcrumbs[1].label === 'Organizations', 'Second crumb is "Organizations"');
    assert(page.breadcrumbs[1].href === '/organizations', 'Second crumb href is /organizations');
  } catch (e) {
    console.error('  FAIL: Organization breadcrumbs check threw exception', e);
    failed++;
  }

  // Test 8: Person schema is Person
  try {
    const page: PageSpec = buildEntity(mockPersonEntity);
    assert(page.schema['@type'] === 'Person', 'Person schema type is Person');
    assert(page.schema.name === mockPersonEntity.name, 'Person schema name matches');
    assert(page.schema.description === mockPersonEntity.description, 'Person schema description matches');
  } catch (e) {
    console.error('  FAIL: Person schema check threw exception', e);
    failed++;
  }

  // Test 9: Organization schema is Organization
  try {
    const page: PageSpec = buildEntity(mockOrganizationEntity);
    assert(page.schema['@type'] === 'Organization', 'Org schema type is Organization');
    assert(page.schema.name === mockOrganizationEntity.name, 'Org schema name matches');
  } catch (e) {
    console.error('  FAIL: Organization schema check threw exception', e);
    failed++;
  }

  // Test 10: Sections present even with empty data
  try {
    const minimalEntity = { ...mockPersonEntity, timeline: [], datasets: [], statistics: {}, sources: [], faq: [], relatedEntities: [] };
    const page: PageSpec = buildEntity(minimalEntity);
    const sectionIds = page.sections.map(s => s.id);
    assert(sectionIds.includes('entity-hero'), 'entity-hero present (required)');
    assert(sectionIds.includes('entity-related-stories'), 'entity-related-stories present (required)');
    assert(sectionIds.includes('quick-facts'), 'quick-facts present');
    assert(sectionIds.includes('entity-timeline'), 'entity-timeline present');
    assert(sectionIds.includes('entity-statistics'), 'entity-statistics present');
    assert(sectionIds.includes('entity-faq'), 'entity-faq present');
    assert(sectionIds.includes('entity-sources'), 'entity-sources present');
  } catch (e) {
    console.error('  FAIL: Entity sections with empty data threw exception', e);
    failed++;
  }

  console.log(`\nEntity Page Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
