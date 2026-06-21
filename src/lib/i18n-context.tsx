'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Locale, getTranslations, getInitialLocale } from '@/lib/i18n';

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: ReturnType<typeof getTranslations>;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [t, setT] = useState(() => getTranslations('en'));

  useEffect(() => {
    const initial = getInitialLocale();
    setLocale(initial);
    setT(getTranslations(initial));
  }, []);

  useEffect(() => {
    setT(getTranslations(locale));
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
