import type { AppLanguage } from '@epay/ui';

export type { AppLanguage };

const RTL_LANGS: AppLanguage[] = ['ar'];

export function isRtlLanguage(lang: string): boolean {
  return RTL_LANGS.includes(lang as AppLanguage);
}

/** Intl / fmtCount için BCP 47 */
export function toIntlLocale(lang: string): string {
  if (lang === 'tr') return 'tr-TR';
  if (lang === 'ar') return 'ar-SA';
  return 'en-US';
}

export function syncDocumentLocale(lang: string): void {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
}
