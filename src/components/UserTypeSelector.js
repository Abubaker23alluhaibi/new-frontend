import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserTypeSelector.css';

const UserTypeSelector = () => {
  const { profile, setCurrentUserType } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (profile?._id) {
      checkDoctorEmployees();
    }
  }, [profile?._id]);

  const checkDoctorEmployees = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-has-employees/${profile._id}`);
      const data = await response.json();
      
      if (!data.hasEmployees) {
        // إذا لم يكن لدى الدكتور موظفين، توجيه مباشرة للوحة التحكم
        navigate('/doctor-dashboard');
        return;
      }
      
      // إذا كان لديه موظفين، جلب قائمة الموظفين
      fetchEmployees();
    } catch (error) {
      console.error('خطأ في التحقق من وجود موظفين:', error);
      // في حالة الخطأ، توجيه للوحة التحكم
      navigate('/doctor-dashboard');
    }
  };

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

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setError('');
    setAccessCode('');
  };

  const handleAccessCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType || !accessCode) {
      setError('يرجى اختيار نوع المستخدم وإدخال الرمز');
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
        // حفظ نوع المستخدم الحالي والصلاحيات
        const userData = {
          ...profile,
          currentUserType: selectedType,
          permissions: data.permissions || {},
          employeeInfo: data.employeeInfo || null
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUserType(selectedType);

        // التوجيه للوحة التحكم
        navigate('/doctor-dashboard');
      } else {
        setError(data.message || 'رمز الدخول غير صحيح');
      }
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsVerifying(false);
    }
  };

  const getAvailableTypes = () => {
    const types = [
      { type: 'doctor', label: 'دكتور', icon: '👨‍⚕️', color: '#00bcd4' }
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
        <p>جاري تحميل بيانات المستخدمين...</p>
      </div>
    );
  }

  const availableTypes = getAvailableTypes();

  return (
    <div className="user-type-selector">
      <div className="selector-container">
        <div className="selector-header">
          <div className="welcome-icon">👋</div>
          <h1>مرحباً بك في نظام إدارة العيادة</h1>
          <p>اختر نوع المستخدم وأدخل الرمز الخاص بك</p>
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
            <h3>أدخل رمز الدخول</h3>
            <form onSubmit={handleAccessCodeSubmit} className="access-code-form">
              <div className="code-input-group">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="أدخل الرمز المكون من 6 أحرف"
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
                  {isVerifying ? 'جاري التحقق...' : 'دخول'}
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
              <h3>معلومات مهمة</h3>
              <ul>
                <li>الرمز مكون من 6 أحرف وأرقام</li>
                <li>تأكد من إدخال الرمز الصحيح</li>
                <li>يمكنك تغيير نوع المستخدم في أي وقت</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// دالة لترجمة نوع الموظف
const getEmployeeTypeLabel = (type) => {
  const labels = {
    secretary: 'سكرتيرة',
    assistant: 'مساعد',
    employee: 'موظف'
  };
  return labels[type] || type;
};

// دالة لإعطاء أيقونة الموظف
const getEmployeeIcon = (type) => {
  const icons = {
    secretary: '👩‍💼',
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
