import type { KnowledgeEntity } from '@/types/canonical';

const entityIndex = new Map<string, { id: string; slug: string; name: string; title: string }>();

const seedEntities: { id: string; slug: string; name: string; title: string }[] = [
  { id: 'jawaharlal-nehru', slug: 'jawaharlal-nehru', name: 'Jawaharlal Nehru', title: 'Prime Minister of India' },
  { id: 'mahatma-gandhi', slug: 'mahatma-gandhi', name: 'Mahatma Gandhi', title: 'Leader of Indian Independence Movement' },
  { id: 'mohammad-ali-jinnah', slug: 'mohammad-ali-jinnah', name: 'Muhammad Ali Jinnah', title: 'Founder of Pakistan' },
  { id: 'partition', slug: 'partition', name: 'Partition of India', title: '1947 Division of British India' },
  { id: 'kashmir', slug: 'kashmir', name: 'Kashmir', title: 'Jammu and Kashmir' },
  { id: 'india', slug: 'india', name: 'India', title: 'Republic of India' },
  { id: 'pakistan', slug: 'pakistan', name: 'Pakistan', title: 'Islamic Republic of Pakistan' },
  { id: 'united-states', slug: 'united-states', name: 'United States', title: 'United States of America' },
  { id: 'soviet-union', slug: 'soviet-union', name: 'Soviet Union', title: 'Union of Soviet Socialist Republics' },
  { id: 'china', slug: 'china', name: 'China', title: 'People\'s Republic of China' },
  { id: 'un', slug: 'un', name: 'United Nations', title: 'United Nations Organization' },
];

export function getEntityIndex(): { id: string; slug: string; name: string; title: string }[] {
  if (entityIndex.size === 0) {
    for (const e of seedEntities) {
      entityIndex.set(e.id, e);
    }
  }
  return seedEntities;
}

export function getEntityById(id: string): { id: string; slug: string; name: string; title: string } | undefined {
  if (entityIndex.size === 0) getEntityIndex();
  return entityIndex.get(id);
}
