import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute:', { 
    requiredUserType, 
    userType: user?.user_type, 
    hasUser: !!user, 
    loading 
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: جاري التحميل...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: لا يوجد مستخدم - إعادة توجيه للصفحة الرئيسية');
    // حفظ الرابط الأصلي في redirect
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (requiredUserType && user?.user_type !== requiredUserType) {
    console.log('❌ نوع المستخدم غير صحيح:', { 
      required: requiredUserType, 
      actual: user?.user_type 
    });
    
    // Redirect based on user type
    if (user?.user_type === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user?.user_type === 'admin') {
      return <Navigate to="/admin-login" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  console.log('✅ ProtectedRoute: تم الوصول للصفحة بنجاح');
  return children;
};

export default ProtectedRoute; 