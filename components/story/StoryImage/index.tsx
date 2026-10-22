'use client';

import React, { useState } from 'react';
import { getHeroImageFallbackPath } from '@/lib/image-intelligence/placeholder-fallback';

interface StoryImageProps {
  src: string;
  alt?: string;
  category?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  width?: number;
  height?: number;
  wrapperClassName?: string;
}

export default function StoryImage({
  src,
  alt = '',
  category,
  className = '',
  style,
  fill,
  width,
  height,
  wrapperClassName,
}: StoryImageProps) {
  const hasOriginalSource = typeof src === 'string' && src.trim().length > 0;
  const [imgSrc, setImgSrc] = useState(hasOriginalSource ? src : getFallback(category));
  const [hasError, setHasError] = useState(!hasOriginalSource);

  function getFallback(cat?: string): string {
    return getHeroImageFallbackPath(cat);
  }

  function handleError() {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallback(category));
    }
  }

  const img = (
    <img
      src={imgSrc}
      alt={hasError ? '' : alt}
      className={className || undefined}
      style={style}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      onError={handleError}
      loading="lazy"
    />
  );

  if (fill || wrapperClassName) {
    return <div className={wrapperClassName || 'relative w-full h-full'}>{img}</div>;
  }

  return img;
}
