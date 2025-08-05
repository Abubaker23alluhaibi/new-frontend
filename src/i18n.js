import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ku from './locales/ku/translation.json';
import ar from './locales/ar/translation.json';
import en from './locales/en/translation.json';

// دالة لاسترجاع اللغة المحفوظة
const getSavedLanguage = () => {
  try {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && ['ar', 'en', 'ku'].includes(savedLang)) {
      return savedLang;
    }
  } catch (error) {
    // تجاهل الأخطاء في الإنتاج
  }
  return 'ar'; // اللغة الافتراضية
};

// دالة لإعادة تطبيق اللغة
const reapplyLanguage = () => {
  const currentLang = i18n.language;
  const savedLang = localStorage.getItem('selectedLanguage');
  
  if (savedLang && savedLang !== currentLang) {
    i18n.changeLanguage(savedLang);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ku: { translation: ku },
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: getSavedLanguage(), // استخدام اللغة المحفوظة
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    debug: false, // إيقاف وضع التصحيح في الإنتاج
    keySeparator: '.',
    nsSeparator: ':',
    // إعدادات إضافية لتحسين الأداء
    load: 'languageOnly',
    preload: ['ar', 'en', 'ku'],
    // منع التخزين المؤقت
    caches: {
      enabled: false
    },
    // إعدادات إضافية لتحسين التحديث
    updateMissing: true,
    saveMissing: false,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      return fallbackValue;
    }
  });

// إعادة تطبيق اللغة بعد التهيئة
setTimeout(() => {
  reapplyLanguage();
}, 100);

// إضافة event listener لتحديث اللغة عند تغييرها في localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'selectedLanguage' && event.newValue) {
    i18n.changeLanguage(event.newValue);
  }
});

export default i18n; 