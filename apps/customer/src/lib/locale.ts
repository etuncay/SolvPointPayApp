export type AppLanguage = 'tr' | 'en' | 'ar';

export function syncDocumentLocale(lang: AppLanguage): void {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
}
