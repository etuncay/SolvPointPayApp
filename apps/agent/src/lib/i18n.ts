import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '@/i18n/tr.json';
import en from '@/i18n/en.json';
import ar from '@/i18n/ar.json';

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
