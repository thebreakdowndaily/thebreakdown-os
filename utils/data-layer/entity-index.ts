import type { KnowledgeEntity } from '@/types/canonical';
import { getEntity } from './store';

export interface IndexedEntity {
  id: string;
  slug: string;
  name: string;
  title: string;
  type?: string;
  description?: string;
}

const entityIndex = new Map<string, IndexedEntity>();

const seedEntities: IndexedEntity[] = [
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
  { id: 'ministry-of-consumer-affairs', slug: 'ministry-of-consumer-affairs', name: 'Ministry of Consumer Affairs', title: 'Ministry of Consumer Affairs' },
  { id: 'comptroller-and-auditor-general', slug: 'cag', name: 'Comptroller and Auditor General of India', title: 'Comptroller and Auditor General of India' },
  { id: 'cag', slug: 'cag', name: 'Comptroller and Auditor General of India', title: 'Comptroller and Auditor General of India' },
  { id: 'supreme-court-of-india', slug: 'supreme-court-of-india', name: 'Supreme Court of India', title: 'Supreme Court of India' },
  { id: 'supreme-court', slug: 'supreme-court-of-india', name: 'Supreme Court of India', title: 'Supreme Court of India' },
];

export function getEntityIndex(): IndexedEntity[] {
  if (entityIndex.size === 0) {
    for (const e of seedEntities) {
      entityIndex.set(e.id, e);
    }
  }
  return seedEntities;
}

export function getEntityById(id: string): IndexedEntity | undefined {
  if (entityIndex.size === 0) getEntityIndex();
  const direct = entityIndex.get(id);
  if (direct) return direct;
  try {
    const storeEntity = getEntity(id);
    if (storeEntity) {
      return {
        id: storeEntity.id,
        slug: storeEntity.slug,
        name: storeEntity.name,
        title: storeEntity.name,
        type: storeEntity.type,
        description: storeEntity.description,
      };
    }
  } catch {}
  return undefined;
}
