import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './EmployeeManager.css';

const EmployeeManager = () => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeType: 'secretary', // secretary, employee, assistant
    accessCode: '',
    permissions: {
      VIEW_APPOINTMENTS: true,
      MANAGE_APPOINTMENTS: false,
      VIEW_CALENDAR: true,
      MANAGE_WORK_TIMES: false,
      VIEW_ANALYTICS: false,
      VIEW_PROFILE: true,
      MANAGE_EMPLOYEES: false,
      MANAGE_SPECIAL_APPOINTMENTS: false,
      MANAGE_APPOINTMENT_DURATION: false,
      VIEW_BOOKINGS_STATS: false
    }
  });

  const [showDoctorCodeModal, setShowDoctorCodeModal] = useState(false);
  const [doctorAccessCode, setDoctorAccessCode] = useState('');
  const [doctorCodeError, setDoctorCodeError] = useState('');

  // جلب قائمة الموظفين
  useEffect(() => {
    if (profile?._id) {
      fetchEmployees();
    }
  }, [profile?._id]);

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

  // إنشاء رمز دخول عشوائي
  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // إضافة موظف جديد
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!formData.accessCode) {
      alert('يرجى إدخال رمز الدخول للموظف');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doctorId: profile._id,
          doctorName: profile.name
        })
      });
      
      if (response.ok) {
        alert(`تم إضافة الموظف بنجاح!\nرمز الدخول: ${formData.accessCode}\nيرجى إعطاء هذا الرمز للموظف`);
        setShowAddModal(false);
        setFormData({
          name: '',
          employeeType: 'secretary',
          accessCode: '',
          permissions: {
            VIEW_APPOINTMENTS: true,
            MANAGE_APPOINTMENTS: false,
            VIEW_CALENDAR: true,
            MANAGE_WORK_TIMES: false,
            VIEW_ANALYTICS: false,
            VIEW_PROFILE: true,
            MANAGE_EMPLOYEES: false,
            MANAGE_SPECIAL_APPOINTMENTS: false,
            MANAGE_APPOINTMENT_DURATION: false,
            VIEW_BOOKINGS_STATS: false
          }
        });
        fetchEmployees();
      } else {
        const error = await response.json();
        alert(error.message || 'خطأ في إضافة الموظف');
      }
    } catch (error) {
      console.error('خطأ في إضافة الموظف:', error);
      alert('خطأ في الاتصال بالخادم');
    }
  };

  // تحديث صلاحيات الموظف
  const handleUpdatePermissions = async (employeeId, permissions) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });
      
      if (response.ok) {
        // تحديث الحالة المحلية فوراً
        setSelectedEmployee(prev => ({
          ...prev,
          permissions: permissions
        }));
        
        // تحديث قائمة الموظفين
        setEmployees(prev => 
          prev.map(emp => 
            emp._id === employeeId 
              ? { ...emp, permissions: permissions }
              : emp
          )
        );
      }
    } catch (error) {
      console.error('خطأ في تحديث الصلاحيات:', error);
    }
  };

  // إلغاء تفعيل/تفعيل الموظف
  const handleToggleEmployee = async (employeeId, isActive) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة الموظف:', error);
    }
  };

  // حذف موظف
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('خطأ في حذف الموظف:', error);
    }
  };

  // إعادة إنشاء رمز دخول
  const handleRegenerateCode = async (employeeId) => {
    if (!window.confirm('هل تريد إعادة إنشاء رمز الدخول؟')) return;
    
    const newCode = generateAccessCode();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/access-code`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: newCode })
      });
      
      if (response.ok) {
        alert(`تم إعادة إنشاء رمز الدخول!\nالرمز الجديد: ${newCode}\nيرجى إعطاء هذا الرمز للموظف`);
        fetchEmployees();
      }
    } catch (error) {
      console.error('خطأ في إعادة إنشاء الرمز:', error);
    }
  };

  // إعداد رمز دخول للدكتور
  const handleSetupDoctorCode = async (e) => {
    e.preventDefault();
    
    if (!doctorAccessCode || doctorAccessCode.length !== 6) {
      setDoctorCodeError('يجب إدخال رمز مكون من 6 أحرف');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/setup-doctor-access-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: profile._id,
          accessCode: doctorAccessCode
        })
      });
      
      if (response.ok) {
        alert('تم إعداد رمز دخول للدكتور بنجاح!');
        setShowDoctorCodeModal(false);
        setDoctorAccessCode('');
        setDoctorCodeError('');
      } else {
        const data = await response.json();
        setDoctorCodeError(data.error || 'حدث خطأ في إعداد الرمز');
      }
    } catch (error) {
      console.error('خطأ في إعداد رمز الدكتور:', error);
      setDoctorCodeError('حدث خطأ في الاتصال بالخادم');
    }
  };

  if (loading) {
    return (
      <div className="employee-manager-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل بيانات الموظفين...</p>
      </div>
    );
  }

  return (
    <div className="employee-manager">
      <div className="employee-manager-header">
        <h2>👥 إدارة الموظفين</h2>
        <div className="header-buttons">
          <button 
            className="btn-setup-doctor-code"
            onClick={() => setShowDoctorCodeModal(true)}
          >
            🔐 إعداد رمز دخول للدكتور
          </button>
          <button 
            className="btn-add-employee"
            onClick={() => setShowAddModal(true)}
          >
            + إضافة موظف جديد
          </button>
        </div>
      </div>

      <div className="employee-manager-info">
        <div className="info-card">
          <div className="info-icon">🔐</div>
          <div className="info-content">
            <h3>مهم!</h3>
            <p>تأكد من إعطاء رمز الدخول للموظف بشكل آمن. لا تشارك الرمز مع أي شخص آخر.</p>
          </div>
        </div>
      </div>

      <div className="employees-list">
        {employees.length === 0 ? (
          <div className="no-employees">
            <div className="no-employees-icon">👥</div>
            <h3>لا يوجد موظفين</h3>
            <p>قم بإضافة موظفين لإدارة العيادة معك</p>
            <button 
              className="btn-add-first-employee"
              onClick={() => setShowAddModal(true)}
            >
              إضافة أول موظف
            </button>
          </div>
        ) : (
          employees.map(employee => (
            <div key={employee._id} className="employee-card">
              <div className="employee-info">
                <div className="employee-avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="employee-details">
                  <h3>{employee.name}</h3>
                  <div className="employee-type">
                    <span className={`type-badge ${employee.employeeType}`}>
                      {getEmployeeTypeLabel(employee.employeeType)}
                    </span>
                  </div>
                  <div className="employee-status">
                    <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                      {employee.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="employee-access">
                <div className="access-code-section">
                  <label>رمز الدخول:</label>
                  <div className="access-code-display">
                    <span className="access-code">{employee.accessCode}</span>
                    <button
                      className="btn-regenerate-code"
                      onClick={() => handleRegenerateCode(employee._id)}
                      title="إعادة إنشاء الرمز"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="employee-actions">
                <button
                  className="btn-edit-permissions"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowEditModal(true);
                  }}
                >
                  تعديل الصلاحيات
                </button>
                
                <button
                  className={`btn-toggle ${employee.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleEmployee(employee._id, !employee.isActive)}
                >
                  {employee.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                </button>
                
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteEmployee(employee._id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* مودال إضافة موظف جديد */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>إضافة موظف جديد</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="employee-form">
              <div className="form-group">
                <label>اسم الموظف *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="أدخل اسم الموظف"
                />
              </div>
              
              <div className="form-group">
                <label>نوع الموظف *</label>
                <select
                  value={formData.employeeType}
                  onChange={e => setFormData({...formData, employeeType: e.target.value})}
                  required
                >
                  <option value="secretary">سكرتير</option>
                  <option value="assistant">مساعد</option>
                  <option value="employee">موظف</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>رمز الدخول *</label>
                <div className="access-code-input">
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={e => setFormData({...formData, accessCode: e.target.value.toUpperCase()})}
                    required
                    placeholder="أدخل رمز الدخول"
                    maxLength={6}
                    style={{textTransform: 'uppercase'}}
                  />
                  <button
                    type="button"
                    className="btn-generate-code"
                    onClick={() => setFormData({...formData, accessCode: generateAccessCode()})}
                  >
                    إنشاء رمز
                  </button>
                </div>
                <small>رمز مكون من 6 أحرف وأرقام</small>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">إضافة الموظف</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل الصلاحيات */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content permissions-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تعديل صلاحيات {selectedEmployee.name}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="permissions-grid">
              {Object.entries(selectedEmployee.permissions).map(([permission, defaultValue]) => (
                <div key={permission} className="permission-item">
                  <label className="permission-label">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions[permission] || false}
                      onChange={e => {
                        const updatedPermissions = {
                          ...selectedEmployee.permissions,
                          [permission]: e.target.checked
                        };
                        // تحديث الحالة المحلية فوراً
                        setSelectedEmployee(prev => ({
                          ...prev,
                          permissions: updatedPermissions
                        }));
                        // إرسال التحديث للخادم
                        handleUpdatePermissions(selectedEmployee._id, updatedPermissions);
                      }}
                    />
                    <span className="permission-text">
                      {getPermissionLabel(permission)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* موذج إعداد رمز دخول الدكتور */}
      {showDoctorCodeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🔐 إعداد رمز دخول للدكتور</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDoctorCodeModal(false);
                  setDoctorAccessCode('');
                  setDoctorCodeError('');
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSetupDoctorCode}>
              <div className="form-group">
                <label>رمز الدخول (6 أحرف):</label>
                <input
                  type="text"
                  value={doctorAccessCode}
                  onChange={(e) => {
                    setDoctorAccessCode(e.target.value.toUpperCase());
                    setDoctorCodeError('');
                  }}
                  maxLength={6}
                  placeholder="مثال: ABC123"
                  className={doctorCodeError ? 'error' : ''}
                  style={{textTransform: 'uppercase'}}
                />
                {doctorCodeError && (
                  <span className="error-message">{doctorCodeError}</span>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">إعداد الرمز</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowDoctorCodeModal(false);
                    setDoctorAccessCode('');
                    setDoctorCodeError('');
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// دالة لترجمة نوع الموظف
const getEmployeeTypeLabel = (type) => {
  const labels = {
    secretary: 'سكرتير',
    assistant: 'مساعد',
    employee: 'موظف'
  };
  return labels[type] || type;
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
    VIEW_BOOKINGS_STATS: 'عرض إحصائيات الحجز'
  };
  return labels[permission] || permission;
};

export default EmployeeManager;
