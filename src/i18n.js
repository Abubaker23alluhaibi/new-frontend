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
      console.log('تم العثور على اللغة المحفوظة:', savedLang);
      return savedLang;
    }
  } catch (error) {
    console.error('خطأ في قراءة اللغة المحفوظة:', error);
  }
  console.log('استخدام اللغة الافتراضية: ar');
  return 'ar'; // اللغة الافتراضية
};

// دالة لإعادة تطبيق اللغة
const reapplyLanguage = () => {
  const currentLang = i18n.language;
  const savedLang = localStorage.getItem('selectedLanguage');
  
  if (savedLang && savedLang !== currentLang) {
    console.log('إعادة تطبيق اللغة من', currentLang, 'إلى', savedLang);
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
    }
  });

// إعادة تطبيق اللغة بعد التهيئة
setTimeout(() => {
  reapplyLanguage();
}, 100);

export default i18n; 