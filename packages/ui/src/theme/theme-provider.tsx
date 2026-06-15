import * as React from 'react';
import type { Density, TextSize, ThemeMode } from '@epay/tokens';

export type AppLanguage = 'tr' | 'en' | 'ar';

export type ThemeSettings = {
  theme: ThemeMode;
  density: Density;
  textSize: TextSize;
  lang: AppLanguage;
};

type ThemeContextValue = ThemeSettings & {
  setTheme: (v: ThemeMode) => void;
  setDensity: (v: Density) => void;
  setTextSize: (v: TextSize) => void;
  setLang: (v: AppLanguage) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'epay-theme-settings';

const VALID_LANGS: AppLanguage[] = ['tr', 'en', 'ar'];

function normalizeSettings(raw: Partial<ThemeSettings>, defaults: ThemeSettings): ThemeSettings {
  const lang = VALID_LANGS.includes(raw.lang as AppLanguage) ? (raw.lang as AppLanguage) : defaults.lang;
  return { ...defaults, ...raw, lang };
}

export function ThemeProvider({
  children,
  defaultSettings = {
    theme: 'light' as ThemeMode,
    density: 'standard' as Density,
    textSize: 'standard' as TextSize,
    lang: 'tr' as const,
  },
}: {
  children: React.ReactNode;
  defaultSettings?: ThemeSettings;
}) {
  const [settings, setSettings] = React.useState<ThemeSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeSettings(JSON.parse(raw), defaultSettings);
    } catch {
      /* ignore */
    }
    return defaultSettings;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.density = settings.density;
    root.dataset.textSize = settings.textSize;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = React.useMemo(
    () => ({
      ...settings,
      setTheme: (theme: ThemeMode) => setSettings((s) => ({ ...s, theme })),
      setDensity: (density: Density) => setSettings((s) => ({ ...s, density })),
      setTextSize: (textSize: TextSize) => setSettings((s) => ({ ...s, textSize })),
      setLang: (lang: AppLanguage) => setSettings((s) => ({ ...s, lang })),
    }),
    [settings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeSettings ThemeProvider içinde kullanılmalı');
  return ctx;
}
