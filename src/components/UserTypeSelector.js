import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './UserTypeSelector.css';

const UserTypeSelector = () => {
  const { profile, setCurrentUserType, setCurrentPermissions, refreshAuthData } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const checkDoctorEmployees = useCallback(async () => {
    try {
      // التأكد من وجود profile قبل المتابعة
      if (!profile || !profile._id) {
        console.error('❌ UserTypeSelector - profile or profile._id is undefined in checkDoctorEmployees');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-has-employees/${profile._id}`);
      const data = await response.json();
      
      if (!data.hasEmployees) {
        // إذا لم يكن لدى الدكتور موظفين، تعيين الصلاحيات الكاملة له
        const fullPermissions = {
          VIEW_APPOINTMENTS: true,
          MANAGE_APPOINTMENTS: true,
          VIEW_CALENDAR: true,
          MANAGE_WORK_TIMES: true,
          VIEW_ANALYTICS: true,
          VIEW_PROFILE: true,
          MANAGE_EMPLOYEES: true,
          MANAGE_SPECIAL_APPOINTMENTS: true,
          MANAGE_APPOINTMENT_DURATION: true,
          VIEW_BOOKINGS_STATS: true,
          MANAGE_PATIENTS: true
        };
        
        // حفظ البيانات في localStorage
        const userData = {
          ...profile,
          currentUserType: 'doctor',
          permissions: fullPermissions
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // تحديث AuthContext
        setCurrentUserType('doctor');
        setCurrentPermissions(fullPermissions);
        
        // التوجيه للوحة التحكم
        navigate('/doctor-dashboard');
        return;
      }
      
      // إذا كان لديه موظفين، جلب قائمة الموظفين
      const fetchEmployees = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${profile._id}`);
          const data = await response.json();
          setEmployees(data);
        } catch (error) {
          console.error('خطأ في جلب الموظفين:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    } catch (error) {
      console.error('خطأ في التحقق من وجود موظفين:', error);
      // في حالة الخطأ، تعيين الصلاحيات الكاملة للدكتور
      const fullPermissions = {
        VIEW_APPOINTMENTS: true,
        MANAGE_APPOINTMENTS: true,
        VIEW_CALENDAR: true,
        MANAGE_WORK_TIMES: true,
        VIEW_ANALYTICS: true,
        VIEW_PROFILE: true,
        MANAGE_EMPLOYEES: true,
        MANAGE_SPECIAL_APPOINTMENTS: true,
        MANAGE_APPOINTMENT_DURATION: true,
        VIEW_BOOKINGS_STATS: true,
        MANAGE_PATIENTS: true
      };
      
      const userData = {
        ...profile,
        currentUserType: 'doctor',
        permissions: fullPermissions
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      setCurrentUserType('doctor');
      setCurrentPermissions(fullPermissions);
      
      navigate('/doctor-dashboard');
    }
  }, [profile, navigate, setCurrentUserType, setCurrentPermissions]);

  useEffect(() => {
    if (profile?._id) {
      checkDoctorEmployees();
    } else {
      console.log('⏳ UserTypeSelector - waiting for profile to load...');
      setLoading(false);
    }
  }, [profile?._id, checkDoctorEmployees]);



  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setError('');
    setAccessCode('');
  };

  const handleAccessCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType || !accessCode) {
      setError(t('user_type_selector.access_code_section.error_required'));
      return;
    }

    // التأكد من وجود profile قبل المتابعة
    if (!profile) {
      console.error('❌ UserTypeSelector - profile is undefined in handleAccessCodeSubmit');
      setError('خطأ في بيانات المستخدم. يرجى إعادة تسجيل الدخول.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      let endpoint = '';
      let requestBody = {};

      if (selectedType === 'doctor') {
        // التحقق من رمز الدكتور
        endpoint = `${process.env.REACT_APP_API_URL}/verify-doctor-code`;
        requestBody = {
          doctorId: profile._id,
          accessCode: accessCode
        };
      } else {
        // التحقق من رمز الموظف
        endpoint = `${process.env.REACT_APP_API_URL}/verify-employee-code`;
        requestBody = {
          doctorId: profile._id,
          employeeType: selectedType,
          accessCode: accessCode
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('🔍 UserTypeSelector - profile:', profile);
        console.log('🔍 UserTypeSelector - profile.token:', profile.token);
        
        // الصلاحيات الافتراضية للموظفين
        const defaultEmployeePermissions = {
          VIEW_APPOINTMENTS: true,
          VIEW_CALENDAR: true,
          VIEW_PROFILE: true,
          ACCESS_DASHBOARD: true, // صلاحية الوصول للصفحة الرئيسية
          MANAGE_APPOINTMENTS: false,
          MANAGE_WORK_TIMES: false,
          VIEW_ANALYTICS: false,
          MANAGE_EMPLOYEES: false,
          MANAGE_SPECIAL_APPOINTMENTS: false,
          MANAGE_APPOINTMENT_DURATION: false,
          VIEW_BOOKINGS_STATS: false,
          MANAGE_PATIENTS: false
        };
        
        // دمج الصلاحيات من الخادم مع الصلاحيات الافتراضية
        // إذا لم تكن هناك صلاحيات من الخادم، استخدم الصلاحيات الافتراضية فقط
        const serverPermissions = data.permissions || {};
        const finalPermissions = { 
          ...defaultEmployeePermissions, 
          ...serverPermissions 
        };
        
        console.log('🔍 UserTypeSelector - الصلاحيات النهائية:', {
          defaultPermissions: defaultEmployeePermissions,
          serverPermissions: serverPermissions,
          finalPermissions: finalPermissions
        });
        
        // التأكد من وجود profile قبل استخدامه
        if (!profile) {
          console.error('❌ UserTypeSelector - profile is undefined');
          setError('خطأ في بيانات المستخدم. يرجى إعادة تسجيل الدخول.');
          return;
        }

        // حفظ نوع المستخدم الحالي والصلاحيات
        const userData = {
          ...profile,
          currentUserType: selectedType,
          permissions: finalPermissions,
          employeeInfo: data.employeeInfo || null
        };

        // التأكد من نقل الـ token الأصلي
        if (profile.token) {
          userData.token = profile.token;
          console.log('🔍 UserTypeSelector - token transferred:', profile.token);
        } else {
          console.log('❌ UserTypeSelector - no token in profile');
        }

        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // أيضاً تحديث بيانات المستخدم الأساسية في localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('profile', JSON.stringify(userData));
        
        console.log('🔍 UserTypeSelector - final userData:', userData);
        console.log('🔍 UserTypeSelector - final userData.token:', userData.token);
        
        // تحديث AuthContext مباشرة
        setCurrentUserType(selectedType);
        setCurrentPermissions(finalPermissions);
        
        console.log('🔍 UserTypeSelector: تم تعيين الصلاحيات:', {
          selectedType,
          permissions: finalPermissions,
          employeeInfo: data.employeeInfo
        });
        
        // التأكد من تحديث الصلاحيات في localStorage
        const updatedUserData = {
          ...userData,
          currentUserType: selectedType,
          permissions: finalPermissions
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        console.log('💾 تم حفظ الصلاحيات المحدثة في localStorage:', updatedUserData);
        
        // إعادة تحميل البيانات في AuthContext
        refreshAuthData();

        // التوجيه للوحة التحكم
        navigate('/doctor-dashboard');
      } else {
        setError(data.message || t('user_type_selector.access_code_section.error_invalid'));
      }
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      setError(t('user_type_selector.access_code_section.error_connection'));
    } finally {
      setIsVerifying(false);
    }
  };

  // دالة لترجمة نوع الموظف
  const getEmployeeTypeLabel = (type) => {
    const labels = {
      secretary: t('user_type_selector.user_types.secretary'),
      assistant: t('user_type_selector.user_types.assistant'),
      employee: t('user_type_selector.user_types.employee')
    };
    return labels[type] || type;
  };

  const getAvailableTypes = () => {
    const types = [
      { type: 'doctor', label: t('user_type_selector.user_types.doctor'), icon: '👨‍⚕️', color: '#00bcd4' }
    ];

    // إضافة الموظفين المتاحين
    employees.forEach(employee => {
      if (employee.isActive) {
        const typeInfo = {
          type: employee.employeeType,
          label: getEmployeeTypeLabel(employee.employeeType),
          icon: getEmployeeIcon(employee.employeeType),
          color: getEmployeeColor(employee.employeeType),
          employee: employee
        };
        types.push(typeInfo);
      }
    });

    return types;
  };

  if (loading) {
    return (
      <div className="user-type-selector-loading">
        <div className="loading-spinner"></div>
        <p>{t('user_type_selector.loading_users')}</p>
      </div>
    );
  }

  const availableTypes = getAvailableTypes();

  return (
    <div className="user-type-selector">
      <div className="selector-container">
        <div className="selector-header">
          <div className="welcome-icon">👋</div>
          <h1>{t('user_type_selector.title')}</h1>
          <p>{t('user_type_selector.subtitle')}</p>
        </div>

        <div className="user-types-grid">
          {availableTypes.map((typeInfo) => (
            <div
              key={typeInfo.type}
              className={`user-type-card ${selectedType === typeInfo.type ? 'selected' : ''}`}
              onClick={() => handleTypeSelection(typeInfo.type)}
              style={{ borderColor: typeInfo.color }}
            >
              <div className="type-icon" style={{ color: typeInfo.color }}>
                {typeInfo.icon}
              </div>
              <h3>{typeInfo.label}</h3>
              {typeInfo.employee && (
                <p className="employee-name">{typeInfo.employee.name}</p>
              )}
            </div>
          ))}
        </div>

        {selectedType && (
          <div className="access-code-section">
            <h3>{t('user_type_selector.access_code_section.title')}</h3>
            <form onSubmit={handleAccessCodeSubmit} className="access-code-form">
              <div className="code-input-group">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder={t('user_type_selector.access_code_section.placeholder')}
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                  className="access-code-input"
                  required
                />
                <button
                  type="submit"
                  disabled={isVerifying || !accessCode}
                  className="btn-verify-code"
                >
                  {isVerifying ? t('user_type_selector.access_code_section.verifying') : t('user_type_selector.access_code_section.verify_button')}
                </button>
              </div>
              
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </form>
          </div>
        )}

        <div className="selector-info">
          <div className="info-card">
            <div className="info-icon">🔐</div>
            <div className="info-content">
              <h3>{t('user_type_selector.info_section.title')}</h3>
              <ul>
                <li>{t('user_type_selector.info_section.code_length')}</li>
                <li>{t('user_type_selector.info_section.code_correct')}</li>
                <li>{t('user_type_selector.info_section.change_type')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// دالة لإعطاء أيقونة الموظف
const getEmployeeIcon = (type) => {
  const icons = {
    secretary: '👨‍💼',
    assistant: '👨‍💼',
    employee: '👤'
  };
  return icons[type] || '👤';
};

// دالة لإعطاء لون الموظف
const getEmployeeColor = (type) => {
  const colors = {
    secretary: '#2196f3',
    assistant: '#9c27b0',
    employee: '#4caf50'
  };
  return colors[type] || '#666';
};

export default UserTypeSelector;
