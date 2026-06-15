/** UI sayı/tarih biçimlendirme — uygulama dil kodundan Intl locale */
export function resolveIntlLocale(lang?: string): string {
  if (lang === 'tr') return 'tr-TR';
  if (lang === 'ar') return 'ar-SA';
  return 'en-US';
}
