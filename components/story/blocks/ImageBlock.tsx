'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ImageBlockData } from './types';

export default function ImageBlock({ src, alt, caption, credit, width = 'full' }: ImageBlockData) {
  const [failed, setFailed] = useState(false);
  const widthClasses = {
    'narrow': 'max-w-2xl mx-auto',
    'full': 'w-full',
    'wide': 'w-[100vw] relative left-1/2 -translate-x-1/2 max-w-[100vw]'
  };

  const hasValidSrc = Boolean(src && typeof src === 'string' && src.trim().length > 0);

  return (
    <figure className={`my-10 ${widthClasses[width]}`}>
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#151515]">
        {hasValidSrc && !failed ? (
          <Image
            src={src}
            alt={alt || caption || 'Editorial image'}
            fill
            loading="lazy"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={alt || caption || 'Editorial image unavailable'}
            className="flex h-full w-full items-center justify-center bg-[var(--color-bg-secondary)] p-6 text-center text-sm text-[var(--color-text-muted)]"
          >
            Editorial image unavailable
          </div>
        )}
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
