import { useState, useEffect, type RefObject } from 'react';

export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  defaultWidth = 600,
  defaultHeight = 450
) {
  const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: rect.width - 2,
        height: Math.max(350, Math.min(550, rect.width * 0.6)),
      });
    };

    updateSize();
    const ro = new ResizeObserver(() => { updateSize(); });
    ro.observe(el);
    
    return () => { ro.disconnect(); };
  }, [ref]);

  return dimensions;
}
