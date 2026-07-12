import { getServices } from '../registry';
import type { MediaItem, Story } from '@/types/canonical';

export interface ImageIntelligenceService {
  resolveImageForStory(story: Story): Promise<MediaItem | null>;
  fetchOfficialImage(query: string): Promise<MediaItem | null>;
  generateAIImage(prompt: string): Promise<MediaItem | null>;
}

export class DefaultImageIntelligenceService implements ImageIntelligenceService {
  private imageCache = new Map<string, MediaItem | null>();

  async resolveImageForStory(story: Story): Promise<MediaItem | null> {
    const query = story.relatedEntityIds.length > 0 ? story.relatedEntityIds[0] : story.title;
    let image = await this.fetchOfficialImage(query);
    
    if (!image) {
      console.log(`[ImageIntelligence] No authentic image found for '${query}'. Falling back to AI generation.`);
      const prompt = `Editorial illustration for a news story titled "${story.title}". Context: ${story.summary}`;
      image = await this.generateAIImage(prompt);
    }
    
    if (image) {
      getServices().media.saveMediaItem(image);
    }
    
    return image;
  }

  async fetchOfficialImage(query: string): Promise<MediaItem | null> {
    const cacheKey = `official:${query}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey) || null;
    }

    try {
      const cleanQuery = query.replace(/-/g, ' ');
      
      console.log(`[ImageIntelligence] Fetching official image from Wikimedia for: ${cleanQuery}`);
      
      const headers = { 'User-Agent': 'TheBreakdownBot/1.0 (contact@thebreakdown.in)' };
      
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json&origin=*`, { headers });
      const searchData = await searchRes.json();
      const firstResult = searchData.query?.search?.[0];
      
      if (!firstResult) {
        this.imageCache.set(cacheKey, null);
        return null;
      }
      
      const pageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(firstResult.title)}&pithumbsize=1000&format=json&origin=*`, { headers });
      const pageData = await pageRes.json();
      
      const pages = pageData.query?.pages;
      if (!pages) {
        this.imageCache.set(cacheKey, null);
        return null;
      }
      
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      
      if (!page.thumbnail?.source) {
        this.imageCache.set(cacheKey, null);
        return null;
      }

      const mediaItem: MediaItem = {
        id: `wiki-${query}-${pageId}`,
        type: 'image',
        src: page.thumbnail.source,
        alt: `Official image for ${firstResult.title}`,
        caption: `Source: Wikimedia Commons / Wikipedia (${firstResult.title})`,
        tags: [query, firstResult.title, 'authentic', 'official'],
        credit: 'Wikimedia Commons',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseType: 'PUBLIC_DOMAIN',
        imageCategory: 'PHOTO',
        editorialPriority: 'PRIMARY',
        verificationStatus: 'SOURCE_VERIFIED',
        isAiGenerated: false,
        width: page.thumbnail.width || 800,
        height: page.thumbnail.height || 600,
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`,
        dominantColor: '#e0e0e0',
        blurHash: 'LEHLk~WB2yk8pyo0adR*.7kCMdnj'
      };

      this.imageCache.set(cacheKey, mediaItem);
      return mediaItem;
    } catch (e) {
      console.error('[ImageIntelligence] Error fetching from Wikimedia:', e);
      this.imageCache.set(cacheKey, null);
      return null;
    }
  }

  async generateAIImage(prompt: string): Promise<MediaItem | null> {
    // Note: We need OPENAI_API_KEY to actually generate the image.
    // We will build the implementation here for when the key is provided.
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('[ImageIntelligence] OPENAI_API_KEY is not set. Cannot generate AI image fallback.');
      return null;
    }

    try {
      console.log(`[ImageIntelligence] Generating AI image for prompt: ${prompt}`);
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const data = await res.json();
      const imageUrl = data.data[0].url;

      const mediaItem: MediaItem = {
        id: `ai-${Date.now()}`,
        type: 'image',
        src: imageUrl,
        alt: prompt.substring(0, 100),
        caption: 'AI Generated Illustration',
        tags: ['ai-generated', 'illustration'],
        credit: 'Generated by OpenAI DALL-E 3',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseType: 'AI',
        imageCategory: 'ILLUSTRATION',
        editorialPriority: 'THUMBNAIL',
        verificationStatus: 'AI_REVIEWED',
        isAiGenerated: true,
        aiModel: 'dall-e-3',
        aiPrompt: prompt,
        aiProvider: 'openai',
        generatedAt: new Date().toISOString()
      };

      return mediaItem;
    } catch (e) {
      console.error('[ImageIntelligence] Error generating AI image:', e);
      return null;
    }
  }
}
