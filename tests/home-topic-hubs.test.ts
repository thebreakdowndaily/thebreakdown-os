import { describe, expect, it } from 'vitest';
import { selectHomepageTopics, type HomepageTopic } from '../features/home/view-model';

function makeTopic(index: number, overrides: Partial<HomepageTopic> = {}): HomepageTopic {
  return {
    slug: `registered-topic-${index}`,
    name: `Registered topic ${index}`,
    description: `Description ${index}`,
    ...overrides,
  };
}

describe('selectHomepageTopics', () => {
  it('does not invent navigation targets when the registry is empty', () => {
    expect(selectHomepageTopics([])).toEqual([]);
  });

  it('preserves one or two real topics instead of substituting a static list', () => {
    const topics = [makeTopic(1), makeTopic(2)];

    expect(selectHomepageTopics(topics)).toEqual(topics);
  });

  it('renders at most six registered topics in their canonical order', () => {
    const topics = Array.from({ length: 9 }, (_, index) => makeTopic(index + 1));

    expect(selectHomepageTopics(topics)).toEqual(topics.slice(0, 6));
  });

  it('omits entries without a usable slug or name', () => {
    const topics = [
      makeTopic(1),
      makeTopic(2, { slug: ' ' }),
      makeTopic(3, { name: '' }),
      makeTopic(4),
    ];

    expect(selectHomepageTopics(topics)).toEqual([topics[0], topics[3]]);
  });
});
