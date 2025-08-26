/**
 * ملف الأمان للفرونت إند - Tabib IQ
 * يحتوي على دوال لحماية التطبيق من الثغرات الأمنية
 */

// دالة تنظيف النصوص من XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // إزالة الأحرف الخطرة
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// دالة التحقق من صحة التوكن
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // التحقق من أن التوكن يحتوي على 3 أجزاء (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // التحقق من أن التوكن لا يحتوي على أحرف خطرة
  if (/[<>"'&]/.test(token)) return false;
  
  return true;
};

// دالة تنظيف البيانات قبل حفظها في localStorage
export const sanitizeForStorage = (data) => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // عدم حفظ البيانات الحساسة
      if (['password', 'token', 'secret', 'key'].includes(key.toLowerCase())) {
        continue;
      }
      sanitized[key] = sanitizeForStorage(value);
    }
    return sanitized;
  }
  
  return data;
};

// دالة حذف البيانات الحساسة من localStorage
export const clearSensitiveData = () => {
  const sensitiveKeys = [
    'user',
    'profile', 
    'token',
    'accessToken',
    'refreshToken',
    'centerToken',
    'centerProfile'
  ];
  
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // تنظيف التخزين المؤقت
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('auth') || name.includes('user') || name.includes('profile')) {
          caches.delete(name);
        }
      });
    });
  }
};

// دالة التحقق من صحة البيانات المستلمة من الخادم
export const validateServerResponse = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  // التحقق من عدم وجود scripts
  const hasScripts = JSON.stringify(data).toLowerCase().includes('<script');
  if (hasScripts) return false;
  
  // التحقق من عدم وجود أحرف خطرة
  const hasDangerousChars = /[<>"'&]/.test(JSON.stringify(data));
  if (hasDangerousChars) return false;
  
  return true;
};

// دالة تشفير بسيط للبيانات (لاستخدام محلي فقط)
export const simpleEncrypt = (data) => {
  if (typeof data !== 'string') return data;
  
  // تشفير بسيط باستخدام Base64 (لاستخدام محلي فقط)
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('خطأ في التشفير:', error);
    return data;
  }
};

// دالة فك التشفير
export const simpleDecrypt = (encryptedData) => {
  if (typeof encryptedData !== 'string') return encryptedData;
  
  try {
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('خطأ في فك التشفير:', error);
    return encryptedData;
  }
};

// دالة حفظ آمن للبيانات في localStorage
export const secureSetItem = (key, value) => {
  try {
    // تنظيف البيانات قبل الحفظ
    const sanitizedValue = sanitizeForStorage(value);
    
    // تشفير البيانات (اختياري)
    const encryptedValue = simpleEncrypt(JSON.stringify(sanitizedValue));
    
    localStorage.setItem(key, encryptedValue);
    return true;
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    return false;
  }
};

// دالة قراءة آمنة للبيانات من localStorage
export const secureGetItem = (key) => {
  try {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    
    // فك التشفير
    const decryptedValue = simpleDecrypt(encryptedValue);
    
    // التحقق من صحة البيانات
    const parsedValue = JSON.parse(decryptedValue);
    if (!validateServerResponse(parsedValue)) {
      console.warn('بيانات غير صالحة في localStorage:', key);
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedValue;
  } catch (error) {
    console.error('خطأ في قراءة البيانات:', error);
    localStorage.removeItem(key);
    return null;
  }
};

// دالة التحقق من صحة URL
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // التحقق من أن البروتوكول آمن
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// دالة منع Clickjacking
export const preventClickjacking = () => {
  if (window.self !== window.top) {
    // إذا كان التطبيق محمول في iframe، إعادة توجيه
    window.top.location = window.self.location;
  }
};

// دالة تنظيف النموذج من البيانات الحساسة
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    // تجاهل الحقول الحساسة
    if (['password', 'token', 'secret'].includes(key.toLowerCase())) {
      continue;
    }
    
    // تنظيف القيم
    sanitized[key] = sanitizeInput(value);
  }
  
  return sanitized;
};

// دالة التحقق من صحة كلمة المرور
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // التحقق من طول كلمة المرور
  if (password.length < 8) return false;
  
  // التحقق من وجود أحرف متنوعة
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
};

// دالة منع تسريب المعلومات في console
export const secureConsole = () => {
  if (process.env.NODE_ENV === 'production') {
    // إخفاء console في الإنتاج
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};
  }
};

// دالة تنظيف البيانات عند تسجيل الخروج
export const secureLogout = () => {
  // حذف البيانات الحساسة
  clearSensitiveData();
  
  // تنظيف التخزين المؤقت
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // تنظيف sessionStorage
  sessionStorage.clear();
  
  // إعادة تحميل الصفحة
  window.location.reload();
};

export default {
  sanitizeInput,
  validateToken,
  sanitizeForStorage,
  clearSensitiveData,
  validateServerResponse,
  simpleEncrypt,
  simpleDecrypt,
  secureSetItem,
  secureGetItem,
  isValidUrl,
  preventClickjacking,
  sanitizeFormData,
  validatePassword,
  secureConsole,
  secureLogout
};
