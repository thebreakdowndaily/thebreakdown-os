import fs from 'fs';
import path from 'path';
import { DefaultImageIntelligenceService } from '../services/media/intelligence';

// A lightweight script to run through the store.ts file and download missing images for stories
async function run() {
  const storePath = path.join(process.cwd(), 'utils', 'data-layer', 'store.ts');
  const publicDir = path.join(process.cwd(), 'public', 'images', 'stories');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  let storeContent = fs.readFileSync(storePath, 'utf-8');
  const intelligence = new DefaultImageIntelligenceService();

  // We'll regex search for all stories in the store
  const storyRegex = /slug:\s*'([^']+)',\s*headline:\s*'([^']+)',([\s\S]*?)heroImage:\s*'([^']+)',([\s\S]*?)tags:\s*\[([^\]]+)\],/g;
  
  let match;
  let matches = [];
  while ((match = storyRegex.exec(storeContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      slug: match[1],
      headline: match[2],
      beforeHero: match[3],
      heroImage: match[4],
      afterHero: match[5],
      tagsRaw: match[6]
    });
  }
  
  console.log(`Found ${matches.length} possible stories in store.ts`);

  for (const story of matches) {
    const isPlaceholder = story.heroImage.includes('placehold.co') || story.heroImage.includes('heroImage:');
    
    if (isPlaceholder) {
      console.log(`Fetching image for story: ${story.headline}`);
      
      // Try to find an image using tags
      const tags = story.tagsRaw.split(',').map(t => t.trim().replace(/'/g, ''));
      let imageResult = null;
      
      for (const tag of tags) {
        if (!tag) continue;
        console.log(`  -> Trying tag: ${tag}`);
        imageResult = await intelligence.fetchOfficialImage(tag);
        if (imageResult && imageResult.src) {
           break;
        }
      }
      
      if (!imageResult) {
         // Fallback to first part of headline
         const shortHeadline = story.headline.split(':')[0].split(' ').slice(0, 3).join(' ');
         console.log(`  -> Trying short headline: ${shortHeadline}`);
         imageResult = await intelligence.fetchOfficialImage(shortHeadline);
      }
      
      if (imageResult && imageResult.src) {
        try {
          const imagePath = path.join(publicDir, `${story.slug}.jpg`);
          console.log(`  -> Downloading from ${imageResult.src}`);
          const res = await fetch(imageResult.src);
          const buffer = await res.arrayBuffer();
          fs.writeFileSync(imagePath, Buffer.from(buffer));
          
          console.log(`  -> Updating store.ts for ${story.slug}`);
          const newHeroImage = `/images/stories/${story.slug}.jpg`;
          
          const replacement = `slug: '${story.slug}',\n    headline: '${story.headline}',${story.beforeHero}heroImage: '${newHeroImage}',${story.afterHero}tags: [${story.tagsRaw}],`;
          
          storeContent = storeContent.replace(story.fullMatch, replacement);
          console.log(`  -> Success!`);
        } catch (e: any) {
          console.error(`  -> Failed to download: ${e.message}`);
        }
      } else {
        console.log(`  -> No official image found for story ${story.slug}`);
      }
    } else {
       console.log(`Skipping ${story.slug}, already has non-placeholder image: ${story.heroImage}`);
    }
  }

  // Save updated store.ts
  fs.writeFileSync(storePath, storeContent);
  console.log('Finished updating store.ts and downloading story images.');
}

run();
