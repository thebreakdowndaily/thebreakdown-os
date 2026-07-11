import { DefaultImageIntelligenceService } from '../services/media/intelligence';
import { initDefaultServices } from '../services/init';
import type { Story } from '../types/canonical';

async function runTests() {
  console.log('--- Starting Image Intelligence Tests ---');
  
  // Initialize minimal services
  initDefaultServices([], [], [], [], [], [], []);
  
  const intelligenceService = new DefaultImageIntelligenceService();
  
  // Test 1: Fetch Official Image (Wikimedia API)
  console.log('\nTest 1: Fetch Official Image (WHO)');
  const image = await intelligenceService.fetchOfficialImage('World Health Organization');
  
  if (image) {
    console.log('✅ Success! Found image:', image.src);
    console.log('Caption:', image.caption);
    console.log('License:', image.licenseType);
  } else {
    console.error('❌ Failed to fetch WHO image from Wikipedia.');
    process.exit(1);
  }
  
  // Test 2: Hierarchy logic (Mocking fetch to fall through to AI)
  console.log('\nTest 2: Fallback logic (No official image)');
  
  const mockStory: Story = {
    id: 'test-story-1',
    title: 'The Future of Abstract Concepts',
    slug: 'future-abstract',
    headline: 'Abstract Concepts in 2050',
    summary: 'A deep dive into abstract things that have no official logo.',
    category: 'technology',
    status: 'published',
    heroImage: '',
    author: 'Test',
    evidenceScore: 90,
    readingTime: 5,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: ['NonExistentEntityThatWillFailWikipediaLookup'],
    relatedTopicIds: []
  };

  // We temporarily mock fetchOfficialImage to return null to simulate a miss
  const originalFetch = intelligenceService.fetchOfficialImage.bind(intelligenceService);
  intelligenceService.fetchOfficialImage = async () => null;
  
  // We mock generateAIImage so we don't actually hit OpenAI in the test suite without a key
  intelligenceService.generateAIImage = async (prompt) => {
    return {
      id: 'ai-mock',
      type: 'image',
      src: 'https://example.com/ai-image.jpg',
      alt: prompt,
      caption: 'Mock AI Image',
      tags: [],
      credit: 'Mock AI',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      licenseType: 'AI',
      imageCategory: 'ILLUSTRATION',
      editorialPriority: 'THUMBNAIL',
      verificationStatus: 'AI_REVIEWED',
      isAiGenerated: true,
      aiModel: 'mock-model',
      aiPrompt: prompt,
      aiProvider: 'mock',
      generatedAt: new Date().toISOString()
    };
  };

  const resolvedImage = await intelligenceService.resolveImageForStory(mockStory);
  
  if (resolvedImage && resolvedImage.isAiGenerated) {
    console.log('✅ Success! System fell back to AI Generation as expected.');
    console.log('Generated AI Prompt:', resolvedImage.aiPrompt);
  } else {
    console.error('❌ Failed. System did not fall back to AI generation properly.');
    process.exit(1);
  }
  
  // Restore
  intelligenceService.fetchOfficialImage = originalFetch;
  
  console.log('\n--- All Image Intelligence Tests Passed! ---');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
