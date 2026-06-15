import { createContext, useContext, type ReactNode } from 'react';

export type SettingsTab = 'password' | 'welcome' | 'app' | 'failed';

type SettingsContextValue = {
  openSettings: (tab?: SettingsTab) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  children,
  openSettings,
}: {
  children: ReactNode;
  openSettings: (tab?: SettingsTab) => void;
}) {
  return (
    <SettingsContext.Provider value={{ openSettings }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings SettingsProvider içinde kullanılmalı');
  return ctx;
}
