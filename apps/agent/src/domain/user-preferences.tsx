import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppLanguage } from '@epay/ui';
import { mockUserPreferencesAdapter } from '@/features/dashboard/api/mock-user-preferences-adapter';

export type PasswordChangeFrequency = '1' | '3' | '6';

export type UserPreferences = {
  welcomeMessage: string;
  passwordChangeFrequency: PasswordChangeFrequency;
};

const DEFAULTS: Record<AppLanguage, UserPreferences> = {
  tr: {
    welcomeMessage: 'Mavi köpekbalığı 🦈 — sadece sen bilirsin.',
    passwordChangeFrequency: '3',
  },
  en: {
    welcomeMessage: 'Blue shark 🦈 — only you know this.',
    passwordChangeFrequency: '3',
  },
  ar: {
    welcomeMessage: 'سمك القرش الأزرق 🦈 — أنت وحدك تعرف هذا.',
    passwordChangeFrequency: '3',
  },
};

/** XSS/script enjeksiyonunu engelleyen basit karşılama mesajı kontrolü. */
export const WELCOME_MESSAGE_PATTERN = /^[^<>&"']{1,120}$/;

type UserPreferencesContextValue = {
  preferences: UserPreferences;
  setWelcomeMessage: (msg: string) => void;
  setPasswordChangeFrequency: (freq: PasswordChangeFrequency) => void;
  saveWelcomeMessage: (msg: string) => { ok: true } | { ok: false; error: string };
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({
  children,
  lang,
  userId,
}: {
  children: ReactNode;
  lang: AppLanguage;
  userId: string;
}) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const fromAdapter = mockUserPreferencesAdapter.getPreferences(userId);
    return { ...DEFAULTS[lang], ...fromAdapter };
  });

  const persist = useCallback(
    (next: UserPreferences) => {
      setPreferences(next);
      mockUserPreferencesAdapter.updatePreferences(userId, next);
    },
    [userId],
  );

  const setWelcomeMessage = useCallback(
    (msg: string) => persist({ ...preferences, welcomeMessage: msg }),
    [persist, preferences],
  );

  const setPasswordChangeFrequency = useCallback(
    (freq: PasswordChangeFrequency) => persist({ ...preferences, passwordChangeFrequency: freq }),
    [persist, preferences],
  );

  const saveWelcomeMessage = useCallback(
    (msg: string): { ok: true } | { ok: false; error: string } => {
      const result = mockUserPreferencesAdapter.updatePreferences(userId, {
        welcomeMessage: msg.trim(),
      });
      if (!result.ok) return result;
      setPreferences(mockUserPreferencesAdapter.getPreferences(userId));
      return { ok: true };
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      preferences,
      setWelcomeMessage,
      setPasswordChangeFrequency,
      saveWelcomeMessage,
    }),
    [preferences, setWelcomeMessage, setPasswordChangeFrequency, saveWelcomeMessage],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences UserPreferencesProvider içinde kullanılmalı');
  return ctx;
}
