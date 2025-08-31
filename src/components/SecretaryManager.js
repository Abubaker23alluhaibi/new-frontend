import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { DOCTOR_PERMISSIONS } from '../utils/doctorPermissions';
import './SecretaryManager.css';

const SecretaryManager = () => {
  const { profile } = useAuth();
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    permissions: { ...DOCTOR_PERMISSIONS.SECRETARY }
  });

  // جلب قائمة السكرتيرات
  useEffect(() => {
    if (profile?._id) {
      fetchSecretaries();
    }
  }, [profile?._id]);

  const fetchSecretaries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/secretaries/${profile._id}`);
      const data = await response.json();
      setSecretaries(data);
    } catch (error) {
      console.error('خطأ في جلب السكرتيرات:', error);
    } finally {
      setLoading(false);
    }
  };

  // إضافة سكرتيرة جديدة
  const handleAddSecretary = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/secretaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doctorId: profile._id
        })
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', permissions: { ...DOCTOR_PERMISSIONS.SECRETARY } });
        fetchSecretaries();
      }
    } catch (error) {
      console.error('خطأ في إضافة السكرتيرة:', error);
    }
  };

  // تحديث صلاحيات السكرتيرة
  const handleUpdatePermissions = async (secretaryId, permissions) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/secretaries/${secretaryId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });
      
      if (response.ok) {
        fetchSecretaries();
      }
    } catch (error) {
      console.error('خطأ في تحديث الصلاحيات:', error);
    }
  };

  // إلغاء تفعيل/تفعيل السكرتيرة
  const handleToggleSecretary = async (secretaryId, isActive) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/secretaries/${secretaryId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        fetchSecretaries();
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة السكرتيرة:', error);
    }
  };

  // حذف السكرتيرة
  const handleDeleteSecretary = async (secretaryId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه السكرتيرة؟')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/secretaries/${secretaryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchSecretaries();
      }
    } catch (error) {
      console.error('خطأ في حذف السكرتيرة:', error);
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="secretary-manager">
      <div className="secretary-manager-header">
        <h2>إدارة السكرتيرات</h2>
        <button 
          className="btn-add-secretary"
          onClick={() => setShowAddModal(true)}
        >
          + إضافة سكرتيرة جديدة
        </button>
      </div>

      <div className="secretaries-list">
        {secretaries.length === 0 ? (
          <div className="no-secretaries">
            <div className="no-secretaries-icon">👥</div>
            <h3>لا توجد سكرتيرات</h3>
            <p>قم بإضافة سكرتيرة لإدارة المواعيد والمعلومات الأساسية</p>
          </div>
        ) : (
          secretaries.map(secretary => (
            <div key={secretary._id} className="secretary-card">
              <div className="secretary-info">
                <div className="secretary-avatar">
                  {secretary.name.charAt(0).toUpperCase()}
                </div>
                <div className="secretary-details">
                  <h3>{secretary.name}</h3>
                  <p>{secretary.email}</p>
                  <p>{secretary.phone}</p>
                  <div className="secretary-status">
                    <span className={`status-badge ${secretary.isActive ? 'active' : 'inactive'}`}>
                      {secretary.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="secretary-actions">
                <button
                  className="btn-edit-permissions"
                  onClick={() => {
                    setSelectedSecretary(secretary);
                    setShowEditModal(true);
                  }}
                >
                  تعديل الصلاحيات
                </button>
                
                <button
                  className={`btn-toggle ${secretary.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleSecretary(secretary._id, !secretary.isActive)}
                >
                  {secretary.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                </button>
                
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteSecretary(secretary._id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* مودال إضافة سكرتيرة جديدة */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>إضافة سكرتيرة جديدة</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddSecretary} className="secretary-form">
              <div className="form-group">
                <label>اسم السكرتيرة *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">إضافة السكرتيرة</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل الصلاحيات */}
      {showEditModal && selectedSecretary && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content permissions-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تعديل صلاحيات {selectedSecretary.name}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="permissions-grid">
              {Object.entries(DOCTOR_PERMISSIONS.SECRETARY).map(([permission, defaultValue]) => (
                <div key={permission} className="permission-item">
                  <label className="permission-label">
                    <input
                      type="checkbox"
                      checked={selectedSecretary.permissions[permission] || false}
                      onChange={e => {
                        const updatedPermissions = {
                          ...selectedSecretary.permissions,
                          [permission]: e.target.checked
                        };
                        handleUpdatePermissions(selectedSecretary._id, updatedPermissions);
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
    </div>
  );
};

// دالة لترجمة أسماء الصلاحيات
const getPermissionLabel = (permission) => {
  const labels = {
    VIEW_APPOINTMENTS: 'عرض المواعيد',
    MANAGE_APPOINTMENTS: 'إدارة المواعيد',
    VIEW_PATIENT_INFO: 'عرض معلومات المرضى',
    MANAGE_WORK_TIMES: 'إدارة أوقات العمل',
    VIEW_NOTIFICATIONS: 'عرض الإشعارات',
    MANAGE_BASIC_PROFILE: 'إدارة المعلومات الأساسية',
    VIEW_ANALYTICS: 'عرض الإحصائيات',
    MANAGE_ADVERTISEMENTS: 'إدارة الإعلانات'
  };
  return labels[permission] || permission;
};

export default SecretaryManager;
