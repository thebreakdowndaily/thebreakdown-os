import { useState, useCallback } from 'react';

export function usePreviewMode(initialState = false) {
  const [showPreview, setShowPreview] = useState(initialState);
  
  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  return {
    state: { showPreview },
    actions: { togglePreview, setShowPreview }
  };
}
