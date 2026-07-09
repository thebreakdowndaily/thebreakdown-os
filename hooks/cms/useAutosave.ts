import { useState, useCallback, useEffect } from 'react';

export function useAutosave(onSaveCallback: () => void, delayMs = 5000) {
  const [savedIndicator, setSavedIndicator] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const markUnsaved = useCallback(() => {
    setSavedIndicator('unsaved');
  }, []);

  const save = useCallback(() => {
    setSavedIndicator('saving');
    onSaveCallback();
    setTimeout(() => { setSavedIndicator('saved'); }, 800);
  }, [onSaveCallback]);

  useEffect(() => {
    if (savedIndicator === 'unsaved') {
      const timer = setTimeout(() => { save(); }, delayMs);
      return () => { clearTimeout(timer); };
    }
  }, [savedIndicator, save, delayMs]);

  return {
    state: { savedIndicator },
    actions: { markUnsaved, save }
  };
}
