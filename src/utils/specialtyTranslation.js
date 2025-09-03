/**
 * نظام ترجمة التخصصات الطبية
 * يوفر ترجمة متعددة اللغات للتخصصات الطبية
 */

import { SPECIALTIES_WITH_IDS } from './specialtyConstants';

/**
 * دالة لترجمة التخصص حسب اللغة الحالية
 * @param {string} specialty - التخصص المراد ترجمته
 * @param {string} language - اللغة المطلوبة ('ar', 'en', 'ku')
 * @returns {string} التخصص مترجم
 */
export const translateSpecialty = (specialty, language = 'ar') => {
  if (!specialty) return '';
  
  // البحث في قائمة التخصصات المحلية أولاً
  const specialtyData = SPECIALTIES_WITH_IDS.find(s => 
    s.name_ar === specialty || 
    s.name_en === specialty || 
    s.name_ku === specialty ||
    s.key === specialty
  );
  
  if (specialtyData) {
    const nameField = `name_${language}`;
    return specialtyData[nameField] || specialtyData.name_ar || specialty;
  }
  
  // إذا لم يتم العثور على التخصص، إرجاع التخصص كما هو
  return specialty;
};

/**
 * دالة لإنشاء خريطة ترجمة التخصصات من ملفات الترجمة
 * @param {Array} specialtyCategories - مصفوفة فئات التخصصات من ملف الترجمة
 * @param {string} language - اللغة المطلوبة
 * @returns {Object} خريطة التخصصات المترجمة
 */
export const createSpecialtyTranslationMap = (specialtyCategories, language = 'ar') => {
  const translationMap = {};
  
  if (Array.isArray(specialtyCategories)) {
    specialtyCategories.forEach(category => {
      if (category.specialties && Array.isArray(category.specialties)) {
        category.specialties.forEach(specialty => {
          // استخدام التخصص كما هو من ملف الترجمة
          translationMap[specialty] = specialty;
        });
      }
    });
  }
  
  return translationMap;
};

/**
 * دالة لترجمة التخصص مع دعم الأنظمة المتعددة
 * @param {string} specialty - التخصص المراد ترجمته
 * @param {Object} specialtyCategories - فئات التخصصات من ملف الترجمة
 * @param {Array} fallbackSpecialties - قائمة التخصصات الاحتياطية
 * @param {string} language - اللغة المطلوبة
 * @returns {string} التخصص مترجم
 */
export const getTranslatedSpecialty = (specialty, specialtyCategories, fallbackSpecialties, language = 'ar') => {
  if (!specialty) return '';
  
  // 1. البحث في النظام المحلي أولاً
  const localTranslation = translateSpecialty(specialty, language);
  if (localTranslation !== specialty) {
    return localTranslation;
  }
  
  // 2. البحث في specialty_categories
  const specialtyMap = createSpecialtyTranslationMap(specialtyCategories, language);
  if (specialtyMap[specialty]) {
    return specialtyMap[specialty];
  }
  
  // 3. البحث في القائمة الاحتياطية
  if (Array.isArray(fallbackSpecialties)) {
    const index = fallbackSpecialties.findIndex(s => s === specialty);
    if (index !== -1) {
      // محاولة العثور على الترجمة في النظام المحلي
      const fallbackTranslation = translateSpecialty(fallbackSpecialties[index], language);
      if (fallbackTranslation !== fallbackSpecialties[index]) {
        return fallbackTranslation;
      }
    }
  }
  
  // 4. إرجاع التخصص كما هو إذا لم يتم العثور على ترجمة
  return specialty;
};

/**
 * دالة لإنشاء قائمة التخصصات المترجمة للاستخدام في الواجهة
 * @param {string} language - اللغة المطلوبة
 * @returns {Array} قائمة التخصصات المترجمة
 */
export const getTranslatedSpecialtiesList = (language = 'ar') => {
  return SPECIALTIES_WITH_IDS.map(specialty => ({
    id: specialty.id,
    key: specialty.key,
    name: specialty[`name_${language}`] || specialty.name_ar,
    category: specialty.category
  }));
};

/**
 * دالة للبحث في التخصصات المترجمة
 * @param {string} query - نص البحث
 * @param {string} language - اللغة المطلوبة
 * @returns {Array} نتائج البحث
 */
export const searchTranslatedSpecialties = (query, language = 'ar') => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return SPECIALTIES_WITH_IDS.filter(specialty => {
    const name = specialty[`name_${language}`] || specialty.name_ar;
    return name.toLowerCase().includes(lowerQuery) ||
           specialty.key.toLowerCase().includes(lowerQuery);
  }).map(specialty => ({
    id: specialty.id,
    key: specialty.key,
    name: specialty[`name_${language}`] || specialty.name_ar,
    category: specialty.category
  }));
};

export default {
  translateSpecialty,
  createSpecialtyTranslationMap,
  getTranslatedSpecialty,
  getTranslatedSpecialtiesList,
  searchTranslatedSpecialties
};
