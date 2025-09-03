import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';
import './EmployeeManager.css';

const EmployeeManager = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
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
      VIEW_BOOKINGS_STATS: false,
      VIEW_PRIVATE_COMMENTS: false
    }
  });

  const [showDoctorCodeModal, setShowDoctorCodeModal] = useState(false);
  const [doctorAccessCode, setDoctorAccessCode] = useState('');
  const [doctorCodeError, setDoctorCodeError] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${profile._id}`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('خطأ في جلب الموظفين:', error);
    } finally {
      setLoading(false);
    }
  }, [profile._id]);

  // جلب قائمة الموظفين
  useEffect(() => {
    if (profile?._id) {
      fetchEmployees();
    }
  }, [profile?._id, fetchEmployees]);

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
      alert(t('employee_management.messages.enter_access_code'));
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
        alert(`${t('employee_management.messages.employee_added_success')}\n${t('employee_management.access_code')} ${formData.accessCode}\n${t('employee_management.messages.access_code_info')}`);
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
            VIEW_BOOKINGS_STATS: false,
            VIEW_PRIVATE_COMMENTS: false
          }
        });
        fetchEmployees();
      } else {
        const error = await response.json();
        alert(error.message || t('employee_management.messages.add_employee_error'));
      }
    } catch (error) {
      console.error('خطأ في إضافة الموظف:', error);
      alert(t('employee_management.messages.connection_error'));
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
    if (!window.confirm(t('employee_management.messages.confirm_delete'))) return;
    
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
    if (!window.confirm(t('employee_management.messages.confirm_regenerate'))) return;
    
    const newCode = generateAccessCode();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/access-code`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: newCode })
      });
      
      if (response.ok) {
        alert(`${t('employee_management.messages.code_regenerated')}\n${t('employee_management.access_code')} ${newCode}\n${t('employee_management.messages.new_code_info')}`);
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
      setDoctorCodeError(t('employee_management.messages.code_length_error'));
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
        alert(t('employee_management.messages.doctor_code_setup_success'));
        setShowDoctorCodeModal(false);
        setDoctorAccessCode('');
        setDoctorCodeError('');
      } else {
        const data = await response.json();
        setDoctorCodeError(data.error || t('employee_management.messages.setup_error'));
      }
    } catch (error) {
      console.error('خطأ في إعداد رمز الدكتور:', error);
      setDoctorCodeError(t('employee_management.messages.setup_connection_error'));
    }
  };

  if (loading) {
    return (
      <div className="employee-manager-loading">
        <div className="loading-spinner"></div>
        <p>{t('employee_management.loading_employees')}</p>
      </div>
    );
  }

  return (
    <div className="employee-manager">
      <div className="employee-manager-header">
        <h2>👥 {t('employee_management.title')}</h2>
        <div className="header-buttons">
          <button 
            className="btn-setup-doctor-code"
            onClick={() => setShowDoctorCodeModal(true)}
          >
            🔐 {t('employee_management.setup_doctor_code')}
          </button>
          <button 
            className="btn-add-employee"
            onClick={() => setShowAddModal(true)}
          >
            + {t('employee_management.add_new_employee')}
          </button>
        </div>
      </div>

      <div className="employee-manager-info">
        <div className="info-card">
          <div className="info-icon">🔐</div>
          <div className="info-content">
            <h3>{t('employee_management.important_note')}</h3>
            <p>{t('employee_management.security_warning')}</p>
          </div>
        </div>
      </div>

      <div className="employees-list">
        {employees.length === 0 ? (
          <div className="no-employees">
            <div className="no-employees-icon">👥</div>
            <h3>{t('employee_management.no_employees')}</h3>
            <p>{t('employee_management.no_employees_message')}</p>
            <button 
              className="btn-add-first-employee"
              onClick={() => setShowAddModal(true)}
            >
              {t('employee_management.add_first_employee')}
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
                      {getEmployeeTypeLabel(employee.employeeType, t)}
                    </span>
                  </div>
                  <div className="employee-status">
                    <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                      {employee.isActive ? t('employee_management.active') : t('employee_management.inactive')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="employee-access">
                <div className="access-code-section">
                  <label>{t('employee_management.access_code')}</label>
                  <div className="access-code-display">
                    <span className="access-code">{employee.accessCode}</span>
                    <button
                      className="btn-regenerate-code"
                      onClick={() => handleRegenerateCode(employee._id)}
                      title={t('employee_management.regenerate_code')}
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
                  {t('employee_management.edit_permissions')}
                </button>
                
                <button
                  className={`btn-toggle ${employee.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleEmployee(employee._id, !employee.isActive)}
                >
                  {employee.isActive ? t('employee_management.deactivate') : t('employee_management.activate')}
                </button>
                
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteEmployee(employee._id)}
                >
                  {t('employee_management.delete')}
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
              <h3>{t('employee_management.add_employee_modal.title')}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="employee-form">
              <div className="form-group">
                <label>{t('employee_management.add_employee_modal.employee_name')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder={t('employee_management.add_employee_modal.employee_name_placeholder')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('employee_management.add_employee_modal.employee_type')} *</label>
                <select
                  value={formData.employeeType}
                  onChange={e => setFormData({...formData, employeeType: e.target.value})}
                  required
                >
                  <option value="secretary">{t('employee_management.employee_types.secretary')}</option>
                  <option value="assistant">{t('employee_management.employee_types.assistant')}</option>
                  <option value="employee">{t('employee_management.employee_types.employee')}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>{t('employee_management.add_employee_modal.access_code')} *</label>
                <div className="access-code-input">
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={e => setFormData({...formData, accessCode: e.target.value.toUpperCase()})}
                    required
                    placeholder={t('employee_management.add_employee_modal.access_code_placeholder')}
                    maxLength={6}
                    style={{textTransform: 'uppercase'}}
                  />
                  <button
                    type="button"
                    className="btn-generate-code"
                    onClick={() => setFormData({...formData, accessCode: generateAccessCode()})}
                  >
                    {t('employee_management.add_employee_modal.generate_code')}
                  </button>
                </div>
                <small>{t('employee_management.add_employee_modal.access_code_help')}</small>
              </div>
              
              <div className="form-group">
                <label>{t('employee_management.add_employee_modal.permissions')}</label>
                <div className="permissions-grid">
                  {Object.entries(formData.permissions).map(([permission, value]) => (
                    <div key={permission} className="permission-item">
                      <label className="permission-label">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={e => {
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [permission]: e.target.checked
                              }
                            });
                          }}
                        />
                        <span className="permission-text">{getPermissionLabel(permission, t)}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">{t('employee_management.add_employee_modal.add_employee')}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  {t('employee_management.add_employee_modal.cancel')}
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
              <h3>{t('employee_management.edit_permissions_modal.title')} {selectedEmployee.name}</h3>
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
                      {getPermissionLabel(permission, t)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                {t('employee_management.edit_permissions_modal.close')}
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
              <h3>🔐 {t('employee_management.setup_doctor_code_modal.title')}</h3>
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
                <label>{t('employee_management.setup_doctor_code_modal.access_code_label')}</label>
                <input
                  type="text"
                  value={doctorAccessCode}
                  onChange={(e) => {
                    setDoctorAccessCode(e.target.value.toUpperCase());
                    setDoctorCodeError('');
                  }}
                  maxLength={6}
                  placeholder={t('employee_management.setup_doctor_code_modal.access_code_placeholder')}
                  className={doctorCodeError ? 'error' : ''}
                  style={{textTransform: 'uppercase'}}
                />
                {doctorCodeError && (
                  <span className="error-message">{doctorCodeError}</span>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">{t('employee_management.setup_doctor_code_modal.setup_code')}</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowDoctorCodeModal(false);
                    setDoctorAccessCode('');
                    setDoctorCodeError('');
                  }}
                >
                  {t('employee_management.setup_doctor_code_modal.cancel')}
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
const getEmployeeTypeLabel = (type, t) => {
  const labels = {
    secretary: t('employee_management.employee_types.secretary'),
    assistant: t('employee_management.employee_types.assistant'),
    employee: t('employee_management.employee_types.employee')
  };
  return labels[type] || type;
};

// دالة لترجمة أسماء الصلاحيات
const getPermissionLabel = (permission, t) => {
  const labels = {
    VIEW_APPOINTMENTS: t('employee_management.permissions.VIEW_APPOINTMENTS'),
    MANAGE_APPOINTMENTS: t('employee_management.permissions.MANAGE_APPOINTMENTS'),
    VIEW_CALENDAR: t('employee_management.permissions.VIEW_CALENDAR'),
    MANAGE_WORK_TIMES: t('employee_management.permissions.MANAGE_WORK_TIMES'),
    VIEW_ANALYTICS: t('employee_management.permissions.VIEW_ANALYTICS'),
    VIEW_PROFILE: t('employee_management.permissions.VIEW_PROFILE'),
    VIEW_PRIVATE_COMMENTS: t('employee_management.permissions.VIEW_PRIVATE_COMMENTS'),
    MANAGE_EMPLOYEES: t('employee_management.permissions.MANAGE_EMPLOYEES'),
    MANAGE_SPECIAL_APPOINTMENTS: t('employee_management.permissions.MANAGE_SPECIAL_APPOINTMENTS'),
    MANAGE_APPOINTMENT_DURATION: t('employee_management.permissions.MANAGE_APPOINTMENT_DURATION'),
    VIEW_BOOKINGS_STATS: t('employee_management.permissions.VIEW_BOOKINGS_STATS')
  };
  return labels[permission] || permission;
};

export default EmployeeManager;
