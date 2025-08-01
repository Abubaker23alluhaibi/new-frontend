import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ku from './locales/ku/translation.json';
import ar from './locales/ar/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ku: { translation: ku },
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar', // العربية افتراضية
    fallbackLng: 'ku',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

export default i18n; 