import Image from 'next/image';
import type { KnowledgeAsset } from '@/types/canonical';

type AspectRatio = '16:9' | '1:1' | '4:3' | '3:2' | '2:1' | 'auto';

interface IntelligentImageProps {
  asset?: KnowledgeAsset;
  aspectRatio?: AspectRatio;
  sizes?: string;
  priority?: boolean;
  className?: string;
  overlay?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  caption?: boolean;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '1:1': 'aspect-square',
  '4:3': 'aspect-4/3',
  '3:2': 'aspect-3/2',
  '2:1': 'aspect-2/1',
  'auto': '',
};

const roundedClasses = {
  none: '', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full',
};

export default function IntelligentImage({
  asset, aspectRatio = '16:9', sizes, priority = false, className = '', overlay = true, rounded = 'lg', caption = false,
}: IntelligentImageProps) {
  if (!asset) return null;

  const arClass = aspectRatioClasses[aspectRatio];
  const rClass = roundedClasses[rounded];
  const isFallback = asset.priority === 'placeholder';

  return (
    <figure className={`relative overflow-hidden bg-neutral-950 ${arClass} ${rClass} ${className}`}>
      <Image
        src={asset.optimization?.cdnUrl || ''}
        alt={asset.metadata?.aiGenerated ? `AI Generated: ${asset.altText}` : asset.altText}
        fill
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${isFallback ? 'opacity-40' : ''} ${rClass}`}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 1200px'}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      )}
      {caption && asset.attribution && (
        <figcaption className="absolute bottom-2 right-2 text-[10px] text-white/50 px-1.5 py-0.5 bg-black/40 rounded">
          {asset.attribution.credit || asset.attribution.displayText}
        </figcaption>
      )}
    </figure>
  );
}
