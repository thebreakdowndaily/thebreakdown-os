import Image from 'next/image';
import type { ImageIntelligenceResult } from '../service';

type AspectRatio = '16:9' | '1:1' | '4:3' | '3:2' | '2:1' | 'auto';

interface IntelligentImageProps {
  image: ImageIntelligenceResult;
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
  image, aspectRatio = '16:9', sizes, priority = false, className = '', overlay = true, rounded = 'lg', caption = false,
}: IntelligentImageProps) {
  const arClass = aspectRatioClasses[aspectRatio];
  const rClass = roundedClasses[rounded];

  return (
    <figure className={`relative overflow-hidden bg-neutral-950 ${arClass} ${rClass} ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${image.isFallback ? 'opacity-40' : ''} ${rClass}`}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 1200px'}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      )}
      {caption && image.credit && (
        <figcaption className="absolute bottom-2 right-2 text-[10px] text-white/50 px-1.5 py-0.5 bg-black/40 rounded">
          {image.credit}{image.agency ? ` / ${image.agency}` : ''}
        </figcaption>
      )}
    </figure>
  );
}
