import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

import './PatientManagementPage.css';

// مكون إضافة مريض جديد
const AddPatientForm = ({ onAdd, onCancel, todayAppointments = [] }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });
  const [addMethod, setAddMethod] = useState('direct'); // 'direct' or 'from_appointments'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  // ملء البيانات من الموعد المحدد
  useEffect(() => {
    if (selectedAppointment && addMethod === 'from_appointments') {
      setFormData(prev => ({
        ...prev,
        name: selectedAppointment.patientName || '',
        age: selectedAppointment.patientAge || '',
        phone: selectedAppointment.patientPhone || ''
      }));
    }
  }, [selectedAppointment, addMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.phone || !formData.gender) {
      toast.error(t('patient_management.please_fill_required_fields'));
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      setFormData({
        name: '',
        age: '',
        phone: '',
        gender: '',
        address: '',
        emergencyContact: { name: '', phone: '', relationship: '' },
        notes: ''
      });
      setSelectedAppointment(null);
      setAddMethod('direct');
    } catch (error) {
      console.error('Error adding patient:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-form">
      <h3>{t('patient_management.add_patient')}</h3>
      
      {/* اختيار طريقة الإضافة */}
      <div className="add-method-selector">
        <label>
          <input
            type="radio"
            value="direct"
            checked={addMethod === 'direct'}
            onChange={(e) => setAddMethod(e.target.value)}
          />
          {t('patient_management.add_directly')}
        </label>
        <label>
          <input
            type="radio"
            value="from_appointments"
            checked={addMethod === 'from_appointments'}
            onChange={(e) => setAddMethod(e.target.value)}
          />
          {t('patient_management.add_from_today_appointments')}
        </label>
      </div>

      {/* اختيار الموعد إذا تم اختيار الإضافة من المواعيد */}
      {addMethod === 'from_appointments' && (
        <div className="appointment-selector">
          <label>{t('patient_management.select_appointment')}:</label>
          <select
            value={selectedAppointment?._id || ''}
            onChange={(e) => {
              const appointment = todayAppointments.find(apt => apt._id === e.target.value);
              setSelectedAppointment(appointment);
            }}
          >
            <option value="">{t('patient_management.choose_appointment')}</option>
            {todayAppointments.map(appointment => (
              <option key={appointment._id} value={appointment._id}>
                {appointment.patientName} - {appointment.patientPhone} ({appointment.time})
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>{t('patient_management.patient_name')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('patient_management.patient_age')} *</label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('patient_management.patient_phone')} *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('patient_management.patient_gender')} *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              required
            >
              <option value="">{t('patient_management.choose_gender')}</option>
              <option value="male">{t('patient_management.male')}</option>
              <option value="female">{t('patient_management.female')}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t('patient_management.patient_address')}</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>{t('patient_management.emergency_contact')}</label>
          <div className="emergency-contact-fields">
            <input
              type="text"
              placeholder={t('patient_management.emergency_contact_name')}
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, name: e.target.value}
              })}
            />
            <input
              type="tel"
              placeholder={t('patient_management.emergency_contact_phone')}
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, phone: e.target.value}
              })}
            />
            <input
              type="text"
              placeholder={t('patient_management.emergency_contact_relationship')}
              value={formData.emergencyContact.relationship}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
              })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t('patient_management.patient_notes')}</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? t('patient_management.loading') : t('patient_management.add')}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('patient_management.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

// مكون تفاصيل المريض مع رفع الملفات
const PatientDetails = ({ patient, onClose, onUpdate, fetchPatientDetails, setSelectedPatient }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const medicalReportsFileInputRef = useRef(null);
  const examinationsFileInputRef = useRef(null);

  // دالة مساعدة للحصول على التوكن
  const getAuthToken = useCallback(() => {
    // أولاً: جرب الحصول على الـ token من AuthContext
    if (user && user.token) {
      return user.token;
    }
    
    // ثانياً: جرب الحصول على الـ token من localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.token || userData.accessToken;
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن:', error);
      }
    }
    
    // ثالثاً: جرب الحصول على الـ token من localStorage (currentUser)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const currentUserData = JSON.parse(currentUser);
        return currentUserData.token || currentUserData.accessToken;
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من currentUser:', error);
      }
    }
    
    return null;
  }, [user]);

  // تشخيص بيانات المريض
  console.log('🔍 PatientDetails - patient:', patient);
  console.log('🔍 PatientDetails - patient._id:', patient?._id);

  // التحقق من وجود المريض
  if (!patient) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-message">
            <h3>خطأ</h3>
            <p>لا يوجد مريض محدد</p>
            <button onClick={onClose} className="btn-close">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من وجود المريض ومعرفه
    if (!patient || !patient._id) {
      console.error('❌ لا يوجد مريض محدد أو معرف المريض مفقود');
      toast.error(t('patient_management.error_no_patient_selected'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', '');

    setUploading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في handleFileUpload');
        toast.error('يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      console.log('🔍 رفع ملف للمريض:', patient._id, 'النوع:', type);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patient._id}/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        await response.json(); // تجاهل النتيجة
        // إعادة تحميل بيانات المريض المحدثة
        const updatedPatient = await fetchPatientDetails(patient._id);
        if (updatedPatient) {
          setSelectedPatient(updatedPatient);
        }
        toast.success(t('patient_management.file_uploaded_successfully'));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('patient_management.error_uploading_file'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId, type) => {
    if (!window.confirm(t('patient_management.confirm_delete_file'))) return;

    // التحقق من وجود المريض ومعرفه
    if (!patient || !patient._id) {
      console.error('❌ لا يوجد مريض محدد أو معرف المريض مفقود');
      toast.error(t('patient_management.error_no_patient_selected'));
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في handleDeleteFile');
        toast.error('يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      console.log('🔍 حذف ملف للمريض:', patient._id, 'النوع:', type, 'معرف الملف:', fileId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patient._id}/${type}/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        await response.json(); // تجاهل النتيجة
        // إعادة تحميل بيانات المريض المحدثة
        const updatedPatient = await fetchPatientDetails(patient._id);
        if (updatedPatient) {
          setSelectedPatient(updatedPatient);
        }
        toast.success(t('patient_management.file_deleted_successfully'));
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(t('patient_management.error_deleting_file'));
    }
  };

  return (
    <div className="patient-details-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t('patient_management.patient_details')}: {patient.name}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            {t('patient_management.basic_info')}
          </button>
          <button
            className={activeTab === 'medical_reports' ? 'active' : ''}
            onClick={() => setActiveTab('medical_reports')}
          >
            {t('patient_management.medical_reports')}
          </button>
          <button
            className={activeTab === 'examinations' ? 'active' : ''}
            onClick={() => setActiveTab('examinations')}
          >
            {t('patient_management.examinations')}
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'basic' && (
            <div className="basic-info">
              <div className="info-grid">
                <div className="info-item">
                  <label>{t('patient_management.patient_name')}:</label>
                  <span>{patient.name}</span>
                </div>
                <div className="info-item">
                  <label>{t('patient_management.patient_age')}:</label>
                  <span>{patient.age}</span>
                </div>
                <div className="info-item">
                  <label>{t('patient_management.patient_phone')}:</label>
                  <span>{patient.phone}</span>
                </div>
                <div className="info-item">
                  <label>{t('patient_management.patient_gender')}:</label>
                  <span>{t(`patient_management.${patient.gender}`)}</span>
                </div>
                {patient.address && (
                  <div className="info-item">
                    <label>{t('patient_management.patient_address')}:</label>
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.emergencyContact?.name && (
                  <div className="info-item">
                    <label>{t('patient_management.emergency_contact')}:</label>
                    <span>{patient.emergencyContact.name} - {patient.emergencyContact.phone}</span>
                  </div>
                )}
                {patient.notes && (
                  <div className="info-item full-width">
                    <label>{t('patient_management.notes')}:</label>
                    <span>{patient.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'medical_reports' && (
            <div className="files-section">
              <div className="upload-section">
                <h4>{t('patient_management.upload_medical_report')}</h4>
                <input
                  ref={medicalReportsFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, 'medical-reports')}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => medicalReportsFileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-upload"
                >
                  {uploading ? t('patient_management.uploading') : t('patient_management.choose_file')}
                </button>
              </div>

              <div className="files-list">
                {patient.medicalReports?.length > 0 ? (
                  patient.medicalReports.map((report, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <h5>{report.title}</h5>
                        <p>{report.description}</p>
                        <small>{new Date(report.uploadDate).toLocaleDateString('ar-EG')}</small>
                      </div>
                      <div className="file-actions">
                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-view">
                          {t('patient_management.view_file')}
                        </a>
                        <button
                          onClick={() => handleDeleteFile(report._id, 'medical-reports')}
                          className="btn-delete"
                        >
                          {t('patient_management.delete')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>{t('patient_management.no_medical_reports')}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'examinations' && (
            <div className="files-section">
              <div className="upload-section">
                <h4>{t('patient_management.upload_examination')}</h4>
                <input
                  ref={examinationsFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, 'examinations')}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => examinationsFileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-upload"
                >
                  {uploading ? t('patient_management.uploading') : t('patient_management.choose_file')}
                </button>
              </div>

              <div className="files-list">
                {patient.examinations?.length > 0 ? (
                  patient.examinations.map((examination, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <h5>{examination.title}</h5>
                        <p>{examination.description}</p>
                        <small>{new Date(examination.uploadDate).toLocaleDateString('ar-EG')}</small>
                      </div>
                      <div className="file-actions">
                        <a href={examination.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-view">
                          {t('patient_management.view_file')}
                        </a>
                        <button
                          onClick={() => handleDeleteFile(examination._id, 'examinations')}
                          className="btn-delete"
                        >
                          {t('patient_management.delete')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>{t('patient_management.no_examinations')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// الصفحة الرئيسية لإدارة المرضى
const PatientManagementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [patientStats, setPatientStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);

  // دالة مساعدة للحصول على التوكن
  const getAuthToken = useCallback(() => {
    // أولاً: جرب الحصول على الـ token من AuthContext
    if (user && user.token) {
      console.log('🔍 getAuthToken - token from AuthContext:', user.token);
      return user.token;
    }
    
    // ثانياً: جرب الحصول على الـ token من localStorage (user)
    const savedUser = localStorage.getItem('user');
    console.log('🔍 getAuthToken - savedUser:', savedUser);
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔍 getAuthToken - userData:', userData);
        console.log('🔍 getAuthToken - token:', userData.token);
        console.log('🔍 getAuthToken - accessToken:', userData.accessToken);
        
        const token = userData.token || userData.accessToken;
        if (token) {
          console.log('🔍 getAuthToken - final token from user:', token);
          return token;
        }
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من user:', error);
      }
    }
    
    // ثالثاً: جرب الحصول على الـ token من localStorage (currentUser)
    const currentUser = localStorage.getItem('currentUser');
    console.log('🔍 getAuthToken - currentUser:', currentUser);
    
    if (currentUser) {
      try {
        const currentUserData = JSON.parse(currentUser);
        console.log('🔍 getAuthToken - currentUserData:', currentUserData);
        console.log('🔍 getAuthToken - currentUserData.token:', currentUserData.token);
        
        const token = currentUserData.token || currentUserData.accessToken;
        if (token) {
          console.log('🔍 getAuthToken - final token from currentUser:', token);
          return token;
        }
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من currentUser:', error);
      }
    }
    
    console.log('❌ لا يوجد token في أي مكان');
    return null;
  }, [user]);

  // جلب المرضى
  const fetchPatients = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في fetchPatients');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchQuery
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
        setPagination(data.pagination || {});
      } else {
        throw new Error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(t('patient_management.error_loading_patients'));
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, t, getAuthToken]);

  // جلب إحصائيات المرضى
  const fetchPatientStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في fetchPatientStats');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const stats = await response.json();
        setPatientStats(stats);
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    }
  }, [getAuthToken]);

  // جلب مواعيد اليوم
  const fetchTodayAppointments = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في fetchTodayAppointments');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const doctorId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')._id;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/${doctorId}?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const appointments = await response.json();
        setTodayAppointments(Array.isArray(appointments) ? appointments : []);
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  }, [getAuthToken, user]);

  // إضافة مريض جديد
  const addPatient = async (patientData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token - user:', user);
        console.error('❌ لا يوجد token - localStorage user:', localStorage.getItem('user'));
        console.error('❌ لا يوجد token - localStorage currentUser:', localStorage.getItem('currentUser'));
        
        // محاولة إعادة تحميل الصفحة أولاً
        toast.error('مشكلة في المصادقة، جاري إعادة التحميل...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(t('patient_management.add_patient_success'));
        fetchPatients();
        fetchPatientStats();
        setShowAddForm(false);
      } else {
        throw new Error('Failed to add patient');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error(t('patient_management.error_adding_patient'));
      throw error;
    }
  };

  // حذف مريض
  const deletePatient = async (patientId) => {
    if (!window.confirm(t('patient_management.delete_patient_confirm'))) return;

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في deletePatient');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(t('patient_management.delete_patient_success'));
        fetchPatients();
        fetchPatientStats();
      } else {
        throw new Error('Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(t('patient_management.error_deleting_patient'));
    }
  };

  // تحديث بيانات المريض
  const updatePatient = async (patientId, updatedData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في updatePatient');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(t('patient_management.update_patient_success'));
        
        // تحديث قائمة المرضى
        setPatients(prev => prev.map(p => p._id === patientId ? data.patient : p));
        
        // تحديث المريض المحدد إذا كان هو نفسه
        if (selectedPatient && selectedPatient._id === patientId) {
          setSelectedPatient(data.patient);
        }
        
        // إعادة جلب الإحصائيات
        fetchPatientStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error(t('patient_management.error_updating_patient'));
      throw error;
    }
  };

  // جلب تفاصيل مريض واحد
  const fetchPatientDetails = async (patientId) => {
    try {
      console.log('🔍 fetchPatientDetails - patientId:', patientId);
      const token = getAuthToken();
      if (!token) {
        console.error('❌ لا يوجد token في fetchPatientDetails');
        return null;
      }

      console.log('🔍 fetchPatientDetails - making request to:', `${process.env.REACT_APP_API_URL}/doctors/me/patients/${patientId}`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      console.log('🔍 fetchPatientDetails - response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 fetchPatientDetails - response data:', data);
        return data.patient;
      } else {
        const errorData = await response.json();
        console.error('🔍 fetchPatientDetails - error response:', errorData);
        throw new Error('Failed to fetch patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    }
  };

  // فتح تفاصيل المريض
  const openPatientDetails = async (patientId) => {
    try {
      console.log('🔍 openPatientDetails - patientId:', patientId);
      const patient = await fetchPatientDetails(patientId);
      console.log('🔍 openPatientDetails - fetched patient:', patient);
      if (patient) {
        setSelectedPatient(patient);
        console.log('🔍 openPatientDetails - setSelectedPatient called');
      } else {
        toast.error(t('patient_management.error_loading_patient_details'));
      }
    } catch (error) {
      console.error('Error opening patient details:', error);
      toast.error(t('patient_management.error_loading_patient_details'));
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchPatientStats();
    fetchTodayAppointments();
  }, [fetchPatients, fetchPatientStats, fetchTodayAppointments]);

  return (
    <div className="patient-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('patient_management.title')}</h1>
          <button onClick={() => navigate('/doctor-dashboard')} className="btn-back">
            ← {t('patient_management.back_to_dashboard')}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* إحصائيات المرضى */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>{t('patient_management.total_patients')}</h3>
            <span className="stat-number">{patientStats.total || 0}</span>
          </div>
          <div className="stat-card">
            <h3>{t('patient_management.active_patients')}</h3>
            <span className="stat-number">{patientStats.active || 0}</span>
          </div>
          <div className="stat-card">
            <h3>{t('patient_management.male_patients')}</h3>
            <span className="stat-number">{patientStats.male || 0}</span>
          </div>
          <div className="stat-card">
            <h3>{t('patient_management.female_patients')}</h3>
            <span className="stat-number">{patientStats.female || 0}</span>
          </div>
        </div>

        {/* شريط البحث والإضافة */}
        <div className="actions-bar">
          <div className="search-section">
            <input
              type="text"
              placeholder={t('patient_management.search_by_name_phone')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-add-patient"
          >
            + {t('patient_management.add_patient')}
          </button>
        </div>

        {/* قائمة المرضى */}
        <div className="patients-list">
          {loading ? (
            <div className="loading">{t('patient_management.loading_patients')}</div>
          ) : patients.length > 0 ? (
            <div className="patients-grid">
              {patients.map(patient => (
                <div key={patient._id} className="patient-card">
                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p>{patient.phone}</p>
                    <p>{t('patient_management.age')}: {patient.age} | {t(`patient_management.${patient.gender}`)}</p>
                    <span className={`status ${patient.status}`}>
                      {t(`patient_management.patient_status_${patient.status}`)}
                    </span>
                  </div>
                  <div className="patient-actions">
                    <button
                      onClick={() => openPatientDetails(patient._id)}
                      className="btn-view"
                    >
                      {t('patient_management.view_patient')}
                    </button>
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="btn-edit"
                    >
                      {t('patient_management.edit_patient')}
                    </button>
                    <button
                      onClick={() => deletePatient(patient._id)}
                      className="btn-delete"
                    >
                      {t('patient_management.delete_patient')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-patients">{t('patient_management.no_patients')}</div>
          )}
        </div>

        {/* التنقل بين الصفحات */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="btn-page"
            >
              {t('patient_management.previous_page')}
            </button>
            <span className="page-info">
              {t('patient_management.page_of', { current: page, total: pagination.totalPages })}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={page === pagination.totalPages}
              className="btn-page"
            >
              {t('patient_management.next_page')}
            </button>
          </div>
        )}
      </div>

      {/* نموذج إضافة مريض */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddPatientForm
              onAdd={addPatient}
              onCancel={() => setShowAddForm(false)}
              todayAppointments={todayAppointments}
            />
          </div>
        </div>
      )}

      {/* تفاصيل المريض */}
      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={updatePatient}
          fetchPatientDetails={fetchPatientDetails}
          setSelectedPatient={setSelectedPatient}
        />
      )}
    </div>
  );
};

export default PatientManagementPage;
