import type { Topic } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';

export class KnowledgeTopicPipeline {
  private aggregators: TopicAggregator[] = [];

  add(aggregator: TopicAggregator): KnowledgeTopicPipeline {
    this.aggregators.push(aggregator);
    return this;
  }

  async execute(topic: Topic): Promise<KnowledgeTopic> {
    let knowledgeTopic: KnowledgeTopic = { topic };
    
    // CTO Note: Every builder should run independently via Promise.all.
    // However, some might need the results of others. If they are independent,
    // we can pass the initial knowledgeTopic to all and merge the results.
    const results = await Promise.all(
      this.aggregators.map(aggregator => aggregator.aggregate(topic, { topic }))
    );

    // Merge the results into the final knowledgeTopic
    for (const result of results) {
      knowledgeTopic = { ...knowledgeTopic, ...result };
    }

    return knowledgeTopic;
  }
}
