'use client';
import { useEffect, useRef } from 'react';

export default function TextBlockClient({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cites = containerRef.current.querySelectorAll('cite[data-ref]');
    
    const cleanupFns: Array<() => void> = [];

    cites.forEach((cite) => {
      const refId = cite.getAttribute('data-ref');
      if (refId && !cite.textContent) {
        cite.textContent = `[${refId}]`;
      }
      
      const clickHandler = () => {
        window.dispatchEvent(new CustomEvent('open-evidence', { detail: refId }));
      };
      cite.addEventListener('click', clickHandler);
      cite.setAttribute('title', 'View Evidence');
      
      cleanupFns.push(() => { cite.removeEventListener('click', clickHandler); });
    });

    return () => { cleanupFns.forEach(fn => { fn(); }); };
  }, [content]);

  return (
    <section className="py-6 sm:py-8">
      <div 
        ref={containerRef}
        className="text-[1.05rem] sm:text-[1.125rem] text-text-primary leading-relaxed sm:leading-loose font-serif [&>p]:mb-6 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>a]:text-brand-400 [&>a]:underline [&>a:hover]:text-brand-500 [&_cite]:not-italic [&_cite]:text-[0.65em] [&_cite]:align-super [&_cite]:text-brand-400 [&_cite]:font-bold [&_cite]:ml-0.5 [&_cite]:cursor-pointer hover:[&_cite]:text-brand-500 transition-colors" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </section>
  );
}
