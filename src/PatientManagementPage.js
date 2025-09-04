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
const PatientDetails = ({ patient, onClose, onUpdate, fetchPatientDetails, setSelectedPatient }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [medicationOptions, setMedicationOptions] = useState({
    dosages: [],
    frequencies: [],
    durations: [],
    commonMedications: []
  });
  const [newPrescription, setNewPrescription] = useState({
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],
    diagnosis: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const medicalReportsFileInputRef = useRef(null);
  const examinationsFileInputRef = useRef(null);

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
        if (token) return token;
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من user:', error);
      }
    }
    
    // ثالثاً: جرب الحصول على الـ token من localStorage (profile)
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const token = profileData.token || profileData.accessToken;
        if (token) return token;
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من profile:', error);
      }
    }
    
    // رابعاً: جرب الحصول على الـ token من localStorage (currentUser)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const currentUserData = JSON.parse(currentUser);
        const token = currentUserData.token || currentUserData.accessToken;
        if (token) return token;
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من currentUser:', error);
      }
    }
    
    return null;
  }, [user]);

  // دالة لفتح PDF في modal
  const openPdfViewer = async (fileUrl, fileName) => {
    setPdfLoading(true);
    try {
      const secureUrl = await getPdfWithAuth(fileUrl);
      setViewingPdf({ url: secureUrl, name: fileName });
    } catch (error) {
      console.error('Error opening PDF:', error);
      setViewingPdf({ url: fileUrl, name: fileName });
    } finally {
      setPdfLoading(false);
    }
  };

  // دالة لتحميل PDF مع التوكن
  const getPdfWithAuth = async (fileUrl) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // استخدام الـ endpoint الآمن الجديد مع التوكن في الـ query parameter
      const secureUrl = `${process.env.REACT_APP_API_URL}/api/secure-files/${encodeURIComponent(fileUrl)}?token=${encodeURIComponent(token)}`;
      return secureUrl;
    } catch (error) {
      console.error('Error getting PDF with auth:', error);
      return fileUrl; // العودة للرابط الأصلي في حالة الخطأ
    }
  };

  // دالة لإغلاق PDF viewer
  const closePdfViewer = () => {
    setViewingPdf(null);
  };

  // جلب أدوية المريض
  const fetchMedications = useCallback(async () => {
    if (!patient?._id) return;
    
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/medications/patient/${patient._id}`, {
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
  }, [patient?._id, getAuthToken]);

  // جلب خيارات الأدوية
  const fetchMedicationOptions = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/medications/options`);
      const data = await response.json();
      if (response.ok) {
        setMedicationOptions(data.options);
      }
    } catch (error) {
      console.error('Error fetching medication options:', error);
    }
  }, []);

  // جلب الأدوية عند فتح تبويب الأدوية
  useEffect(() => {
    if (activeTab === 'medications') {
      fetchMedications();
      fetchMedicationOptions();
    }
  }, [activeTab, fetchMedications, fetchMedicationOptions]);

  // دوال إدارة الأدوية
  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const handleRemoveMedication = (index) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    
    if (newPrescription.medications.length === 0) {
      toast.error('يرجى إضافة دواء واحد على الأقل');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPrescription,
          patientId: patient._id,
          patientName: patient.name,
          patientPhone: patient.phone,
          doctorId: user?._id,
          doctorName: user?.first_name || 'دكتور'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم إضافة الوصفة بنجاح');
        setShowAddMedication(false);
        setNewPrescription({
          medications: [{
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
          }],
          diagnosis: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchMedications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'خطأ في إضافة الوصفة');
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // دالة طباعة الوصفة الطبية
  const printPrescription = (prescription) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>الوصفة الطبية</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            direction: rtl;
            text-align: right;
          }
          .prescription-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .prescription-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .prescription-date {
            font-size: 16px;
            color: #666;
          }
          .patient-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .patient-info h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
          }
          .diagnosis-section {
            margin-bottom: 25px;
          }
          .diagnosis-section h4 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .medications-section h4 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .medication-item {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fff;
          }
          .medication-number {
            display: inline-block;
            background: #3498db;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            text-align: center;
            line-height: 25px;
            margin-left: 10px;
            font-weight: bold;
          }
          .medication-name {
            font-weight: bold;
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          .medication-info {
            margin-bottom: 8px;
          }
          .medication-info span {
            display: inline-block;
            margin-left: 15px;
            padding: 3px 8px;
            background: #e3f2fd;
            border-radius: 3px;
            font-size: 14px;
          }
          .medication-instructions {
            color: #666;
            font-style: italic;
            margin-top: 8px;
          }
          .notes-section {
            margin-top: 25px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 5px;
          }
          .notes-section h4 {
            color: #856404;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .doctor-signature {
            margin-top: 40px;
            text-align: left;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="prescription-header">
          <div class="prescription-title">الوصفة الطبية</div>
          <div class="prescription-date">${formatDate(prescription.date)}</div>
        </div>
        
        <div class="patient-info">
          <h3>بيانات المريض</h3>
          <p><strong>الاسم:</strong> ${prescription.patientName}</p>
          <p><strong>رقم الهاتف:</strong> ${prescription.patientPhone}</p>
        </div>
        
        ${prescription.diagnosis ? `
          <div class="diagnosis-section">
            <h4>التشخيص:</h4>
            <p>${prescription.diagnosis}</p>
          </div>
        ` : ''}
        
        <div class="medications-section">
          <h4>الأدوية:</h4>
          ${prescription.medications.map((med, index) => `
            <div class="medication-item">
              <span class="medication-number">${index + 1}</span>
              <div class="medication-details">
                <div class="medication-name">${med.name}</div>
                <div class="medication-info">
                  <span class="dosage">الجرعة: ${med.dosage}</span>
                  <span class="frequency">التكرار: ${med.frequency}</span>
                  <span class="duration">المدة: ${med.duration}</span>
                </div>
                ${med.instructions ? `
                  <div class="medication-instructions">
                    <strong>تعليمات:</strong> ${med.instructions}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        ${prescription.notes ? `
          <div class="notes-section">
            <h4>ملاحظات:</h4>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}
        
        <div class="doctor-signature">
          <p><strong>اسم الطبيب:</strong> ${prescription.doctorName}</p>
          <p><strong>التوقيع:</strong> _________________</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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
          <button
            className={activeTab === 'medications' ? 'active' : ''}
            onClick={() => setActiveTab('medications')}
          >
            💊 الأدوية والوصفات
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
                        <h5>
                          {report.fileType === 'application/pdf' || report.title.includes('.pdf') ? '📄' : '📎'} 
                          {report.title}
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
                              const token = getAuthToken();
                              window.open(`${process.env.REACT_APP_API_URL}/api/secure-files/${encodeURIComponent(report.fileUrl)}?token=${encodeURIComponent(token || '')}`, '_blank');
                            }
                          }}
                          className="btn-view"
                        >
                          👁️ {t('patient_management.view_file')}
                        </button>
                        <a 
                          href={`${process.env.REACT_APP_API_URL}/api/secure-files/${encodeURIComponent(report.fileUrl)}?token=${encodeURIComponent(getAuthToken() || '')}`}
                          download={report.title}
                          className="btn-download"
                        >
                          ⬇️ تحميل
                        </a>
                        {(report.fileType === 'application/pdf' || report.title.includes('.pdf')) && (
                          <button 
                            onClick={() => openPdfViewer(report.fileUrl, report.title)}
                            className="btn-pdf"
                          >
                            📄 فتح PDF
                          </button>
                        )}
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
                        <h5>
                          {examination.fileType === 'application/pdf' || examination.title.includes('.pdf') ? '📄' : '📎'} 
                          {examination.title}
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
                              const token = getAuthToken();
                              window.open(`${process.env.REACT_APP_API_URL}/api/secure-files/${encodeURIComponent(examination.fileUrl)}?token=${encodeURIComponent(token || '')}`, '_blank');
                            }
                          }}
                          className="btn-view"
                        >
                          👁️ {t('patient_management.view_file')}
                        </button>
                        <a 
                          href={`${process.env.REACT_APP_API_URL}/api/secure-files/${encodeURIComponent(examination.fileUrl)}?token=${encodeURIComponent(getAuthToken() || '')}`}
                          download={examination.title}
                          className="btn-download"
                        >
                          ⬇️ تحميل
                        </a>
                        {(examination.fileType === 'application/pdf' || examination.title.includes('.pdf')) && (
                          <button 
                            onClick={() => openPdfViewer(examination.fileUrl, examination.title)}
                            className="btn-pdf"
                          >
                            📄 فتح PDF
                          </button>
                        )}
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
                <h3>💊 الوصفات الطبية</h3>
                <button 
                  onClick={() => setShowAddMedication(true)}
                  className="btn-add-prescription"
                >
                  + وصفة جديدة
                </button>
              </div>

              <div className="prescriptions-list">
                {medications.length === 0 ? (
                  <div className="no-prescriptions">
                    <p>لا توجد وصفات طبية لهذا المريض</p>
                  </div>
                ) : (
                  <div className="prescriptions-container">
                    {medications.map((prescription, index) => (
                      <div key={prescription._id || index} className="prescription-card">
                        <div className="prescription-header">
                          <div className="prescription-title">
                            <h4>الوصفة الطبية #{index + 1}</h4>
                            <span className="prescription-date">{formatDate(prescription.date)}</span>
                          </div>
                          <button 
                            onClick={() => printPrescription(prescription)}
                            className="btn-print"
                          >
                            🖨️ طباعة
                          </button>
                        </div>
                        
                        <div className="prescription-content">
                          {prescription.diagnosis && (
                            <div className="diagnosis-section">
                              <h5>التشخيص:</h5>
                              <p>{prescription.diagnosis}</p>
                            </div>
                          )}

                          <div className="medications-section">
                            <h5>الأدوية:</h5>
                            {prescription.medications.map((med, medIndex) => (
                              <div key={medIndex} className="medication-item">
                                <div className="medication-number">{medIndex + 1}.</div>
                                <div className="medication-details">
                                  <div className="medication-name">{med.name}</div>
                                  <div className="medication-info">
                                    <span className="dosage">الجرعة: {med.dosage}</span>
                                    <span className="frequency">التكرار: {med.frequency}</span>
                                    <span className="duration">المدة: {med.duration}</span>
                                  </div>
                                  {med.instructions && (
                                    <div className="medication-instructions">
                                      <strong>تعليمات:</strong> {med.instructions}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {prescription.notes && (
                            <div className="notes-section">
                              <h5>ملاحظات:</h5>
                              <p>{prescription.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="pdf-viewer-modal">
          <div className="pdf-viewer-content">
            <div className="pdf-viewer-header">
              <h3>📄 {viewingPdf.name}</h3>
              <button onClick={closePdfViewer} className="btn-close">×</button>
            </div>
            <div className="pdf-viewer-body">
              {pdfLoading && (
                <div className="pdf-loading">
                  <div className="loading-spinner"></div>
                  <p>جاري تحميل الملف...</p>
                </div>
              )}
              <div className="pdf-viewer-options">
                <div className="pdf-viewer-buttons">
                  <a 
                    href={viewingPdf.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-open-browser"
                    onClick={() => setPdfLoading(false)}
                  >
                    🌐 فتح في المتصفح
                  </a>
                  <a 
                    href={viewingPdf.url} 
                    download={viewingPdf.name}
                    className="btn-download-pdf"
                    onClick={() => setPdfLoading(false)}
                  >
                    ⬇️ تحميل الملف
                  </a>
                </div>
                
                {/* PDF Viewer - Fallback to direct link */}
                <div className="pdf-iframe-container">
                  <div className="pdf-fallback">
                    <p className="pdf-fallback-text">
                      📄 <strong>{viewingPdf.name}</strong>
                    </p>
                    <p className="pdf-fallback-instruction">
                      اضغط على الأزرار أدناه لفتح أو تحميل الملف
                    </p>
                    <div className="pdf-fallback-buttons">
                      <a 
                        href={viewingPdf.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-open-browser"
                        onClick={() => setPdfLoading(false)}
                      >
                        🌐 فتح في نافذة جديدة
                      </a>
                      <a 
                        href={viewingPdf.url} 
                        download={viewingPdf.name}
                        className="btn-download-pdf"
                        onClick={() => setPdfLoading(false)}
                      >
                        ⬇️ تحميل الملف
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="pdf-preview">
                  <p className="pdf-info">
                    📄 <strong>{viewingPdf.name}</strong>
                  </p>
                  <p className="pdf-instructions">
                    إذا لم يظهر الملف أعلاه، استخدم الأزرار أدناه
                  </p>
                  <div className="pdf-alternatives">
                    <h4>خيارات أخرى:</h4>
                    <ul>
                      <li>{t('patient_management.file_view_instructions')[0]}</li>
                      <li>{t('patient_management.file_view_instructions')[1]}</li>
                      <li>اضغط على "فتح في نافذة جديدة" في الأسفل</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="pdf-viewer-footer">
              <div className="footer-left">
                <a 
                  href={viewingPdf.url} 
                  download={viewingPdf.name}
                  className="btn-download"
                >
                  ⬇️ تحميل الملف
                </a>
                <a 
                  href={viewingPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-new"
                >
                  🔗 فتح في نافذة جديدة
                </a>
              </div>
              <button onClick={closePdfViewer} className="btn-cancel">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة وصفة طبية */}
      {showAddMedication && (
        <div className="modal-overlay" onClick={() => setShowAddMedication(false)}>
          <div className="modal-content prescription-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إضافة وصفة طبية جديدة</h2>
              <button 
                onClick={() => setShowAddMedication(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="prescription-form">
              <div className="prescription-form-header">
                <h3>إضافة وصفة طبية جديدة</h3>
                <p>للمريض: {patient.name}</p>
              </div>

              <div className="form-group">
                <label>التشخيص *</label>
                <input
                  type="text"
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription(prev => ({...prev, diagnosis: e.target.value}))}
                  placeholder="أدخل التشخيص الطبي"
                  required
                />
              </div>

              <div className="medications-section">
                <div className="section-header">
                  <h4>الأدوية</h4>
                  <button type="button" onClick={handleAddMedication} className="btn-add-medication">
                    + إضافة دواء آخر
                  </button>
                </div>

                {newPrescription.medications.map((medication, index) => (
                  <div key={index} className="medication-form">
                    <div className="medication-form-header">
                      <h5>دواء {index + 1}</h5>
                      {newPrescription.medications.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedication(index)}
                          className="btn-remove-medication"
                        >
                          ✕ حذف
                        </button>
                      )}
                    </div>

                    <div className="medication-fields">
                      <div className="field-group">
                        <label>اسم الدواء *</label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="مثال: باراسيتامول"
                          list={`medication-names-${index}`}
                          required
                        />
                        <datalist id={`medication-names-${index}`}>
                          {medicationOptions.commonMedications.map((med, medIndex) => (
                            <option key={medIndex} value={med} />
                          ))}
                        </datalist>
                      </div>

                      <div className="field-group">
                        <label>الجرعة *</label>
                        <select
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                        >
                          <option value="">اختر الجرعة</option>
                          {medicationOptions.dosages.map((dosage, dosageIndex) => (
                            <option key={dosageIndex} value={dosage}>{dosage}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group">
                        <label>التكرار *</label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                        >
                          <option value="">اختر التكرار</option>
                          {medicationOptions.frequencies.map((frequency, freqIndex) => (
                            <option key={freqIndex} value={frequency}>{frequency}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group">
                        <label>المدة *</label>
                        <select
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                        >
                          <option value="">اختر المدة</option>
                          {medicationOptions.durations.map((duration, durIndex) => (
                            <option key={durIndex} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group full-width">
                        <label>تعليمات خاصة</label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          placeholder="مثال: بعد الأكل، قبل النوم، مع الماء..."
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>ملاحظات إضافية</label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription(prev => ({...prev, notes: e.target.value}))}
                  placeholder="ملاحظات إضافية للوصفة الطبية"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  💾 حفظ الوصفة
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddMedication(false)}
                  className="btn-cancel"
                >
                  ❌ إلغاء
                </button>
              </div>
            </form>
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
    
    // رابعاً: جرب الحصول على الـ token من localStorage (profile)
    const savedProfile = localStorage.getItem('profile');
    console.log('🔍 getAuthToken - savedProfile:', savedProfile);
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        console.log('🔍 getAuthToken - profileData:', profileData);
        console.log('🔍 getAuthToken - profileData.token:', profileData.token);
        
        const token = profileData.token || profileData.accessToken;
        if (token) {
          console.log('🔍 getAuthToken - final token from profile:', token);
          return token;
        }
      } catch (error) {
        console.error('❌ خطأ في قراءة التوكن من profile:', error);
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
    </div>
  );
};

export default PatientManagementPage;
