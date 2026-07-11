import fs from 'fs';
import path from 'path';
import { DefaultImageIntelligenceService } from '../services/media/intelligence';

// A lightweight script to run through the store.ts file and download missing images
async function run() {
  const storePath = path.join(process.cwd(), 'utils', 'data-layer', 'store.ts');
  const publicDir = path.join(process.cwd(), 'public', 'images', 'entities');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  let storeContent = fs.readFileSync(storePath, 'utf-8');
  const intelligence = new DefaultImageIntelligenceService();

  // We'll regex search for all entities in the store
  const entityRegex = /id:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',([\s\S]*?)\]\s*,?\s*(\n\s*})/g;
  
  let match;
  let matches = [];
  while ((match = entityRegex.exec(storeContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      id: match[1],
      slug: match[2],
      name: match[3],
      content: match[4],
      endBracket: match[5]
    });
  }
  
  console.log(`Found ${matches.length} possible entities in store.ts`);

  for (const entity of matches) {
    const hasImageField = entity.fullMatch.includes('image:');
    
    // Check if the image file exists and is not 0 bytes
    const imagePath = path.join(publicDir, `${entity.slug}.jpg`);
    let imageNeedsFetching = !hasImageField;
    
    if (hasImageField) {
      if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        if (stats.size === 0) {
          console.log(`[!] ${entity.name} has 0-byte image file. Will re-fetch.`);
          imageNeedsFetching = true;
        }
      } else {
         console.log(`[!] ${entity.name} has image field but file is missing. Will re-fetch.`);
         imageNeedsFetching = true;
      }
    }

    if (imageNeedsFetching) {
      console.log(`Fetching image for: ${entity.name}`);
      const imageResult = await intelligence.fetchOfficialImage(entity.name);
      
      if (imageResult && imageResult.src) {
        try {
          console.log(`  -> Downloading from ${imageResult.src}`);
          const res = await fetch(imageResult.src);
          const buffer = await res.arrayBuffer();
          fs.writeFileSync(imagePath, Buffer.from(buffer));
          
          if (!hasImageField) {
            console.log(`  -> Updating store.ts for ${entity.name}`);
            const replacement = `image: '/images/entities/${entity.slug}.jpg', ${entity.content}`;
            const newBlock = entity.fullMatch.replace(entity.content, replacement);
            storeContent = storeContent.replace(entity.fullMatch, newBlock);
          }
          console.log(`  -> Success!`);
        } catch (e: any) {
          console.error(`  -> Failed to download: ${e.message}`);
        }
      } else {
        console.log(`  -> No official image found for ${entity.name}`);
      }
    }
  }

  // Save updated store.ts
  fs.writeFileSync(storePath, storeContent);
  console.log('Finished updating store.ts and downloading images.');
}

run();
