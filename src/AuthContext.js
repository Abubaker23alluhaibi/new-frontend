import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { normalizePhone } from './utils/phoneUtils';
import { secureLog, clearSensitiveData } from './utils/securityUtils';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [dataVersion, setDataVersion] = useState(0);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [currentPermissions, setCurrentPermissions] = useState({});

  // دالة لتحديث البيانات
  const refreshAuthData = useCallback(() => {
    secureLog('🔄 تحديث بيانات المصادقة...');
    setLastUpdate(Date.now());
    setDataVersion(prev => prev + 1);
    
    // تنظيف التخزين المؤقت
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('auth') || name.includes('user') || name.includes('profile')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // إعادة تحميل البيانات من localStorage
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const savedCurrentUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        secureLog('❌ خطأ في تحليل بيانات المستخدم:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);
      } catch (error) {
        secureLog('❌ خطأ في تحليل بيانات الملف الشخصي:', error);
        localStorage.removeItem('profile');
        setProfile(null);
      }
    }
    
  // إعادة تحميل بيانات المستخدم الحالي والصلاحيات
  if (savedCurrentUser) {
    try {
      const currentUserData = JSON.parse(savedCurrentUser);
      setCurrentUserType(currentUserData.currentUserType);
      setCurrentPermissions(currentUserData.permissions || {});
      console.log('🔄 تم تحديث الصلاحيات:', currentUserData.permissions);
      console.log('🔍 تفاصيل الصلاحيات:', {
        currentUserType: currentUserData.currentUserType,
        permissions: currentUserData.permissions,
        permissionKeys: Object.keys(currentUserData.permissions || {}),
        permissionValues: Object.values(currentUserData.permissions || {})
      });
    } catch (error) {
      secureLog('❌ خطأ في تحليل بيانات المستخدم الحالي:', error);
      localStorage.removeItem('currentUser');
    }
  }
  }, []);

  useEffect(() => {
    console.log('🔄 AuthContext: بدء التحقق من حالة المستخدم...');
    
    // استرجاع بيانات المستخدم من localStorage عند تحميل الصفحة
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const lastUpdateTime = localStorage.getItem('lastAuthUpdate');
    const currentTime = Date.now();
    
    secureLog('📦 AuthContext: البيانات المحفوظة:', { 
      hasSavedUser: !!savedUser, 
      hasSavedProfile: !!savedProfile,
      lastUpdate: lastUpdateTime
    });

    // التحقق من عمر البيانات
    if (lastUpdateTime && (currentTime - parseInt(lastUpdateTime)) > 300000) { // 5 دقائق
      secureLog('⚠️ بيانات المصادقة قديمة، تحديث...');
      refreshAuthData();
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        secureLog('✅ AuthContext: تم استرجاع بيانات المستخدم:', userData.user_type);
        
        // التأكد من وجود الـ token في userData
        if (!userData.token) {
          const savedToken = localStorage.getItem('token');
          if (savedToken) {
            userData.token = savedToken;
          }
        }
        
        setUser(userData);
      } catch (error) {
        secureLog('❌ AuthContext: خطأ في تحليل بيانات المستخدم:', error);
        localStorage.removeItem('user');
      }
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        secureLog('✅ AuthContext: تم استرجاع بيانات الملف الشخصي');
        
        // التأكد من وجود الـ token في profileData
        if (!profileData.token) {
          const savedToken = localStorage.getItem('token');
          if (savedToken) {
            profileData.token = savedToken;
          }
        }
        
        setProfile(profileData);
      } catch (error) {
        secureLog('❌ AuthContext: خطأ في تحليل بيانات الملف الشخصي:', error);
        localStorage.removeItem('profile');
      }
    }
    
    // التحقق من نوع المستخدم الحالي
    const savedCurrentUser = localStorage.getItem('currentUser');
    if (savedCurrentUser) {
      try {
        const currentUserData = JSON.parse(savedCurrentUser);
        setCurrentUserType(currentUserData.currentUserType);
        setCurrentPermissions(currentUserData.permissions || {});
        console.log('🔍 AuthContext: تم تحميل بيانات المستخدم الحالي:', {
          currentUserType: currentUserData.currentUserType,
          permissions: currentUserData.permissions
        });
      } catch (error) {
        secureLog('❌ AuthContext: خطأ في تحليل بيانات المستخدم الحالي:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    secureLog('🏁 AuthContext: انتهى التحقق من حالة المستخدم');
    setLoading(false);

    // تحديث تلقائي كل 5 دقائق
    const interval = setInterval(() => {
      refreshAuthData();
    }, 300000); // 5 دقائق

    // تحديث تلقائي عند أي تغيير في localStorage (مثلاً عند تسجيل دخول الأدمن)
    const handleStorage = () => {
      secureLog('🔄 AuthContext: تم اكتشاف تغيير في localStorage');
      refreshAuthData();
    };
    
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshAuthData]);

  // حفظ البيانات في localStorage عند تغيير currentUserType أو currentPermissions
  useEffect(() => {
    if (currentUserType || Object.keys(currentPermissions).length > 0) {
      const currentUserData = {
        currentUserType,
        permissions: currentPermissions
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUserData));
      secureLog('💾 AuthContext: تم حفظ بيانات المستخدم الحالي:', currentUserData);
      console.log('🔍 AuthContext: currentUserType:', currentUserType);
      console.log('🔍 AuthContext: currentPermissions:', currentPermissions);
    }
  }, [currentUserType, currentPermissions]);

  const signUp = async (email, password, userData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...userData })
      });
      
      const data = await res.json();

      if (res.ok) {
        return { data, error: null };
      } else {
        return { data: null, error: data.error };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email, password, loginType) => {
    try {
      // توحيد رقم الهاتف إذا كان المدخل رقم هاتف
      const normalizedEmail = !email.includes('@') ? normalizePhone(email) : email;
      
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, loginType })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // حفظ بيانات المستخدم في localStorage
        const userData = loginType === 'doctor' ? data.doctor : data.user;
        
        // التحقق من وجود userData قبل إضافة الـ token
        if (userData && data.token) {
          userData.token = data.token;
        }
        
        // التحقق من وجود userData قبل تعيينه
        if (userData) {
          setUser(userData);
          setProfile(userData);
        } else {
          return { data: null, error: 'فشل في الحصول على بيانات المستخدم' };
        }
        
        // حفظ البيانات في localStorage فقط إذا كانت موجودة
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('profile', JSON.stringify(userData));
        }
        
        // حفظ الـ token بشكل منفصل للوصول السريع
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        return { data, error: null };
      } else {
        return { data: null, error: data.error };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // حذف البيانات من localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      
      setUser(null);
      setProfile(null);
      setCurrentUserType(null);
      setCurrentPermissions({});
    } catch (error) {
      // Error signing out
    }
  };

  const updateProfile = async (updates) => {
    try {
      let url = '';
      let key = '';
      const currentUser = profile || user;
      
      console.log('🔍 updateProfile - currentUser:', currentUser);
      console.log('🔍 updateProfile - updates:', updates);
      
      if (!currentUser?._id) {
        return { data: null, error: 'لا يمكن العثور على معرف المستخدم' };
      }
      
      if (currentUser.user_type === 'doctor') {
        url = `${process.env.REACT_APP_API_URL}/doctor/${currentUser._id}`;
        key = 'doctor';
      } else {
        url = `${process.env.REACT_APP_API_URL}/user/${currentUser._id}`;
        key = 'user';
      }
      
      console.log('🔍 updateProfile - URL:', url);
      console.log('🔍 updateProfile - Key:', key);
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      console.log('🔍 updateProfile - Response status:', res.status);
      
      const data = await res.json();
      
      console.log('🔍 updateProfile - Response data:', data);
  
      if (!res.ok) return { data: null, error: data.error };
      
      const updated = data[key] || data.user || data.doctor;
      if (updated) {
        setProfile(updated);
        setUser(updated);
        localStorage.setItem('profile', JSON.stringify(updated));
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { data: updated, error: null };
    } catch (error) {
      console.error('🔍 updateProfile - Error:', error);
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    logout: signOut,
    setUser,
    currentUserType,
    setCurrentUserType,
    currentPermissions,
    setCurrentPermissions,
    refreshAuthData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 