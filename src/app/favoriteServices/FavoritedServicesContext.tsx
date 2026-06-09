import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FAVORITE_SERVICES_CHANGED_EVENT,
  readFavoritedServiceIds,
  writeFavoritedServiceIds
} from '@app/favoriteServices/favoriteServicesCatalog';

interface FavoritedServicesContextValue {
  favoritedIds: Set<string>;
  toggleFavorite: (itemId: string) => void;
}

const FavoritedServicesContext = createContext<FavoritedServicesContextValue | null>(null);

function readFavoritedIdsFromStorage(): string[] {
  return Array.from(readFavoritedServiceIds());
}

export function FavoritedServicesProvider({ children }: { children: React.ReactNode }) {
  const [favoritedIdList, setFavoritedIdList] = useState<string[]>(() => readFavoritedIdsFromStorage());

  useEffect(() => {
    const syncFromStorage = () => {
      setFavoritedIdList(readFavoritedIdsFromStorage());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(FAVORITE_SERVICES_CHANGED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(FAVORITE_SERVICES_CHANGED_EVENT, syncFromStorage);
    };
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavoritedIdList((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      const nextList = Array.from(next);
      writeFavoritedServiceIds(next);
      return nextList;
    });
  }, []);

  const favoritedIds = useMemo(() => new Set(favoritedIdList), [favoritedIdList]);

  const value = useMemo(
    () => ({
      favoritedIds,
      toggleFavorite
    }),
    [favoritedIds, toggleFavorite]
  );

  return (
    <FavoritedServicesContext.Provider value={value}>{children}</FavoritedServicesContext.Provider>
  );
}

export function useFavoritedServices(): FavoritedServicesContextValue {
  const context = useContext(FavoritedServicesContext);
  if (!context) {
    throw new Error('useFavoritedServices must be used within FavoritedServicesProvider');
  }
  return context;
}
