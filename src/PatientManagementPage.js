import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
const PatientDetails = ({ patient, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const medicalReportsFileInputRef = useRef(null);
  const examinationsFileInputRef = useRef(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', '');

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patient._id}/${type}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        onUpdate(updatedPatient);
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

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patient._id}/${type}/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        onUpdate(updatedPatient);
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
  const [patients, setPatients] = useState([]);
  const [patientStats, setPatientStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);

  // جلب المرضى
  const fetchPatients = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchQuery
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients?${params}`, {
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
  }, [page, searchQuery, t]);

  // جلب إحصائيات المرضى
  const fetchPatientStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const stats = await response.json();
        setPatientStats(stats);
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    }
  }, []);

  // جلب مواعيد اليوم
  const fetchTodayAppointments = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/1?date=${today}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const appointments = await response.json();
        setTodayAppointments(Array.isArray(appointments) ? appointments : []);
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  }, []);

  // إضافة مريض جديد
  const addPatient = async (patientData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/patients/${patientId}`, {
        method: 'DELETE',
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
  const updatePatient = (updatedPatient) => {
    setPatients(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
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
                      onClick={() => setSelectedPatient(patient)}
                      className="btn-view"
                    >
                      {t('patient_management.view_patient')}
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
        />
      )}
    </div>
  );
};

export default PatientManagementPage;
