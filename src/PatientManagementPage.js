import React, { useState, useEffect, useCallback } from 'react';
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
    bloodType: 'غير محدد',
    chiefComplaint: '',
    chronicDiseases: '',
    otherConditions: '',
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
        bloodType: 'غير محدد',
        chiefComplaint: '',
        chronicDiseases: '',
        otherConditions: '',
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

        <div className="form-row">
          <div className="form-group">
            <label>{t('patient_management.blood_type')}</label>
            <select
              value={formData.bloodType}
              onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
            >
              <option value={t('patient_management.blood_type_undefined')}>{t('patient_management.blood_type_undefined')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t('patient_management.chief_complaint')}</label>
          <textarea
            value={formData.chiefComplaint}
            onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
            placeholder={t('patient_management.chief_complaint_placeholder')}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>{t('patient_management.chronic_diseases')}</label>
          <textarea
            value={formData.chronicDiseases}
            onChange={(e) => setFormData({...formData, chronicDiseases: e.target.value})}
            placeholder="اكتب {t('patient_management.chronic_diseases')} التي يعاني منها المريض..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>{t('patient_management.other_conditions')}</label>
          <textarea
            value={formData.otherConditions}
            onChange={(e) => setFormData({...formData, otherConditions: e.target.value})}
            placeholder="اكتب أي {t('patient_management.other_conditions')} أو حالات طبية..."
            rows="3"
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

