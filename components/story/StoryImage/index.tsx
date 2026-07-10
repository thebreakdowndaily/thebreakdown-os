'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  const [loading, setLoading] = useState(true);

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

  const isFill = fill || (!width && !height);

  const img = (
    <Image
      src={imgSrc}
      alt={alt}
      className={`${className} transition-all duration-500 ease-out ${loading ? 'blur-md opacity-40' : 'blur-0 opacity-100'}`}
      style={style}
      fill={isFill}
      width={isFill ? undefined : width}
      height={isFill ? undefined : height}
      onError={handleError}
      onLoad={() => setLoading(false)}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE1MTUxNSIvPjwvc3ZnPg=="
    />
  );

  if (isFill || wrapperClassName) {
    return <div className={wrapperClassName || 'relative w-full h-full overflow-hidden'}>{img}</div>;
  }

  return img;
}
