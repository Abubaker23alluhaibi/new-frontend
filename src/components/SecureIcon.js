import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './SecureIcon.css';

const SecureIcon = ({ 
  icon, 
  title, 
  onClick, 
  permission, 
  className = '',
  disabled = false,
  showAccessDenied = true,
  children 
}) => {
  const { currentUserType, currentPermissions } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  // التحقق من الصلاحيات
  const hasPermission = () => {
    // إذا كان الدكتور، له جميع الصلاحيات
    if (currentUserType === 'doctor') return true;
    
    // التحقق من الصلاحية المحددة
    return currentPermissions[permission] || false;
  };
  
  const handleClick = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (!hasPermission()) {
      if (showAccessDenied) {
        setShowModal(true);
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const getAccessDeniedMessage = () => {
    if (currentUserType === 'doctor') {
      return 'هذا المحتوى متاح للدكتور فقط';
    } else if (currentUserType === 'secretary') {
      return 'هذا المحتوى متاح للدكتور فقط. يمكنك الوصول للمعلومات الأساسية من الأقسام الأخرى.';
    } else {
      return 'هذا المحتوى متاح للمستخدمين المصرح لهم فقط';
    }
  };
  
  return (
    <>
      <button
        className={`secure-icon ${className} ${!hasPermission() ? 'restricted' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        title={title}
      >
        {icon}
        {children}
      </button>
      
      {/* مودال رسالة الوصول المرفوض */}
      {showModal && (
        <div className="access-denied-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🔒</div>
              <h3>وصول مقيد</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>{getAccessDeniedMessage()}</p>
              
              <div className="permission-info">
                <div className="current-user-info">
                  <span className="user-type-badge">
                    {currentUserType === 'doctor' ? '👨‍⚕️ دكتور' : 
                     currentUserType === 'secretary' ? '👨‍💼 سكرتير' : 
                     '👤 موظف'}
                  </span>
                </div>
                
                <div className="permission-details">
                  <h4>الصلاحيات المتاحة لك:</h4>
                  <ul>
                    {Object.entries(currentPermissions).map(([perm, hasAccess]) => (
                      hasAccess && (
                        <li key={perm} className="permission-item">
                          <span className="permission-icon">✅</span>
                          {getPermissionLabel(perm)}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-understand"
                onClick={() => setShowModal(false)}
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// مكون لحماية الأزرار
export const SecureButton = ({ 
  children, 
  permission, 
  onClick, 
  className = '',
  disabled = false,
  variant = 'primary',
  showAccessDenied = true
}) => {
  const { currentUserType, currentPermissions } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  const hasPermission = () => {
    if (currentUserType === 'doctor') return true;
    return currentPermissions[permission] || false;
  };
  
  const handleClick = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (!hasPermission()) {
      if (showAccessDenied) {
        setShowModal(true);
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const buttonStyles = {
    primary: {
      background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
      color: '#fff'
    },
    secondary: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      color: '#333',
      border: '1px solid #ddd'
    },
    danger: {
      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
      color: '#fff'
    }
  };
  
  return (
    <>
      <button
        className={`secure-button ${className} ${!hasPermission() ? 'restricted' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        style={buttonStyles[variant]}
      >
        {children}
      </button>
      
      {showModal && (
        <div className="access-denied-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🔒</div>
              <h3>وصول مقيد</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>هذا الإجراء متاح للدكتور فقط</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-understand"
                onClick={() => setShowModal(false)}
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// مكون لحماية الأقسام
export const SecureSection = ({ 
  children, 
  permission, 
  title = '',
  fallbackContent = null,
  showAccessDenied = true
}) => {
  const { currentUserType, currentPermissions } = useAuth();
  
  const hasPermission = () => {
    if (currentUserType === 'doctor') return true;
    return currentPermissions[permission] || false;
  };
  
  if (!hasPermission()) {
    if (fallbackContent) {
      return fallbackContent;
    }
    
    if (showAccessDenied) {
      return (
        <div className="secure-section-fallback">
          <div className="fallback-header">
            <div className="fallback-icon">🔒</div>
            <h3>{title || 'محتوى محمي'}</h3>
          </div>
          <div className="fallback-message">
            {currentUserType === 'secretary' 
              ? 'هذا القسم متاح للدكتور فقط. يمكنك الوصول للمعلومات الأساسية من الأقسام الأخرى.'
              : 'هذا القسم محمي ولا يمكن الوصول إليه.'
            }
          </div>
        </div>
      );
    }
    
    return null;
  }
  
  return (
    <div className="secure-section">
      {title && (
        <div className="section-header">
          <h3>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

// دالة لترجمة أسماء الصلاحيات
const getPermissionLabel = (permission) => {
  const labels = {
    VIEW_APPOINTMENTS: 'عرض المواعيد',
    MANAGE_APPOINTMENTS: 'إدارة المواعيد',
    VIEW_CALENDAR: 'عرض التقويم',
    MANAGE_WORK_TIMES: 'إدارة أوقات العمل',
    VIEW_ANALYTICS: 'عرض الإحصائيات',
    VIEW_PROFILE: 'عرض الملف الشخصي',
    MANAGE_EMPLOYEES: 'إدارة الموظفين',
    MANAGE_SPECIAL_APPOINTMENTS: 'إدارة المواعيد الخاصة',
    MANAGE_APPOINTMENT_DURATION: 'إدارة مدة المواعيد',
    VIEW_BOOKINGS_STATS: 'عرض إحصائيات الحجز',
    ACCESS_DASHBOARD: 'الوصول للصفحة الرئيسية'
  };
  return labels[permission] || permission;
};

export default SecureIcon;
