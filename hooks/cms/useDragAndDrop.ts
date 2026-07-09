import React, { useState, useCallback } from 'react';

export function useDragAndDrop(onReorder: (sourceIndex: number, dropIndex: number) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOverIndex(null);
    setDragIndex(null);
    document.querySelectorAll('[data-block-id]').forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (!isNaN(sourceIndex) && sourceIndex !== dropIndex) {
      onReorder(sourceIndex, dropIndex);
    }
    
    setIsDragging(false);
    setDragOverIndex(null);
    setDragIndex(null);
  }, [onReorder]);

  return {
    state: { isDragging, dragIndex, dragOverIndex },
    actions: { handleDragStart, handleDragOver, handleDragEnd, handleDrop }
  };
}
