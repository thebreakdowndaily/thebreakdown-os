import { useEffect, useState, type RefObject } from 'react';

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: IntersectionObserverInit = { rootMargin: '300px' }
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => { observer.disconnect(); };
  }, [ref, options]);

  return isIntersecting;
}
