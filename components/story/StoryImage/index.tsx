'use client';

import { useState } from 'react';

const categoryFallback: Record<string, string> = {
  economy: '/images/placeholders/economy-placeholder.svg',
  technology: '/images/placeholders/technology-placeholder.svg',
  environment: '/images/placeholders/environment-placeholder.svg',
  education: '/images/placeholders/education-placeholder.svg',
  policy: '/images/placeholders/policy-placeholder.svg',
  investigation: '/images/placeholders/investigation-placeholder.svg',
};

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
  const [imgSrc, setImgSrc] = useState(src || getFallback(category));
  const [hasError, setHasError] = useState(false);

  function getFallback(cat?: string): string {
    if (cat && categoryFallback[cat]) return categoryFallback[cat];
    if (cat === 'policy' || cat === 'investigation') return `/images/placeholders/${cat}-placeholder.svg`;
    return '/images/placeholders/story-placeholder.svg';
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
      alt={alt}
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
