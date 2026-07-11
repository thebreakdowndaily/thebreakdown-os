import { KnowledgeStory, StoryBuilder } from './builder';
import { getServices } from '@/services/registry';

export class MediaBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const s = story.raw;
    let heroImage = s.heroImage;
    
    // Fallback logic for hero image (no AI generated images)
    if (!heroImage) {
      // Get primary entity query
      const query = s.relatedEntityIds.length > 0 ? s.relatedEntityIds[0] : s.title;
      
      try {
        const mediaService = getServices().intelligence;
        const officialImg = await mediaService.fetchOfficialImage(query);
        if (officialImg) {
          heroImage = officialImg.src;
        } else {
          // Monogram Placeholder
          heroImage = `/placeholders/${query.charAt(0).toLowerCase()}.png`; 
        }
      } catch(e) {
        heroImage = `/placeholders/default.png`;
      }
    }

    story.media = {
      heroImage,
      inlineImages: [],
      gallery: []
    };

    return story;
  }
}
