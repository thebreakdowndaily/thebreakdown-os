import React from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';

interface TopicHeroProps {
  name: string;
  description: string;
  image?: string;
}

export default function TopicHero({ name, description, image }: TopicHeroProps) {
  return (
    <section aria-label={`Topic: ${name}`} className="relative w-full min-h-[40vh] flex items-center bg-neutral-950 overflow-hidden border-b border-neutral-900">
      {image && (
        <div className="absolute inset-0">
          <Image src={image} alt="" fill className="object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent" />
        </div>
      )}
      <Container className="relative z-10 py-16">
        {!image && (
          <div className="w-12 h-1.5 bg-amber-400 mb-8" aria-hidden="true" />
        )}
        <h1 
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          {name}
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-medium">
          {description}
        </p>
      </Container>
    </section>
  );
}
