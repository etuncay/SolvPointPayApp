import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppLanguage } from '@/lib/locale';
import { syncDocumentLocale } from '@/lib/locale';
import i18n from '@/lib/i18n';

export type ThemeMode = 'light' | 'dark';
export type TextSize = 's' | 'm' | 'l' | 'xl';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const TEXT_SIZE_PX: Record<TextSize, number> = { s: 15, m: 16, l: 17.5, xl: 19 };

function loadTheme(): ThemeMode {
  const v = localStorage.getItem('epay-customer-theme');
  return v === 'dark' ? 'dark' : 'light';
}

function loadTextSize(): TextSize {
  const v = localStorage.getItem('epay-customer-text-size');
  if (v === 's' || v === 'l' || v === 'xl') return v;
  return 'm';
}

function loadLang(): AppLanguage {
  const v = localStorage.getItem('epay-customer-lang');
  if (v === 'en' || v === 'ar') return v;
  return 'tr';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme);
  const [textSize, setTextSizeState] = useState<TextSize>(loadTextSize);
  const [lang, setLangState] = useState<AppLanguage>(loadLang);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('epay-customer-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZE_PX[textSize]}px`;
    localStorage.setItem('epay-customer-text-size', textSize);
  }, [textSize]);

  useEffect(() => {
    void i18n.changeLanguage(lang);
    syncDocumentLocale(lang);
    localStorage.setItem('epay-customer-lang', lang);
  }, [lang]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );
  const setTextSize = useCallback((s: TextSize) => setTextSizeState(s), []);
  const setLang = useCallback((l: AppLanguage) => setLangState(l), []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, textSize, setTextSize, lang, setLang }),
    [theme, setTheme, toggleTheme, textSize, setTextSize, lang, setLang],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeSettings ThemeProvider içinde kullanılmalı');
  return ctx;
}
