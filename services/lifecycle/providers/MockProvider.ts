import { RegisteredSource } from '@/types/canonical';
import { SourceProvider, SourceSnapshot, NormalizedDocument } from './SourceProvider';

export class MockProvider implements SourceProvider {
  id = 'mock-provider';

  supports(source: RegisteredSource): boolean {
    return source.provider === 'mock';
  }

  async fetchLatest(source: RegisteredSource): Promise<SourceSnapshot> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `snapshot-${Date.now()}`,
      sourceId: source.id,
      fetchedAt: new Date().toISOString(),
      rawContent: {
        title: `Mock Update from ${source.name}`,
        body: `This is a simulated change detected for ${source.name}.`,
        timestamp: new Date().toISOString()
      },
      hash: `hash-${Date.now()}`
    };
  }

  async validate(snapshot: SourceSnapshot): Promise<boolean> {
    // Basic validation
    return !!snapshot.rawContent;
  }

  async normalize(snapshot: SourceSnapshot): Promise<NormalizedDocument> {
    const raw = snapshot.rawContent as any;
    return {
      id: `norm-${snapshot.id}`,
      sourceId: snapshot.sourceId,
      title: raw.title || 'Untitled',
      content: raw.body || '',
      claims: [
        { text: 'Simulated claim detected in mock provider', context: raw.title }
      ],
      entities: ['Reserve Bank of India', 'Ministry of Finance'],
      publishedAt: raw.timestamp || snapshot.fetchedAt,
      url: `https://mock.source/${snapshot.sourceId}`
    };
  }
}
