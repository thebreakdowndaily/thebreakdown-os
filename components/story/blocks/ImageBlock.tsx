import Image from 'next/image';
import type { ImageBlockData } from './types';

export default function ImageBlock({ src, alt, caption, credit, width = 'full' }: ImageBlockData) {
  const widthClasses = {
    'narrow': 'max-w-2xl mx-auto',
    'full': 'w-full',
    'wide': 'w-[100vw] relative left-1/2 -translate-x-1/2 max-w-[100vw]'
  };

  return (
    <figure className={`my-10 ${widthClasses[width]}`}>
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#151515]">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 text-[13px] text-[#A1A1AA] flex justify-between">
          <span>{caption}</span>
          {credit && <span className="uppercase tracking-wider text-[11px]">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
