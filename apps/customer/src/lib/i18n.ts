import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '@/locales/tr.json';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'tr',
  fallbackLng: {
    ar: ['en', 'tr'],
    default: ['tr'],
  },
  interpolation: { escapeValue: false },
});

export default i18n;
