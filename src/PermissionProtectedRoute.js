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
    profile: profile?.user_type,
    userData: user,
    profileData: profile
  });
  
  // تشخيص إضافي للصلاحيات
  if (currentUserType && currentUserType !== 'doctor') {
    console.log('🔍 Employee Debug:', {
      currentUserType,
      permissionsKeys: Object.keys(currentPermissions),
      permissionsValues: Object.values(currentPermissions),
      requiredPermission,
      hasRequiredPermission: currentPermissions[requiredPermission]
    });
  }

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

  // إذا كان الموظف ولكن لم يتم تحميل الصلاحيات بعد، انتظر قليلاً
  if (currentUserType && currentUserType !== 'doctor' && Object.keys(currentPermissions).length === 0) {
    console.log('⏳ انتظار تحميل صلاحيات الموظف...');
    
    // محاولة إعادة تحميل الصلاحيات من localStorage
    const savedCurrentUser = localStorage.getItem('currentUser');
    if (savedCurrentUser) {
      try {
        const currentUserData = JSON.parse(savedCurrentUser);
        if (currentUserData.permissions) {
          console.log('🔄 تم العثور على صلاحيات في localStorage:', currentUserData.permissions);
          // إعادة تحميل الصفحة للتأكد من تحديث الصلاحيات
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('❌ خطأ في تحليل بيانات المستخدم الحالي:', error);
      }
    }
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(10, 143, 130, 0.3)', 
          borderTop: '4px solid #0A8F82', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <div style={{ color: '#0A8F82', fontSize: '1.2rem', fontWeight: '600' }}>جاري تحميل الصلاحيات...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // التحقق من الصلاحية المطلوبة
  const permissionValue = currentPermissions[requiredPermission];
  const hasPermission = permissionValue === true || permissionValue === 'true' || permissionValue === 1;
  
  console.log('🔍 Permission Check Details:', {
    requiredPermission,
    currentPermissions,
    hasPermission,
    permissionValue,
    permissionType: typeof permissionValue,
    allPermissions: Object.keys(currentPermissions),
    permissionValues: Object.values(currentPermissions)
  });
  
  if (requiredPermission && !hasPermission) {
    console.log('❌ لا توجد صلاحية:', requiredPermission);
    console.log('🔍 currentPermissions:', currentPermissions);
    console.log('🔍 requiredPermission:', requiredPermission);
    console.log('🔍 hasPermission:', hasPermission);
    
    // إذا كان هناك مكون بديل، اعرضه
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    // إذا كان هناك صفحة إعادة توجيه، اذهب إليها
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // عرض رسالة "غير مصرح" مع تفاصيل أكثر للتشخيص
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
            marginBottom: '1rem',
            lineHeight: '1.6'
          }}>
            {currentUserType === 'secretary' 
              ? 'عذراً، هذه الصفحة متاحة للدكتور فقط. يمكنك الوصول للمعلومات الأساسية من الأقسام الأخرى.'
              : 'عذراً، لا تملك الصلاحيات الكافية للوصول لهذه الصفحة.'
            }
          </p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'right'
          }}>
            <strong>تفاصيل التشخيص:</strong><br/>
            نوع المستخدم: {currentUserType || 'غير محدد'}<br/>
            الصلاحية المطلوبة: {requiredPermission}<br/>
            الصلاحيات المتاحة: {Object.keys(currentPermissions).join(', ') || 'لا توجد'}
          </div>
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
