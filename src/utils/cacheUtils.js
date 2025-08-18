// أدوات لحل مشاكل التخزين المؤقت
export const clearAllCaches = async () => {
  try {
    // تنظيف Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ تم تنظيف جميع caches بنجاح');
    }

    // تنظيف localStorage من البيانات القديمة
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('cache') || key.includes('temp') || key.includes('old')) {
        localStorage.removeItem(key);
      }
    });

    // تنظيف sessionStorage
    sessionStorage.clear();

    // تنظيف IndexedDB (إذا كان متاحاً)
    if ('indexedDB' in window) {
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name.includes('translation') || db.name.includes('i18n')) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }

    console.log('✅ تم تنظيف جميع أنواع التخزين المؤقت');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تنظيف التخزين المؤقت:', error);
    return false;
  }
};

// تنظيف التخزين المؤقت للترجمة
export const clearTranslationCache = async () => {
  try {
    // تنظيف caches المتعلقة بالترجمة
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('translation') || name.includes('i18n') || name.includes('locale'))
          .map(cacheName => caches.delete(cacheName))
      );
    }

    // تنظيف localStorage من بيانات الترجمة القديمة
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('translation') || key.includes('i18n') || key.includes('locale') || key.includes('language')) {
        localStorage.removeItem(key);
      }
    });

    console.log('✅ تم تنظيف cache الترجمة بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تنظيف cache الترجمة:', error);
    return false;
  }
};

// تنظيف التخزين المؤقت للبيانات
export const clearDataCache = async () => {
  try {
    // تنظيف caches المتعلقة بالبيانات
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('doctor') || name.includes('appointment') || name.includes('user') || name.includes('profile'))
          .map(cacheName => caches.delete(cacheName))
      );
    }

    // تنظيف localStorage من البيانات القديمة
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('old') || key.includes('temp') || key.includes('cache')) {
        localStorage.removeItem(key);
      }
    });

    console.log('✅ تم تنظيف cache البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تنظيف cache البيانات:', error);
    return false;
  }
};

// إضافة timestamp للطلبات لمنع التخزين المؤقت
export const addCacheBuster = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

// التحقق من عمر البيانات
export const isDataStale = (timestamp, maxAge = 300000) => { // 5 دقائق افتراضياً
  if (!timestamp) return true;
  const currentTime = Date.now();
  const dataAge = currentTime - parseInt(timestamp);
  return dataAge > maxAge;
};

// تحديث timestamp البيانات
export const updateDataTimestamp = (key) => {
  localStorage.setItem(`${key}_timestamp`, Date.now().toString());
};

// الحصول على timestamp البيانات
export const getDataTimestamp = (key) => {
  return localStorage.getItem(`${key}_timestamp`);
};

// تنظيف البيانات القديمة تلقائياً
export const cleanupOldData = () => {
  try {
    const keys = Object.keys(localStorage);
    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة

    keys.forEach(key => {
      if (key.includes('_timestamp')) {
        const timestamp = localStorage.getItem(key);
        if (timestamp && isDataStale(timestamp, maxAge)) {
          // حذف البيانات القديمة
          const dataKey = key.replace('_timestamp', '');
          localStorage.removeItem(dataKey);
          localStorage.removeItem(key);
          console.log(`🗑️ تم حذف البيانات القديمة: ${dataKey}`);
        }
      }
    });
  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات القديمة:', error);
  }
};

// تنظيف دوري للبيانات
export const startPeriodicCleanup = (interval = 300000) => { // 5 دقائق افتراضياً
  return setInterval(cleanupOldData, interval);
};

// إيقاف التنظيف الدوري
export const stopPeriodicCleanup = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};