// مكون تعديل المريض
const EditPatientForm = ({ patient, onUpdate, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: patient.name || '',
    age: patient.age || '',
    phone: patient.phone || '',
    gender: patient.gender || '',
    address: patient.address || '',
    bloodType: patient.bloodType || 'غير محدد',
    chiefComplaint: patient.chiefComplaint || '',
    chronicDiseases: patient.chronicDiseases || '',
    otherConditions: patient.otherConditions || '',
    emergencyContact: {
      name: patient.emergencyContact?.name || '',
      phone: patient.emergencyContact?.phone || '',
      relationship: patient.emergencyContact?.relationship || ''
    },
    notes: patient.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(patient._id, formData);
      onCancel();
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-patient-modal">
        <div className="modal-header">
          <h2>{t('patient_management.edit_patient_data')}</h2>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('patient_management.patient_name_label')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('patient_management.age_label')} *</label>
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
              <label>{t('patient_management.phone_label')} *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('patient_management.gender_label')} *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                required
              >
                <option value="">{t('patient_management.select_gender')}</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('patient_management.address_label')}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('patient_management.blood_type')}</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              >
                <option value={t('patient_management.blood_type_undefined')}>{t('patient_management.blood_type_undefined')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('patient_management.chief_complaint')}</label>
            <textarea
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
              placeholder={t('patient_management.chief_complaint_placeholder')}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>{t('patient_management.chronic_diseases')}</label>
            <textarea
              value={formData.chronicDiseases}
              onChange={(e) => setFormData({...formData, chronicDiseases: e.target.value})}
              placeholder="اكتب {t('patient_management.chronic_diseases')} التي يعاني منها المريض..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>{t('patient_management.other_conditions')}</label>
            <textarea
              value={formData.otherConditions}
              onChange={(e) => setFormData({...formData, otherConditions: e.target.value})}
              placeholder="اكتب أي {t('patient_management.other_conditions')} أو حالات طبية..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>جهة الاتصال في الطوارئ</label>
            <div className="emergency-contact-fields">
              <input
                type="text"
                placeholder="اسم جهة الاتصال"
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {...formData.emergencyContact, name: e.target.value}
                })}
              />
              <input
                type="tel"
                placeholder={t('patient_management.emergency_contact_phone_placeholder')}
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                })}
              />
              <input
                type="text"
                placeholder={t('patient_management.emergency_contact_relationship_placeholder')}
                value={formData.emergencyContact.relationship}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('patient_management.notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              {t('patient_management.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('patient_management.saving') : t('patient_management.save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// مكون تفاصيل المريض مع رفع الملفات
const PatientDetails = ({ patient, medications = [], onClose, onUpdate, fetchPatientDetails, setSelectedPatient }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  console.log('🔍 PatientDetails - Component rendered with patient:', patient);
  console.log('🔍 PatientDetails - User:', user);
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(''); // 'pdf' or 'image'
  const [viewingPdf, setViewingPdf] = useState(null);


  // دالة مساعدة للحصول على التوكن
  const getAuthToken = useCallback(() => {
    // أولاً: جرب الحصول على الـ token من AuthContext
    if (user && user.token) {
      return user.token;
    }
    
    // ثانياً: جرب الحصول على الـ token من localStorage (user)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const token = userData.token || userData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
    // ثالثاً: جرب الحصول على الـ token من localStorage (profile)
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const token = profileData.token || profileData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
    // رابعاً: جرب الحصول على الـ token من localStorage (currentUser)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const currentUserData = JSON.parse(currentUser);
        const token = currentUserData.token || currentUserData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
    return null;
  }, [user]);






  // دالة اختيار نوع الملف
  const handleFileTypeSelect = (type) => {
    setFileType(type);
    setSelectedFile(null);
  };

  // دالة اختيار الملف
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // دالة لعرض PDF
  const openPdfViewer = (fileUrl, fileName) => {
    setViewingPdf({ url: fileUrl, name: fileName });
  };

  // دالة لإغلاق عارض PDF
  const closePdfViewer = () => {
    setViewingPdf(null);
  };

  // دالة رفع الملف الجديدة
  const handleFileUpload = async () => {
    if (!selectedFile || !patient?._id) {
      toast.error('يرجى اختيار ملف ومريض أولاً');
      return;
    }

    setUploadingFile(true);
    
    // الحصول على التوكن من localStorage مباشرة
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    
    if (!token) {
      toast.error('يرجى تسجيل الدخول مرة أخرى');
      setUploadingFile(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name);
    formData.append('description', `ملف ${fileType === 'pdf' ? 'PDF' : 'صورة'}`);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patient._id}/medical-reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('تم رفع الملف بنجاح');
        if (onUpdate) {
          onUpdate(patient._id, patient);
        }
        setSelectedFile(null);
        setFileType('');
      } else {
        toast.error(`خطأ: ${result.error || 'فشل في رفع الملف'}`);
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setUploadingFile(false);
    }
  };

  // حذف دواء
  const deleteMedication = async (medicationId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${patient._id}/medications/${medicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف الدواء بنجاح');
      } else {
        throw new Error('Failed to delete medication');
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('خطأ في حذف الدواء');
    }
  };

  // تحميل الأدوية عند فتح تبويب الأدوية
  useEffect(() => {
    if (activeTab === 'medications') {
    }
  }, [activeTab]);



  





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

      console.log('🔍 Deleting file for patient:', patient._id, 'Type:', type, 'File ID:', fileId);
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
          // تحديث قائمة المرضى أيضاً
          onUpdate(patient._id, updatedPatient);
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
            className={activeTab === 'medications' ? 'active' : ''}
            onClick={() => setActiveTab('medications')}
          >
            الأدوية
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
                {patient.bloodType && patient.bloodType !== 'غير محدد' && (
                  <div className="info-item">
                    <label>{t('patient_management.blood_type')}:</label>
                    <span>{patient.bloodType}</span>
                  </div>
                )}
                {patient.chiefComplaint && (
                  <div className="info-item full-width">
                    <label>{t('patient_management.chief_complaint')}:</label>
                    <span>{patient.chiefComplaint}</span>
                  </div>
                )}
                {patient.chronicDiseases && (
                  <div className="info-item full-width">
                    <label>{t('patient_management.chronic_diseases')}:</label>
                    <span>{patient.chronicDiseases}</span>
                  </div>
                )}
                {patient.otherConditions && (
                  <div className="info-item full-width">
                    <label>{t('patient_management.other_conditions')}:</label>
                    <span>{patient.otherConditions}</span>
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
                <div style={{ 
                  border: '2px dashed #0A8F82', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa'
                }}>
                  {/* اختيار نوع الملف */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      اختر نوع الملف:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleFileTypeSelect('pdf')}
                        style={{
                          backgroundColor: fileType === 'pdf' ? '#0A8F82' : '#f0f0f0',
                          color: fileType === 'pdf' ? 'white' : 'black',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => handleFileTypeSelect('image')}
                        style={{
                          backgroundColor: fileType === 'image' ? '#0A8F82' : '#f0f0f0',
                          color: fileType === 'image' ? 'white' : 'black',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        🖼️ صورة
                      </button>
                    </div>
                  </div>
                  
                  {/* اختيار الملف */}
                  {fileType && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        اختر الملف:
                      </label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept={fileType === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.gif'}
                        style={{ 
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* عرض الملف المختار */}
                  {selectedFile && (
                    <div style={{ 
                      marginBottom: '15px', 
                      padding: '10px', 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '4px',
                      border: '1px solid #4caf50'
                    }}>
                      <strong>✅ الملف المختار:</strong> {selectedFile.name}
                      <br />
                      <small>الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                      <br />
                      <small>النوع: {fileType === 'pdf' ? 'PDF' : 'صورة'}</small>
                    </div>
                  )}
                  
                  {/* زر الرفع */}
                  <button
                    onClick={handleFileUpload}
                    disabled={uploadingFile || !selectedFile}
                    style={{
                      backgroundColor: uploadingFile || !selectedFile ? '#ccc' : '#0A8F82',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: uploadingFile || !selectedFile ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {uploadingFile ? '⏳ جاري الرفع...' : '📤 رفع الملف'}
                  </button>
                </div>
              </div>

              <div className="files-list">
                {patient.medicalReports?.length > 0 ? (
                  patient.medicalReports.map((report, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <h5>
                          📎 {report.title}
                        </h5>
                        <p>{report.description}</p>
                        <small>{new Date(report.uploadDate).toLocaleDateString('ar-EG')}</small>
                      </div>
                      <div className="file-actions">
                        <button 
                          onClick={() => {
                            if (report.fileType === 'application/pdf' || report.title.includes('.pdf')) {
                              openPdfViewer(report.fileUrl, report.title);
                            } else {
                              window.open(report.fileUrl, '_blank');
                            }
                          }}
                          className="btn-view"
                        >
                          👁️ {t('patient_management.view_file')}
                        </button>
                        <a 
                          href={report.fileUrl}
                          download={report.title}
                          className="btn-download"
                        >
                          ⬇️ تحميل
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
                <div style={{ 
                  border: '2px dashed #0A8F82', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa'
                }}>
                  {/* اختيار نوع الملف */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      اختر نوع الملف:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleFileTypeSelect('pdf')}
                        style={{
                          backgroundColor: fileType === 'pdf' ? '#0A8F82' : '#f0f0f0',
                          color: fileType === 'pdf' ? 'white' : 'black',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => handleFileTypeSelect('image')}
                        style={{
                          backgroundColor: fileType === 'image' ? '#0A8F82' : '#f0f0f0',
                          color: fileType === 'image' ? 'white' : 'black',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        🖼️ صورة
                      </button>
                    </div>
                  </div>
                  
                  {/* اختيار الملف */}
                  {fileType && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        اختر الملف:
                      </label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept={fileType === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.gif'}
                        style={{ 
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* عرض الملف المختار */}
                  {selectedFile && (
                    <div style={{ 
                      marginBottom: '15px', 
                      padding: '10px', 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '4px',
                      border: '1px solid #4caf50'
                    }}>
                      <strong>✅ الملف المختار:</strong> {selectedFile.name}
                      <br />
                      <small>الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                      <br />
                      <small>النوع: {fileType === 'pdf' ? 'PDF' : 'صورة'}</small>
                    </div>
                  )}
                  
                  {/* زر الرفع */}
                  <button
                    onClick={handleFileUpload}
                    disabled={uploadingFile || !selectedFile}
                    style={{
                      backgroundColor: uploadingFile || !selectedFile ? '#ccc' : '#0A8F82',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: uploadingFile || !selectedFile ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {uploadingFile ? '⏳ جاري الرفع...' : '📤 رفع الملف'}
                  </button>
                </div>
              </div>

              <div className="files-list">
                {patient.examinations?.length > 0 ? (
                  patient.examinations.map((examination, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <h5>
                          📎 {examination.title}
                        </h5>
                        <p>{examination.description}</p>
                        <small>{new Date(examination.uploadDate).toLocaleDateString('ar-EG')}</small>
                      </div>
                      <div className="file-actions">
                        <button 
                          onClick={() => {
                            if (examination.fileType === 'application/pdf' || examination.title.includes('.pdf')) {
                              openPdfViewer(examination.fileUrl, examination.title);
                            } else {
                              window.open(examination.fileUrl, '_blank');
                            }
                          }}
                          className="btn-view"
                        >
                          👁️ {t('patient_management.view_file')}
                        </button>
                        <a 
                          href={examination.fileUrl}
                          download={examination.title}
                          className="btn-download"
                        >
                          ⬇️ تحميل
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

          {activeTab === 'medications' && (
            <div className="medications-section">
              <div className="medications-header">
                <h3>{t('patient_management.medications')}</h3>
                <div className="medications-actions">
                  <button
                    onClick={() => {
                      // إرسال إشارة للمكون الرئيسي لفتح نموذج إضافة وصفة طبية
                      window.dispatchEvent(new CustomEvent('openAddMedication'));
                    }}
                    className="btn-add-prescription"
                  >
                    + {t('patient_management.add_prescription')}
                  </button>
                </div>
              </div>

              <div className="prescriptions-list">
                {medications.length > 0 ? (
                  <div className="prescriptions-container">
                    {(() => {
                      // تجميع الأدوية حسب الوصفة الطبية
                      const groupedMedications = medications.reduce((groups, medication) => {
                        const prescriptionId = medication.prescriptionId || 'individual';
                        if (!groups[prescriptionId]) {
                          groups[prescriptionId] = [];
                        }
                        groups[prescriptionId].push(medication);
                        return groups;
                      }, {});

                      return Object.entries(groupedMedications).map(([prescriptionId, meds]) => (
                        <div key={prescriptionId} className="prescription-group">
                          <div className="prescription-group-header">
                            <h4>
                              {prescriptionId === 'individual' ? t('patient_management.prescription_medications') : `${t('patient_management.prescription_title')} - ${meds[0].prescriptionId}`}
                            </h4>
                            <div className="prescription-header-actions">
                              <span className="prescription-date">
                                {new Date(meds[0].createdAt).toLocaleDateString('ar-EG')}
                              </span>
                              <button
                                onClick={() => {
                                  // طباعة هذه الوصفة المحددة
                                  window.dispatchEvent(new CustomEvent('printSpecificPrescription', { 
                                    detail: { 
                                      prescriptionId, 
                                      medications: meds,
                                      patient: patient,
                                      doctor: user
                                    } 
                                  }));
                                }}
                                className="btn-print-prescription-small"
                                style={{ 
                                  background: '#27ae60', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '4px 8px', 
                                  borderRadius: '4px', 
                                  marginLeft: '8px',
                                  fontSize: '12px'
                                }}
                              >
                                🖨️ {t('patient_management.print_prescription')}
                              </button>
                            </div>
                          </div>
                          
                          <div className="medications-in-prescription">
                            {meds.map((medication, index) => (
                              <div key={medication._id || index} className="medication-card">
                                <div className="medication-header">
                                  <div className="medication-title">
                                    <h5>{medication.name}</h5>
                                  </div>
                                  <div className="medication-actions">
                                    <button
                                      onClick={() => {
                                        window.dispatchEvent(new CustomEvent('openEditMedication', { detail: medication }));
                                      }}
                                      className="btn-edit"
                                      style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '8px' }}
                                    >
                                      {t('patient_management.edit_medication')}
                                    </button>
                                    <button
                                      onClick={() => deleteMedication(medication._id)}
                                      className="btn-delete"
                                      style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
                                    >
                                      {t('patient_management.delete_medication')}
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="medication-details">
                                  <div className="detail-row">
                                    <span className="detail-label">{t('patient_management.medication_dosage')}:</span>
                                    <span className="detail-value">{medication.dosage}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="detail-label">{t('patient_management.medication_frequency')}:</span>
                                    <span className="detail-value">{medication.frequency}</span>
                                  </div>
                                  {medication.duration && (
                                    <div className="detail-row">
                                      <span className="detail-label">{t('patient_management.medication_duration')}:</span>
                                      <span className="detail-value">{medication.duration}</span>
                                    </div>
                                  )}
                                  {medication.instructions && (
                                    <div className="detail-row">
                                      <span className="detail-label">{t('patient_management.medication_instructions')}:</span>
                                      <span className="detail-value">{medication.instructions}</span>
                                    </div>
                                  )}
                                  {medication.notes && (
                                    <div className="detail-row">
                                      <span className="detail-label">{t('patient_management.medication_notes')}:</span>
                                      <span className="detail-value">{medication.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="no-prescriptions">
                    <p>لا توجد أدوية مسجلة لهذا المريض</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            height: '90%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>📄 {viewingPdf.name}</h3>
              <button 
                onClick={closePdfViewer}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, padding: '15px' }}>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingPdf.url)}&embedded=true`}
                title={viewingPdf.name}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '4px'
                }}
                onError={() => {
                  // إذا فشل Google Docs، جرب PDF.js
                  const iframe = document.querySelector('iframe[title="' + viewingPdf.name + '"]');
                  if (iframe) {
                    iframe.src = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(viewingPdf.url)}`;
                  }
                }}
              />
            </div>
            <div style={{
              padding: '15px',
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <a 
                href={viewingPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#0A8F82',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                🌐 فتح في نافذة جديدة
              </a>
              <a 
                href={viewingPdf.url}
                download={viewingPdf.name}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                ⬇️ تحميل الملف
              </a>
            </div>
          </div>
        </div>
      )}

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
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [showPrintPrescription, setShowPrintPrescription] = useState(false);
  const [medications, setMedications] = useState([]);

  // دالة مساعدة للحصول على التوكن
  const getAuthToken = useCallback(() => {
    // أولاً: جرب الحصول على الـ token من AuthContext
    if (user && user.token) {
      return user.token;
    }
    
    // ثانياً: جرب الحصول على الـ token من localStorage (user)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const token = userData.token || userData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
    // ثالثاً: جرب الحصول على الـ token من localStorage (profile)
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const token = profileData.token || profileData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
    // رابعاً: جرب الحصول على الـ token من localStorage (currentUser)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const currentUserData = JSON.parse(currentUser);
        const token = currentUserData.token || currentUserData.accessToken;
        if (token && token.length > 10) return token;
      } catch (error) {
        // تجاهل الخطأ
      }
    }
    
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

      console.log('🔍 fetchPatients - token found:', token.substring(0, 20) + '...');
      console.log('🔍 fetchPatients - API URL:', process.env.REACT_APP_API_URL);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchQuery
      });

      const url = `${process.env.REACT_APP_API_URL}/doctors/me/patients?${params}`;
      console.log('🔍 fetchPatients - full URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('🔍 fetchPatients - response status:', response.status);
      console.log('🔍 fetchPatients - response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 fetchPatients - response data:', data);
        setPatients(data.patients || []);
        setPagination(data.pagination || {});
      } else {
        const errorText = await response.text();
        console.error('❌ fetchPatients - error response:', errorText);
        throw new Error(`Failed to fetch patients: ${response.status} ${errorText}`);
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

      console.log('🔍 fetchPatientStats - token found:', token.substring(0, 20) + '...');
      const url = `${process.env.REACT_APP_API_URL}/doctors/me/patients/stats`;
      console.log('🔍 fetchPatientStats - URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('🔍 fetchPatientStats - response status:', response.status);

      if (response.ok) {
        const stats = await response.json();
        console.log('🔍 fetchPatientStats - stats:', stats);
        setPatientStats(stats);
      } else {
        const errorText = await response.text();
        console.error('❌ fetchPatientStats - error response:', errorText);
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
        // جلب أدوية المريض
        await fetchMedications(patientId);
        console.log('🔍 openPatientDetails - setSelectedPatient called');
      } else {
        toast.error(t('patient_management.error_loading_patient_details'));
      }
    } catch (error) {
      console.error('Error opening patient details:', error);
      toast.error(t('patient_management.error_loading_patient_details'));
    }
  };

  const openEditPatient = async (patientId) => {
    try {
      console.log('🔍 openEditPatient - patientId:', patientId);
      const patient = await fetchPatientDetails(patientId);
      console.log('🔍 openEditPatient - fetched patient:', patient);
      if (patient) {
        setEditingPatient(patient);
        console.log('🔍 openEditPatient - setEditingPatient called');
      } else {
        toast.error(t('patient_management.error_loading_patient_details'));
      }
    } catch (error) {
      console.error('Error opening edit patient:', error);
      toast.error(t('patient_management.error_loading_patient_details'));
    }
  };

  // جلب أدوية المريض
  const fetchMedications = useCallback(async (patientId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${patientId}/medications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  }, [getAuthToken]);

  // إضافة وصفة طبية جديدة (عدة أدوية)
  const addPrescription = async (prescriptionData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // إضافة كل دواء منفرداً
      const promises = prescriptionData.medications.map(medication => 
        fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${selectedPatient._id}/medications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(medication),
          credentials: 'include'
        })
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        toast.success(`تم إضافة الوصفة الطبية بنجاح (${prescriptionData.medications.length} دواء)`);
        setShowAddMedication(false);
        // تحديث قائمة الأدوية
        await fetchMedications(selectedPatient._id);
      } else {
        throw new Error('Failed to add some medications');
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('خطأ في إضافة الوصفة الطبية');
    }
  };

  // تحديث دواء
  const updateMedication = async (medicationId, updatedData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/me/patients/${selectedPatient._id}/medications/${medicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم تحديث الدواء بنجاح');
        setEditingMedication(null);
      } else {
        throw new Error('Failed to update medication');
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      toast.error('خطأ في تحديث الدواء');
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchPatientStats();
    fetchTodayAppointments();
  }, [fetchPatients, fetchPatientStats, fetchTodayAppointments]);

  // مستمعي الأحداث للأدوية
  useEffect(() => {
    const handleOpenAddMedication = () => {
      setShowAddMedication(true);
    };

    const handleOpenEditMedication = (event) => {
      setEditingMedication(event.detail);
    };

    const handlePrintPrescription = () => {
      setShowPrintPrescription(true);
    };

    // مستمع لطباعة وصفة محددة
    const handlePrintSpecificPrescription = (event) => {
      const { prescriptionId, medications, patient, doctor } = event.detail;
      
      // منع السلوك الافتراضي
      event.preventDefault();
      event.stopPropagation();
      
      // الحصول على اللغة الحالية
      const currentLanguage = localStorage.getItem('i18nextLng') || 'ar';
      const isRTL = currentLanguage === 'ar' || currentLanguage === 'ku';
      
      // طباعة الوصفة المحددة مباشرة باستخدام setTimeout لتجنب تجميد الصفحة
      setTimeout(() => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        // التأكد من أن النافذة فُتحت بنجاح
        if (!printWindow) {
          alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح للنوافذ المنبثقة.');
          return;
        }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${currentLanguage}">
        <head>
          <meta charset="UTF-8">
          <title>${currentLanguage === 'ar' ? 'الوصفة الطبية' : currentLanguage === 'en' ? 'Medical Prescription' : 'نوسراوە پزیشکییە'}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              line-height: 1.4;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 0;
            }
            
            .prescription-container {
              background: #fff;
              padding: 10px;
              max-width: 100%;
              page-break-inside: avoid;
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #000;
            }
            
            .clinic-name {
              font-size: 20px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
            }
            
            .clinic-url {
              font-size: 12px;
              color: #000;
              margin-bottom: 10px;
            }
            
            .prescription-title {
              font-size: 18px;
              font-weight: bold;
              color: #000;
              margin-bottom: 15px;
            }
            
            .patient-info {
              background: #fff;
              padding: 10px;
              margin-bottom: 15px;
              border: 1px solid #000;
            }
            
            .patient-info h3 {
              color: #000;
              margin-bottom: 8px;
              font-size: 14px;
              font-weight: bold;
            }
            
            .info-grid {
              display: block;
            }
            
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: none;
            }
            
            .info-label {
              font-weight: bold;
              color: #000;
            }
            
            .info-value {
              color: #000;
            }
            
            .medications-section {
              margin-bottom: 15px;
            }
            
            .medications-title {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin-bottom: 10px;
              text-align: center;
              background: #fff;
              padding: 5px;
              border: 1px solid #000;
            }
            
            .medication-group {
              margin-bottom: 15px;
              border: 1px solid #000;
              page-break-inside: avoid;
            }
            
            .group-header {
              background: #fff;
              color: #000;
              padding: 8px;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 1px solid #000;
            }
            
            .medication-list {
              padding: 10px;
            }
            
            .medication-item {
              margin-bottom: 10px;
              padding: 8px;
              background: #fff;
              border: 1px solid #000;
            }
            
            .medication-item:last-child {
              margin-bottom: 0;
            }
            
            .medication-name {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
            }
            
            .medication-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 5px;
              flex-wrap: wrap;
              gap: 10px;
            }
            
            .detail-item {
              display: inline;
              padding: 0;
            }
            
            .detail-label {
              font-weight: bold;
              color: #000;
            }
            
            .detail-value {
              color: #000;
            }
            
            .instructions {
              background: #fff;
              padding: 5px;
              border: 1px solid #000;
              margin-top: 5px;
            }
            
            .instructions strong {
              color: #000;
            }
            
            .footer {
              margin-top: 20px;
              text-align: center;
              padding-top: 10px;
              border-top: 1px solid #000;
            }
            
            .doctor-signature {
              margin-bottom: 10px;
            }
            
            .doctor-name {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              margin-bottom: 3px;
            }
            
            .doctor-specialty {
              color: #000;
              margin-bottom: 10px;
            }
            
            .signature-line {
              border-bottom: 1px solid #000;
              width: 150px;
              margin: 0 auto 5px;
              height: 20px;
            }
            
            .print-date {
              color: #000;
              font-size: 12px;
            }
            
            .clinic-footer {
              margin-top: 15px;
              text-align: center;
              color: #000;
              font-size: 10px;
            }
            
            @media print {
              .no-print {
                display: none !important;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="prescription-container">
            <div class="prescription-content">
              <div class="header">
                <div class="clinic-name">${currentLanguage === 'ar' ? 'منصة طبيب العراق' : currentLanguage === 'en' ? 'Iraqi Doctor Platform' : 'پلاتفۆرمی پزیشکی عێراق'}</div>
                <div class="clinic-url">www.tabibq.com</div>
                <div class="prescription-title">${currentLanguage === 'ar' ? 'وصفة طبية' : currentLanguage === 'en' ? 'Medical Prescription' : 'نوسراوە پزیشکییە'}</div>
              </div>
              
              <div class="patient-info">
                <h3>${currentLanguage === 'ar' ? 'معلومات المريض' : currentLanguage === 'en' ? 'Patient Information' : 'زانیاری نەخۆش'}</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">${currentLanguage === 'ar' ? 'الاسم:' : currentLanguage === 'en' ? 'Name:' : 'ناو:'}</span>
                    <span class="info-value">${patient.name}</span>
                  </div>
                </div>
              </div>
              
              <div class="medications-section">
                <div class="medications-title">${currentLanguage === 'ar' ? 'الأدوية الموصوفة' : currentLanguage === 'en' ? 'Prescribed Medications' : 'دەرمانە پێنوسراوەکان'}</div>
                <div class="medication-group">
                  <div class="group-header">
                    ${prescriptionId === 'individual' ? 
                      (currentLanguage === 'ar' ? 'أدوية فردية' : currentLanguage === 'en' ? 'Individual Medications' : 'دەرمانە تاکەکان') : 
                      (currentLanguage === 'ar' ? 'الوصفة الطبية - ' + prescriptionId : currentLanguage === 'en' ? 'Prescription - ' + prescriptionId : 'نوسراوە پزیشکییە - ' + prescriptionId)
                    }
                  </div>
                  <div class="medication-list">
                    ${medications.map((medication, index) => `
                      <div class="medication-item">
                        <div class="medication-name">${index + 1}. ${medication.name}</div>
                        <div class="medication-details">
                          <span class="detail-value">${medication.dosage}</span>
                          <span class="detail-label">${medication.frequency}</span>
                          ${medication.duration ? `<span class="detail-label">${medication.duration}</span>` : ''}
                        </div>
                        ${medication.instructions ? `
                          <div class="instructions">
                            <strong>${currentLanguage === 'ar' ? 'التعليمات:' : currentLanguage === 'en' ? 'Instructions:' : 'ڕێنماییەکان:'}</strong> ${medication.instructions}
                          </div>
                        ` : ''}
                        ${medication.notes ? `
                          <div class="instructions">
                            <strong>${currentLanguage === 'ar' ? 'ملاحظات:' : currentLanguage === 'en' ? 'Notes:' : 'تێبینییەکان:'}</strong> ${medication.notes}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div class="doctor-signature">
                  <div class="doctor-name">${currentLanguage === 'ar' ? 'د. ' : currentLanguage === 'en' ? 'Dr. ' : 'د. '}${doctor.name}</div>
                  <div class="doctor-specialty">${doctor.specialty || (currentLanguage === 'ar' ? 'طبيب عام' : currentLanguage === 'en' ? 'General Practitioner' : 'پزیشکی گشتی')}</div>
                  <div class="signature-line"></div>
                  <div class="print-date">${currentLanguage === 'ar' ? 'تاريخ الطباعة: ' : currentLanguage === 'en' ? 'Print Date: ' : 'بەرواری چاپ: '}${new Date().toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : currentLanguage === 'en' ? 'en-US' : 'ku')}</div>
                </div>
                
                <div class="clinic-footer">
                  <p>${currentLanguage === 'ar' ? 'هذه الوصفة الطبية صادرة من منصة طبيب العراق' : currentLanguage === 'en' ? 'This prescription is issued by Iraqi Doctor Platform' : 'ئەم نوسراوە پزیشکییە لەلایەن پلاتفۆرمی پزیشکی عێراقەوە دەرکراوە'}</p>
                  <p>${currentLanguage === 'ar' ? 'للاستفسارات: www.tabibq.com' : currentLanguage === 'en' ? 'For inquiries: www.tabibq.com' : 'بۆ پرسیارەکان: www.tabibq.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // انتظار تحميل الصفحة قبل الطباعة
      printWindow.onload = function() {
        try {
          printWindow.print();
          // إغلاق النافذة بعد الطباعة
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 1000);
        } catch (error) {
          console.error('خطأ في الطباعة:', error);
          alert('حدث خطأ في الطباعة. يرجى المحاولة مرة أخرى.');
        }
      };
      
        // معالجة الأخطاء
        printWindow.onerror = function() {
          console.error('خطأ في تحميل نافذة الطباعة');
          alert('حدث خطأ في تحميل نافذة الطباعة. يرجى المحاولة مرة أخرى.');
        };
      }, 100); // تأخير قصير لتجنب تجميد الصفحة
    };

    window.addEventListener('openAddMedication', handleOpenAddMedication);
    window.addEventListener('openEditMedication', handleOpenEditMedication);
    window.addEventListener('printPrescription', handlePrintPrescription);
    window.addEventListener('printSpecificPrescription', handlePrintSpecificPrescription);

    return () => {
      window.removeEventListener('openAddMedication', handleOpenAddMedication);
      window.removeEventListener('openEditMedication', handleOpenEditMedication);
      window.removeEventListener('printPrescription', handlePrintPrescription);
      window.removeEventListener('printSpecificPrescription', handlePrintSpecificPrescription);
    };
  }, []);

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
                      onClick={() => openEditPatient(patient._id)}
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
          medications={medications}
          onClose={() => setSelectedPatient(null)}
          onUpdate={updatePatient}
          fetchPatientDetails={fetchPatientDetails}
          setSelectedPatient={setSelectedPatient}
        />
      )}

      {/* تعديل المريض */}
      {editingPatient && (
        <EditPatientForm
          patient={editingPatient}
          onUpdate={updatePatient}
          onCancel={() => setEditingPatient(null)}
        />
      )}

      {/* إضافة وصفة طبية جديدة */}
      {selectedPatient && showAddMedication && (
        <AddPrescriptionForm
          onAdd={addPrescription}
          onCancel={() => setShowAddMedication(false)}
        />
      )}

      {/* تعديل دواء */}
      {selectedPatient && editingMedication && (
        <EditMedicationForm
          medication={editingMedication}
          onUpdate={updateMedication}
          onCancel={() => setEditingMedication(null)}
        />
      )}

      {/* طباعة الوصفة الطبية */}
      {selectedPatient && showPrintPrescription && (
        <PrintPrescriptionModal
          patient={selectedPatient}
          medications={medications || []}
          doctor={user}
          onClose={() => setShowPrintPrescription(false)}
          t={t}
        />
      )}
    </div>
  );
};

// مكون إضافة وصفة طبية جديدة (عدة أدوية)
const AddPrescriptionForm = ({ onAdd, onCancel }) => {
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    notes: '',
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      notes: ''
    }]
  });
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        notes: ''
      }]
    }));
  };

  const removeMedication = (index) => {
    if (prescriptionData.medications.length > 1) {
      setPrescriptionData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من وجود تشخيص
    if (!prescriptionData.diagnosis.trim()) {
      alert('يرجى إدخال التشخيص');
      return;
    }

    // التحقق من وجود دواء واحد على الأقل مع البيانات المطلوبة
    const validMedications = prescriptionData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );

    if (validMedications.length === 0) {
      alert('يرجى إدخال دواء واحد على الأقل مع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      // إنشاء معرف فريد للوصفة
      const prescriptionId = `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // إضافة معرف الوصفة لكل دواء
      const medicationsWithPrescriptionId = validMedications.map(med => ({
        ...med,
        prescriptionId
      }));

      await onAdd({
        prescriptionId,
        diagnosis: prescriptionData.diagnosis,
        notes: prescriptionData.notes,
        medications: medicationsWithPrescriptionId
      });
      
      // إعادة تعيين النموذج
      setPrescriptionData({
        diagnosis: '',
        notes: '',
        medications: [{
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          notes: ''
        }]
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content prescription-modal">
        <div className="modal-header">
          <h2>إضافة وصفة طبية جديدة</h2>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="prescription-form">
          {/* معلومات الوصفة */}
          <div className="prescription-info">
            <h3>معلومات الوصفة</h3>
            <div className="field-group full-width">
              <label>التشخيص *</label>
              <textarea
                value={prescriptionData.diagnosis}
                onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}
                required
                placeholder="أدخل التشخيص"
                rows="3"
              />
            </div>
            
            <div className="field-group full-width">
              <label>ملاحظات الطبيب</label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                placeholder="ملاحظات إضافية للوصفة"
                rows="2"
              />
            </div>
          </div>

          {/* الأدوية */}
          <div className="medications-section">
            <div className="section-header">
              <h3>الأدوية</h3>
              <button type="button" onClick={addMedication} className="btn-add-medication">
                + إضافة دواء آخر
              </button>
            </div>

            {prescriptionData.medications.map((medication, index) => (
              <div key={index} className="medication-form">
                <div className="medication-form-header">
                  <h5>دواء #{index + 1}</h5>
                  {prescriptionData.medications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedication(index)} 
                      className="btn-remove-medication"
                    >
                      حذف
                    </button>
                  )}
                </div>

                <div className="medication-fields">
                  <div className="field-group">
                    <label>اسم الدواء *</label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      required
                      placeholder="أدخل اسم الدواء"
                    />
                  </div>
                  
                  <div className="field-group">
                    <label>الجرعة *</label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      required
                      placeholder="مثال: 500 مجم"
                    />
                  </div>
                  
                  <div className="field-group">
                    <label>التكرار *</label>
                    <select
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      required
                    >
                      <option value="">اختر التكرار</option>
                      <option value="مرة واحدة يومياً">مرة واحدة يومياً</option>
                      <option value="مرتين يومياً">مرتين يومياً</option>
                      <option value="ثلاث مرات يومياً">ثلاث مرات يومياً</option>
                      <option value="أربع مرات يومياً">أربع مرات يومياً</option>
                      <option value="كل 6 ساعات">كل 6 ساعات</option>
                      <option value="كل 8 ساعات">كل 8 ساعات</option>
                      <option value="كل 12 ساعة">كل 12 ساعة</option>
                      <option value="عند الحاجة">عند الحاجة</option>
                    </select>
                  </div>
                  
                  <div className="field-group">
                    <label>المدة</label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="مثال: 7 أيام"
                    />
                  </div>
                  
                  <div className="field-group full-width">
                    <label>التعليمات</label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      placeholder="تعليمات خاصة للدواء"
                      rows="2"
                    />
                  </div>
                  
                  <div className="field-group full-width">
                    <label>ملاحظات إضافية</label>
                    <textarea
                      value={medication.notes}
                      onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                      placeholder="ملاحظات إضافية"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              إلغاء
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ الوصفة الطبية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// مكون تعديل دواء
const EditMedicationForm = ({ medication, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: medication.name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency || '',
    duration: medication.duration || '',
    instructions: medication.instructions || '',
    notes: medication.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(medication._id, formData);
    } catch (error) {
      console.error('Error updating medication:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content prescription-modal">
        <div className="modal-header">
          <h2>تعديل الدواء</h2>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="prescription-form">
          <div className="medication-fields">
            <div className="field-group">
              <label>اسم الدواء *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="field-group">
              <label>الجرعة *</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                required
              />
            </div>
            
            <div className="field-group">
              <label>التكرار *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                required
              >
                <option value="">اختر التكرار</option>
                <option value="مرة واحدة يومياً">مرة واحدة يومياً</option>
                <option value="مرتين يومياً">مرتين يومياً</option>
                <option value="ثلاث مرات يومياً">ثلاث مرات يومياً</option>
                <option value="أربع مرات يومياً">أربع مرات يومياً</option>
                <option value="كل 6 ساعات">كل 6 ساعات</option>
                <option value="كل 8 ساعات">كل 8 ساعات</option>
                <option value="كل 12 ساعة">كل 12 ساعة</option>
                <option value="عند الحاجة">عند الحاجة</option>
              </select>
            </div>
            
            <div className="field-group">
              <label>المدة</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
            
            <div className="field-group full-width">
              <label>التعليمات</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows="3"
              />
            </div>
            
            <div className="field-group full-width">
              <label>ملاحظات إضافية</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="2"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              إلغاء
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// مكون طباعة الوصفة الطبية
const PrintPrescriptionModal = ({ patient, medications, doctor, onClose, t }) => {
  const printPrescription = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // التأكد من أن النافذة فُتحت بنجاح
    if (!printWindow) {
      alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح للنوافذ المنبثقة.');
      return;
    }
    
    // الحصول على اللغة الحالية
    const currentLanguage = localStorage.getItem('i18nextLng') || 'ar';
    const isRTL = currentLanguage === 'ar' || currentLanguage === 'ku';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${currentLanguage}">
      <head>
        <meta charset="UTF-8">
        <title>${currentLanguage === 'ar' ? 'الوصفة الطبية' : currentLanguage === 'en' ? 'Medical Prescription' : 'نوسراوە پزیشکییە'}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          
          .prescription-container {
            background: #fff;
            padding: 10px;
            max-width: 100%;
            page-break-inside: avoid;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #000;
          }
          
          .clinic-name {
            font-size: 20px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
          }
          
          .clinic-url {
            font-size: 12px;
            color: #000;
            margin-bottom: 10px;
          }
          
          .prescription-title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
          }
          
          .patient-info {
            background: #fff;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #000;
          }
          
          .patient-info h3 {
            color: #000;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: bold;
          }
          
          .info-grid {
            display: block;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: none;
          }
          
          .info-label {
            font-weight: bold;
            color: #000;
          }
          
          .info-value {
            color: #000;
          }
          
          .medications-section {
            margin-bottom: 15px;
          }
          
          .medications-title {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
            text-align: center;
            background: #fff;
            padding: 5px;
            border: 1px solid #000;
          }
          
          .medication-group {
            margin-bottom: 15px;
            border: 1px solid #000;
            page-break-inside: avoid;
          }
          
          .group-header {
            background: #fff;
            color: #000;
            padding: 8px;
            font-weight: bold;
            font-size: 14px;
            border-bottom: 1px solid #000;
          }
          
          .medication-list {
            padding: 10px;
          }
          
          .medication-item {
            margin-bottom: 10px;
            padding: 8px;
            background: #fff;
            border: 1px solid #000;
          }
          
          .medication-item:last-child {
            margin-bottom: 0;
          }
          
          .medication-name {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
          }
          
          .medication-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .detail-item {
            display: inline;
            padding: 0;
          }
          
          .detail-label {
            font-weight: bold;
            color: #000;
          }
          
          .detail-value {
            color: #000;
          }
          
          .instructions {
            background: #fff;
            padding: 5px;
            border: 1px solid #000;
            margin-top: 5px;
          }
          
          .instructions strong {
            color: #000;
          }
          
          .footer {
            margin-top: 20px;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          
          .doctor-signature {
            margin-bottom: 10px;
          }
          
          .doctor-name {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 3px;
          }
          
          .doctor-specialty {
            color: #000;
            margin-bottom: 10px;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            width: 150px;
            margin: 0 auto 5px;
            height: 20px;
          }
          
          .print-date {
            color: #000;
            font-size: 12px;
          }
          
          .clinic-footer {
            margin-top: 15px;
            text-align: center;
            color: #000;
            font-size: 10px;
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
            <div class="header">
              <div class="clinic-name">${currentLanguage === 'ar' ? 'منصة طبيب العراق' : currentLanguage === 'en' ? 'Iraqi Doctor Platform' : 'پلاتفۆرمی پزیشکی عێراق'}</div>
              <div class="clinic-url">www.tabibq.com</div>
              <div class="prescription-title">${currentLanguage === 'ar' ? 'وصفة طبية' : currentLanguage === 'en' ? 'Medical Prescription' : 'نوسراوە پزیشکییە'}</div>
            </div>
            
            <div class="patient-info">
              <h3>${currentLanguage === 'ar' ? 'معلومات المريض' : currentLanguage === 'en' ? 'Patient Information' : 'زانیاری نەخۆش'}</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">${currentLanguage === 'ar' ? 'الاسم:' : currentLanguage === 'en' ? 'Name:' : 'ناو:'}</span>
                  <span class="info-value">${patient.name}</span>
                </div>
              </div>
            </div>
            
            <div class="medications-section">
              <div class="medications-title">${currentLanguage === 'ar' ? 'الأدوية الموصوفة' : currentLanguage === 'en' ? 'Prescribed Medications' : 'دەرمانە پێنوسراوەکان'}</div>
              ${(() => {
                // تجميع الأدوية حسب الوصفة الطبية
                const groupedMedications = medications.reduce((groups, medication) => {
                  const prescriptionId = medication.prescriptionId || 'individual';
                  if (!groups[prescriptionId]) {
                    groups[prescriptionId] = [];
                  }
                  groups[prescriptionId].push(medication);
                  return groups;
                }, {});

                return Object.entries(groupedMedications).map(([prescriptionId, meds]) => `
                  <div class="medication-group">
                    <div class="group-header">
                      ${prescriptionId === 'individual' ? 'أدوية منفردة' : `الوصفة الطبية - ${meds[0].prescriptionId}`}
                    </div>
                    <div class="medication-list">
                      ${meds.map((medication, index) => `
                        <div class="medication-item">
                          <div class="medication-name">${index + 1}. ${medication.name}</div>
                          <div class="medication-details">
                              <span class="detail-value">${medication.dosage}</span>
                            <span class="detail-label">${medication.frequency}</span>
                            ${medication.duration ? `<span class="detail-label">${medication.duration}</span>` : ''}
                          </div>
                          ${medication.instructions ? `
                            <div class="instructions">
                              <strong>التعليمات:</strong> ${medication.instructions}
                            </div>
                          ` : ''}
                          ${medication.notes ? `
                            <div class="instructions">
                              <strong>ملاحظات:</strong> ${medication.notes}
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('');
              })()}
            </div>
            
            <div class="footer">
              <div class="doctor-signature">
                <div class="doctor-name">د. ${doctor.name}</div>
                <div class="doctor-specialty">${doctor.specialty}</div>
                <div class="signature-line"></div>
                <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
              </div>
            </div>
            
            <div class="clinic-footer">
              <p>منصة طبيب العراق الرقمية</p>
              <p>www.tabibq.com | info@tabibq.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // انتظار تحميل الصفحة قبل الطباعة
    printWindow.onload = function() {
      try {
        printWindow.focus();
        printWindow.print();
        // إغلاق النافذة بعد الطباعة
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      } catch (error) {
        console.error('خطأ في الطباعة:', error);
        alert('حدث خطأ في الطباعة. يرجى المحاولة مرة أخرى.');
      }
    };
    
    // معالجة الأخطاء
    printWindow.onerror = function() {
      console.error('خطأ في تحميل نافذة الطباعة');
      alert('حدث خطأ في تحميل نافذة الطباعة. يرجى المحاولة مرة أخرى.');
    };
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content print-modal">
        <div className="modal-header">
          <h2>{t('patient_management.print_prescription')}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        
        <div className="print-preview">
          <div className="preview-header">
            <h3>{t('patient_management.prescription_preview')}</h3>
            <p>{t('patient_management.print_prescription_description')}</p>
          </div>
          
          <div className="preview-info">
            <div className="info-item">
              <strong>{t('patient_management.patient')}:</strong> {patient.name}
            </div>
            <div className="info-item">
              <strong>{t('patient_management.medication_count')}:</strong> {medications.length}
            </div>
            <div className="info-item">
              <strong>{t('patient_management.doctor')}:</strong> د. {doctor.name}
            </div>
          </div>
          
          <div className="print-actions">
            <button onClick={onClose} className="btn-cancel">
              {t('patient_management.cancel')}
            </button>
            <button onClick={printPrescription} className="btn-print">
              🖨️ {t('patient_management.print_prescription')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagementPage;
