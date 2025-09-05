/**
 * خدمة آمنة لإدارة المصادقة
 * تستخدم httpOnly cookies بدلاً من localStorage
 */

// دالة تسجيل الدخول الآمنة
export const secureLogin = async (email, password, loginType) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // حماية من CSRF
      },
      credentials: 'include', // إرسال cookies
      body: JSON.stringify({ email, password, loginType })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // التحقق من وجود التوكن في cookies
      const token = await getTokenFromCookies();
      if (token) {
        return { data: { ...data, token }, error: null };
      }
    }
    
    return { data: null, error: data.error || 'فشل في تسجيل الدخول' };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// دالة الحصول على التوكن من cookies
export const getTokenFromCookies = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/token`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// دالة تسجيل الخروج الآمنة
export const secureLogout = async () => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    // تجاهل الأخطاء في تسجيل الخروج
  }
  
  // تنظيف البيانات المحلية
  localStorage.clear();
  sessionStorage.clear();
  
  // تنظيف التخزين المؤقت
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
};

// دالة التحقق من صحة التوكن
export const validateToken = async () => {
  try {
    const token = await getTokenFromCookies();
    if (!token) return false;
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

// دالة إرسال طلبات آمنة
export const secureFetch = async (url, options = {}) => {
  const token = await getTokenFromCookies();
  
  const secureOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };
  
  return fetch(url, secureOptions);
};

export default {
  secureLogin,
  getTokenFromCookies,
  secureLogout,
  validateToken,
  secureFetch
};
