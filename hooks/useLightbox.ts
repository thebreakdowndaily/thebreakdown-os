'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseLightboxOptions {
  id: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useLightbox({ id, onOpen, onClose }: UseLightboxOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    onClose?.();
    requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
    });
  }, [onClose]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => Math.min(z + 0.25, 4)); }
      if (e.key === '-') { e.preventDefault(); setZoom(z => Math.max(z - 0.25, 1)); }
      if (e.key === 'r' || e.key === 'R') { resetZoom(); }
    };
    window.addEventListener('keydown', handleKey);
    containerRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close, resetZoom]);

  useEffect(() => {
    if (!isOpen) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => {
          const delta = -e.deltaY * 0.005;
          return Math.max(1, Math.min(4, z + delta));
        });
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    const handleMouseMove = (ev: MouseEvent) => {
      setPosition({ x: ev.clientX - startX, y: ev.clientY - startY });
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [zoom, position]);

  const dispatchInvestigation = useCallback((claimId: string) => {
    window.dispatchEvent(new CustomEvent('open-investigation', { detail: claimId }));
  }, []);

  const overlayProps = {
    ref: containerRef,
    tabIndex: -1,
    role: 'dialog' as const,
    'aria-modal': true as const,
    'aria-label': `Lightbox: ${id}`,
    onClick: (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) close();
    },
  };

  const imageZoomStyle = zoom > 1
    ? { transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`, cursor: zoom > 1 ? 'grab' as const : 'default' as const }
    : {};

  return {
    isOpen, zoom, setZoom, position, setPosition,
    open, close, resetZoom,
    overlayProps, imageZoomStyle,
    handleMouseDown, dispatchInvestigation,
  };
}
