import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PermissionProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  fallbackComponent = null,
  redirectTo = null 
}) => {
  const { user, profile, loading, currentUserType, currentPermissions } = useAuth();
  const location = useLocation();

  // إضافة console.log للتشخيص
  console.log('🔒 PermissionProtectedRoute Debug:', {
    requiredPermission,
    currentUserType,
    currentPermissions,
    hasPermission: currentPermissions[requiredPermission],
    user: user?.user_type,
    profile: profile?.user_type
  });

  // إظهار شاشة تحميل أثناء التحقق من حالة المستخدم
  if (loading) {
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

  // إذا لم يكن هناك مستخدم، إعادة توجيه للصفحة الرئيسية
  if (!user) {
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`/?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // إذا كان الدكتور، له جميع الصلاحيات
  if (currentUserType === 'doctor') {
    console.log('✅ الدكتور - له جميع الصلاحيات');
    return children;
  }

  // التحقق من الصلاحية المطلوبة
  if (requiredPermission && !currentPermissions[requiredPermission]) {
    console.log('❌ لا توجد صلاحية:', requiredPermission);
    
    // إذا كان هناك مكون بديل، اعرضه
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    // إذا كان هناك صفحة إعادة توجيه، اذهب إليها
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // عرض رسالة "غير مصرح"
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>🔒</div>
          <h2 style={{
            color: '#333',
            marginBottom: '1rem',
            fontSize: '1.8rem'
          }}>غير مصرح بالوصول</h2>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {currentUserType === 'secretary' 
              ? 'عذراً، هذه الصفحة متاحة للدكتور فقط. يمكنك الوصول للمعلومات الأساسية من الأقسام الأخرى.'
              : 'عذراً، لا تملك الصلاحيات الكافية للوصول لهذه الصفحة.'
            }
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(0,188,212,0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ الصلاحية موجودة:', requiredPermission);
  return children;
};

export default PermissionProtectedRoute;
