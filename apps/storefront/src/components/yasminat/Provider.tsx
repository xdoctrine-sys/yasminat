'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';

export type YasLanguage = 'ar' | 'en';
const Context = createContext<{
  language: YasLanguage;
  tr: (ar: string, en: string) => string;
  toggleLanguage: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}>({language: 'ar', tr: ar => ar, toggleLanguage: () => {}, favorites: [], toggleFavorite: () => {}});

export function YasminatProvider({children, initialLanguage}: {children: ReactNode; initialLanguage: YasLanguage}) {
  const [language, setLanguage] = useState(initialLanguage);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('yasminat-favorite-products') || '[]');
      if (Array.isArray(stored)) setFavorites(stored.filter((id): id is string => typeof id === 'string').slice(0, 100));
    } catch { /* Storage is optional. */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  const toggleLanguage = () => {
    const next = language === 'ar' ? 'en' : 'ar';
    document.cookie = `yasminat-language=${next}; Path=/; SameSite=Lax; Max-Age=31536000`;
    setLanguage(next);
    router.refresh();
  };
  const toggleFavorite = (id: string) => setFavorites(previous => {
    const next = previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id].slice(-100);
    try { localStorage.setItem('yasminat-favorite-products', JSON.stringify(next)); } catch { /* Optional storage. */ }
    return next;
  });
  return <Context.Provider value={{language, tr: (ar, en) => language === 'ar' ? ar : en, toggleLanguage, favorites, toggleFavorite}}>{children}</Context.Provider>;
}
export const useYasminat = () => useContext(Context);
