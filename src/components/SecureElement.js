import React from 'react';
import { useAuth } from '../AuthContext';
import { getUserAccessLevel, shouldHideSensitiveElement } from '../utils/doctorPermissions';

// مكون لحماية العناصر الحساسة
const SecureElement = ({ 
  children, 
  elementType, 
  doctorId, 
  fallback = null,
  showAccessDenied = true,
  requiredPermission = null 
}) => {
  const { user, profile } = useAuth();
  const currentUser = user || profile;
  
  // تحديد مستوى الوصول
  const accessLevel = getUserAccessLevel(currentUser, doctorId);
  
  // التحقق من إخفاء العنصر
  const shouldHide = shouldHideSensitiveElement(elementType, accessLevel);
  
  // إذا كان العنصر يجب إخفاؤه
  if (shouldHide) {
    if (fallback) {
      return fallback;
    }
    
    if (showAccessDenied) {
      return (
        <div className="access-denied-message">
          <div className="access-denied-icon">🔒</div>
          <div className="access-denied-text">
            {accessLevel === 'secretary' 
              ? 'هذا المحتوى متاح للدكتور فقط'
              : 'هذا المحتوى متاح للمستخدمين المصرح لهم فقط'
            }
          </div>
        </div>
      );
    }
    
    return null;
  }
  
  // إذا كان العنصر متاح، اعرضه
  return children;
};

// مكون لحماية الأيقونات
export const SecureIcon = ({ 
  icon, 
  elementType, 
  doctorId, 
  onClick, 
  className = '',
  title = '',
  disabled = false 
}) => {
  const { user, profile } = useAuth();
  const currentUser = user || profile;
  const accessLevel = getUserAccessLevel(currentUser, doctorId);
  const shouldHide = shouldHideSensitiveElement(elementType, accessLevel);
  
  if (shouldHide) {
    return null;
  }
  
  return (
    <button
      className={`secure-icon ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: '1.2rem',
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.background = 'rgba(0,0,0,0.1)';
          e.target.style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'none';
        e.target.style.transform = 'scale(1)';
      }}
    >
      {icon}
    </button>
  );
};

// مكون لحماية الأزرار
export const SecureButton = ({ 
  children, 
  elementType, 
  doctorId, 
  onClick, 
  className = '',
  disabled = false,
  variant = 'primary' // primary, secondary, danger
}) => {
  const { user, profile } = useAuth();
  const currentUser = user || profile;
  const accessLevel = getUserAccessLevel(currentUser, doctorId);
  const shouldHide = shouldHideSensitiveElement(elementType, accessLevel);
  
  if (shouldHide) {
    return null;
  }
  
  const buttonStyles = {
    primary: {
      background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
      color: '#fff',
      border: 'none'
    },
    secondary: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      color: '#333',
      border: '1px solid #ddd'
    },
    danger: {
      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
      color: '#fff',
      border: 'none'
    }
  };
  
  return (
    <button
      className={`secure-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyles[variant],
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {children}
    </button>
  );
};

// مكون لحماية الأقسام الكاملة
export const SecureSection = ({ 
  children, 
  elementType, 
  doctorId, 
  title = '',
  fallbackTitle = 'محتوى محمي'
}) => {
  const { user, profile } = useAuth();
  const currentUser = user || profile;
  const accessLevel = getUserAccessLevel(currentUser, doctorId);
  const shouldHide = shouldHideSensitiveElement(elementType, accessLevel);
  
  if (shouldHide) {
    return (
      <div className="secure-section-fallback">
        <div className="secure-section-header">
          <span className="secure-section-icon">🔒</span>
          <h3 className="secure-section-title">{fallbackTitle}</h3>
        </div>
        <div className="secure-section-message">
          {accessLevel === 'secretary' 
            ? 'هذا القسم متاح للدكتور فقط. يمكنك الوصول للمعلومات الأساسية من الأقسام الأخرى.'
            : 'هذا القسم محمي ولا يمكن الوصول إليه.'
          }
        </div>
      </div>
    );
  }
  
  return (
    <div className="secure-section">
      {title && (
        <div className="secure-section-header">
          <h3 className="secure-section-title">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default SecureElement;
