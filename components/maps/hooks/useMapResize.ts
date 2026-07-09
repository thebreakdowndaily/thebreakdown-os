import { useState, useEffect } from 'react';

export function useMapResize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: rect.width - 2,
        height: Math.max(300, Math.min(500, rect.width * 0.6)),
      });
    };
    
    updateSize();
    
    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(el);
    
    return () => { ro.disconnect(); };
  }, [containerRef]);

  return dimensions;
}
