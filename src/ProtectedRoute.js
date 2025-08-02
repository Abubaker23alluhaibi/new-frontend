import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute Debug:', { 
    requiredUserType, 
    userType: user?.user_type, 
    hasUser: !!user, 
    loading,
    currentPath: location.pathname,
    search: location.search
  });

  // إظهار شاشة تحميل أثناء التحقق من حالة المستخدم
  if (loading) {
    console.log('⏳ ProtectedRoute: جاري التحقق من حالة المستخدم...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255,255,255,0.3)', 
          borderTop: '4px solid white', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600' }}>جاري التحميل...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، إعادة توجيه للصفحة الرئيسية مع حفظ الرابط
  if (!user) {
    const redirectPath = location.pathname + location.search;
    console.log('❌ ProtectedRoute: لا يوجد مستخدم - إعادة توجيه للصفحة الرئيسية مع الرابط:', redirectPath);
    return <Navigate to={`/?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // التحقق من نوع المستخدم إذا كان مطلوباً
  if (requiredUserType && user?.user_type !== requiredUserType) {
    console.log('❌ نوع المستخدم غير صحيح:', { 
      required: requiredUserType, 
      actual: user?.user_type 
    });
    
    // إعادة توجيه حسب نوع المستخدم
    if (user?.user_type === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user?.user_type === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  console.log('✅ ProtectedRoute: تم الوصول للصفحة بنجاح - نوع المستخدم:', user?.user_type);
  return children;
};

export default ProtectedRoute; 