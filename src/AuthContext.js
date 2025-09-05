import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { normalizePhone } from './utils/phoneUtils';
import { secureLog, clearSensitiveData, secureSetItem, secureGetItem } from './utils/securityUtils';
import { secureLogin, secureLogout as secureLogoutService, validateToken } from './utils/authService';

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
  }, []);

  useEffect(() => {
    console.log('🔄 AuthContext: بدء التحقق من حالة المستخدم...');
    
    // استرجاع بيانات المستخدم من localStorage عند تحميل الصفحة
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const lastUpdateTime = localStorage.getItem('lastAuthUpdate');
    const currentTime = Date.now();
    
    console.log('📦 AuthContext: البيانات المحفوظة:', { 
      hasSavedUser: !!savedUser, 
      hasSavedProfile: !!savedProfile,
      lastUpdate: lastUpdateTime
    });

    // التحقق من عمر البيانات
    if (lastUpdateTime && (currentTime - parseInt(lastUpdateTime)) > 300000) { // 5 دقائق
      console.log('⚠️ بيانات المصادقة قديمة، تحديث...');
      refreshAuthData();
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('✅ AuthContext: تم استرجاع بيانات المستخدم:', userData.user_type);
        
        // التأكد من وجود الـ token في userData
        if (!userData.token) {
          const savedToken = localStorage.getItem('token');
          if (savedToken) {
            userData.token = savedToken;
          }
        }
        
        setUser(userData);
      } catch (error) {
        console.error('❌ AuthContext: خطأ في تحليل بيانات المستخدم:', error);
        localStorage.removeItem('user');
      }
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        console.log('✅ AuthContext: تم استرجاع بيانات الملف الشخصي');
        
        // التأكد من وجود الـ token في profileData
        if (!profileData.token) {
          const savedToken = localStorage.getItem('token');
          if (savedToken) {
            profileData.token = savedToken;
          }
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error('❌ AuthContext: خطأ في تحليل بيانات الملف الشخصي:', error);
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
      } catch (error) {
        console.error('❌ AuthContext: خطأ في تحليل بيانات المستخدم الحالي:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    console.log('🏁 AuthContext: انتهى التحقق من حالة المستخدم');
    setLoading(false);

    // تحديث تلقائي كل 5 دقائق
    const interval = setInterval(() => {
      refreshAuthData();
    }, 300000); // 5 دقائق

    // تحديث تلقائي عند أي تغيير في localStorage (مثلاً عند تسجيل دخول الأدمن)
    const handleStorage = () => {
      console.log('🔄 AuthContext: تم اكتشاف تغيير في localStorage');
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
      console.log('💾 AuthContext: تم حفظ بيانات المستخدم الحالي:', currentUserData);
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
      
      const result = await secureLogin(normalizedEmail, password, loginType);
      
      if (result.data) {
        // حفظ بيانات المستخدم في localStorage بشكل آمن
        const userData = loginType === 'doctor' ? result.data.doctor : result.data.user;
        
        setUser(userData);
        setProfile(userData);
        
        // استخدام التخزين الآمن
        secureSetItem('user', userData);
        secureSetItem('profile', userData);

        return { data: result.data, error: null };
      } else {
        return { data: null, error: result.error };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // استخدام خدمة تسجيل الخروج الآمنة
      await secureLogoutService();
      
      setUser(null);
      setProfile(null);
      setCurrentUserType(null);
      setCurrentPermissions({});
    } catch (error) {
      secureLog('خطأ في تسجيل الخروج:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 