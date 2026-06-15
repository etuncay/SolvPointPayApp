import { useEffect } from 'react';
import { useThemeSettings } from '@epay/ui';
import i18n from '@/lib/i18n';
import { syncDocumentLocale } from '@/lib/locale';

/** Tema dil seçimi ↔ i18next + html dir/lang */
export function I18nThemeSync({ children }: { children: React.ReactNode }) {
  const { lang } = useThemeSettings();

  useEffect(() => {
    void i18n.changeLanguage(lang);
    syncDocumentLocale(lang);
  }, [lang]);

  return children;
}
