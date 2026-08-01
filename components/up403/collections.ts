'use client';

import { useCallback, useState } from 'react';
import type { ConstituencyRecord } from '@/lib/up403/types';

export interface Collection {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  memberIds: string[];
}

const KEY = 'up403-research-collections-v1';

function loadAll(): Collection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Collection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(collections: Collection[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(collections));
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>(() => loadAll());

  const save = useCallback((cols: Collection[]) => {
    setCollections(cols);
    persist(cols);
  }, []);

  const createCollection = useCallback(
    (name: string, note: string, memberIds: string[]) => {
      const col: Collection = {
        id: `col-${Date.now().toString(36)}`,
        name,
        note,
        createdAt: new Date().toISOString(),
        memberIds,
      };
      save([...collections, col]);
      return col;
    },
    [collections, save],
  );

  const addToCollection = useCallback(
    (collectionId: string, memberIds: string[]) => {
      save(
        collections.map(col =>
          col.id === collectionId ? { ...col, memberIds: Array.from(new Set([...col.memberIds, ...memberIds])) } : col,
        ),
      );
    },
    [collections, save],
  );

  const removeCollection = useCallback(
    (collectionId: string) => {
      save(collections.filter(col => col.id !== collectionId));
    },
    [collections, save],
  );

  const renameCollection = useCallback(
    (collectionId: string, name: string) => {
      save(collections.map(col => (col.id === collectionId ? { ...col, name } : col)));
    },
    [collections, save],
  );

  const membersOf = useCallback(
    (collection: Collection, byId: Map<string, ConstituencyRecord>): ConstituencyRecord[] => {
      return collection.memberIds.map(id => byId.get(id)).filter((r): r is ConstituencyRecord => !!r);
    },
    [],
  );

  return {
    collections,
    createCollection,
    addToCollection,
    removeCollection,
    renameCollection,
    membersOf,
  };
}
