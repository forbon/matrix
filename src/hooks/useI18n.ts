import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from '../types';
import de, { type Dict } from '../i18n/de';
import en from '../i18n/en';
import { loadLang, saveLang } from '../lib/storage';

const DICTS: Record<Lang, Dict> = { de, en };

export type TKey = keyof Dict;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => loadLang());

  useEffect(() => {
    saveLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: TKey): string => {
      const dict = DICTS[lang];
      return dict[key] ?? String(key);
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
