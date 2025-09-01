import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { normalizePhone } from './utils/phoneUtils';

// ===== Modal إضافة مريض جديد =====
export const AddPatientModal = ({ onClose, onAdd }) => {
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.phone || !formData.gender) {
      toast.error('يرجى ملء الحقول المطلوبة');
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
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        notes: ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          background: '#4caf50',
          color: '#fff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>➕ إضافة مريض جديد</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الاسم *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>العمر *</label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>رقم الهاتف *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الجنس *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
                required
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>العنوان</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة المريض'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Modal تفاصيل المريض =====
export const PatientDetailsModal = ({ patient, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 800,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          background: '#2196f3',
          color: '#fff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
            👁️ تفاصيل المريض: {patient.name}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* المعلومات الأساسية */}
            <div>
              <h4 style={{ color: '#2196f3', marginBottom: '1rem', fontSize: '1.2rem' }}>📋 المعلومات الأساسية</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <strong>الاسم:</strong> {patient.name}
                </div>
                <div>
                  <strong>العمر:</strong> {patient.age} سنة
                </div>
                <div>
                  <strong>رقم الهاتف:</strong> {patient.phone}
                </div>
                <div>
                  <strong>الجنس:</strong> {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                </div>
                <div>
                  <strong>الحالة:</strong> 
                  <span style={{
                    background: patient.status === 'active' ? '#4caf50' : '#ff9800',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem'
                  }}>
                    {patient.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                {patient.address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>العنوان:</strong> {patient.address}
                  </div>
                )}
              </div>
            </div>

            {/* معلومات الطوارئ */}
            {patient.emergencyContact && (patient.emergencyContact.name || patient.emergencyContact.phone) && (
              <div>
                <h4 style={{ color: '#ff9800', marginBottom: '1rem', fontSize: '1.2rem' }}>🚨 معلومات الطوارئ</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {patient.emergencyContact.name && (
                    <div><strong>الاسم:</strong> {patient.emergencyContact.name}</div>
                  )}
                  {patient.emergencyContact.phone && (
                    <div><strong>رقم الهاتف:</strong> {patient.emergencyContact.phone}</div>
                  )}
                  {patient.emergencyContact.relationship && (
                    <div><strong>العلاقة:</strong> {patient.emergencyContact.relationship}</div>
                  )}
                </div>
              </div>
            )}

            {/* التاريخ الطبي */}
            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <div>
                <h4 style={{ color: '#e91e63', marginBottom: '1rem', fontSize: '1.2rem' }}>📚 التاريخ الطبي</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {patient.medicalHistory.map((history, index) => (
                    <div key={index} style={{
                      background: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: 8,
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {history.condition && <div><strong>الحالة:</strong> {history.condition}</div>}
                        {history.diagnosis && <div><strong>التشخيص:</strong> {history.diagnosis}</div>}
                        {history.treatment && <div><strong>العلاج:</strong> {history.treatment}</div>}
                        {history.date && <div><strong>التاريخ:</strong> {new Date(history.date).toLocaleDateString('ar-EG')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الحساسية */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div>
                <h4 style={{ color: '#f44336', marginBottom: '1rem', fontSize: '1.2rem' }}>⚠️ الحساسية</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} style={{
                      background: '#ffebee',
                      color: '#c62828',
                      padding: '0.3rem 0.8rem',
                      borderRadius: 16,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* الأدوية */}
            {patient.medications && patient.medications.length > 0 && (
              <div>
                <h4 style={{ color: '#4caf50', marginBottom: '1rem', fontSize: '1.2rem' }}>💊 الأدوية</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {patient.medications.map((medication, index) => (
                    <div key={index} style={{
                      background: '#f1f8e9',
                      padding: '1rem',
                      borderRadius: 8,
                      border: '1px solid #c8e6c9'
                    }}>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {medication.name && <div><strong>اسم الدواء:</strong> {medication.name}</div>}
                        {medication.dosage && <div><strong>الجرعة:</strong> {medication.dosage}</div>}
                        {medication.frequency && <div><strong>التكرار:</strong> {medication.frequency}</div>}
                        {medication.startDate && <div><strong>تاريخ البدء:</strong> {new Date(medication.startDate).toLocaleDateString('ar-EG')}</div>}
                        {medication.endDate && <div><strong>تاريخ الانتهاء:</strong> {new Date(medication.endDate).toLocaleDateString('ar-EG')}</div>}
                        <div>
                          <strong>الحالة:</strong> 
                          <span style={{
                            background: medication.isActive ? '#4caf50' : '#ff9800',
                            color: '#fff',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 12,
                            fontSize: '0.8rem',
                            marginLeft: '0.5rem'
                          }}>
                            {medication.isActive ? 'نشط' : 'متوقف'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* التقارير الطبية */}
            {patient.medicalReports && patient.medicalReports.length > 0 && (
              <div>
                <h4 style={{ color: '#9c27b0', marginBottom: '1rem', fontSize: '1.2rem' }}>📄 التقارير الطبية</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {patient.medicalReports.map((report, index) => (
                    <div key={index} style={{
                      background: '#f3e5f5',
                      padding: '1rem',
                      borderRadius: 8,
                      border: '1px solid #ce93d8'
                    }}>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {report.title && <div><strong>العنوان:</strong> {report.title}</div>}
                        {report.description && <div><strong>الوصف:</strong> {report.description}</div>}
                        {report.fileUrl && (
                          <div>
                            <strong>الملف:</strong> 
                            <a 
                              href={report.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#9c27b0', 
                                textDecoration: 'none', 
                                marginLeft: '0.5rem',
                                fontWeight: 600
                              }}
                            >
                              📎 عرض الملف
                            </a>
                          </div>
                        )}
                        {report.uploadDate && <div><strong>تاريخ الرفع:</strong> {new Date(report.uploadDate).toLocaleDateString('ar-EG')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الفحوصات */}
            {patient.examinations && patient.examinations.length > 0 && (
              <div>
                <h4 style={{ color: '#607d8b', marginBottom: '1rem', fontSize: '1.2rem' }}>🔬 الفحوصات</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {patient.examinations.map((examination, index) => (
                    <div key={index} style={{
                      background: '#eceff1',
                      padding: '1rem',
                      borderRadius: 8,
                      border: '1px solid #b0bec5'
                    }}>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {examination.title && <div><strong>العنوان:</strong> {examination.title}</div>}
                        {examination.description && <div><strong>الوصف:</strong> {examination.description}</div>}
                        {examination.fileUrl && (
                          <div>
                            <strong>الملف:</strong> 
                            <a 
                              href={examination.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#607d8b', 
                                textDecoration: 'none', 
                                marginLeft: '0.5rem',
                                fontWeight: 600
                              }}
                            >
                              📎 عرض الملف
                            </a>
                          </div>
                        )}
                        {examination.uploadDate && <div><strong>تاريخ الرفع:</strong> {new Date(examination.uploadDate).toLocaleDateString('ar-EG')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الملاحظات */}
            {patient.notes && (
              <div>
                <h4 style={{ color: '#795548', marginBottom: '1rem', fontSize: '1.2rem' }}>📝 الملاحظات</h4>
                <div style={{
                  background: '#efebe9',
                  padding: '1rem',
                  borderRadius: 8,
                  border: '1px solid #d7ccc8'
                }}>
                  {patient.notes}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              onClick={onClose}
              style={{
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== واجهة إدارة المرضى الرئيسية =====
export const PatientManagement = ({ doctorId, onClose }) => {
  const [patients, setPatients] = useState([]);
  const [patientStats, setPatientStats] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientPage, setPatientPage] = useState(1);
  const [patientPagination, setPatientPagination] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(false);

  // دالة جلب المرضى
  const fetchPatients = useCallback(async (page = 1, search = '') => {
    if (!doctorId) return;
    
    setLoadingPatients(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${doctorId}/patients?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients || []);
        setPatientPagination(data.pagination || {});
      } else {
        toast.error(data.error || 'خطأ في جلب المرضى');
      }
    } catch (error) {
      console.error('خطأ في جلب المرضى:', error);
      toast.error('خطأ في جلب المرضى');
    } finally {
      setLoadingPatients(false);
    }
  }, [doctorId]);

  // دالة جلب إحصائيات المرضى
  const fetchPatientStats = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${doctorId}/patients/stats`);
      const data = await response.json();
      
      if (response.ok) {
        setPatientStats(data);
      }
    } catch (error) {
      console.error('خطأ في جلب إحصائيات المرضى:', error);
    }
  }, [doctorId]);

  // دالة إضافة مريض جديد
  const addPatient = async (patientData) => {
    if (!doctorId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${doctorId}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('تم إضافة المريض بنجاح');
        setShowAddPatientModal(false);
        fetchPatients(patientPage, patientSearchQuery);
        fetchPatientStats();
      } else {
        toast.error(data.error || 'خطأ في إضافة المريض');
      }
    } catch (error) {
      console.error('خطأ في إضافة المريض:', error);
      toast.error('خطأ في إضافة المريض');
    }
  };

  // دالة حذف مريض
  const deletePatient = async (patientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض؟')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patients/${patientId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('تم حذف المريض بنجاح');
        fetchPatients(patientPage, patientSearchQuery);
        fetchPatientStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'خطأ في حذف المريض');
      }
    } catch (error) {
      console.error('خطأ في حذف المريض:', error);
      toast.error('خطأ في حذف المريض');
    }
  };

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    if (doctorId) {
      fetchPatients(1, '');
      fetchPatientStats();
    }
  }, [doctorId, fetchPatients, fetchPatientStats]);

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 1200,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            background: '#2196f3',
            color: '#fff',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>🏥 إدارة المرضى</h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
            {/* Stats */}
            {patientStats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: '#e3f2fd',
                  padding: '1rem',
                  borderRadius: 12,
                  textAlign: 'center',
                  border: '2px solid #2196f3'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2196f3' }}>{patientStats.totalPatients}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>إجمالي المرضى</div>
                </div>
                <div style={{
                  background: '#e8f5e8',
                  padding: '1rem',
                  borderRadius: 12,
                  textAlign: 'center',
                  border: '2px solid #4caf50'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4caf50' }}>{patientStats.activePatients}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>المرضى النشطين</div>
                </div>
                <div style={{
                  background: '#fff3e0',
                  padding: '1rem',
                  borderRadius: 12,
                  textAlign: 'center',
                  border: '2px solid #ff9800'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9800' }}>{patientStats.malePatients}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>الذكور</div>
                </div>
                <div style={{
                  background: '#fce4ec',
                  padding: '1rem',
                  borderRadius: 12,
                  textAlign: 'center',
                  border: '2px solid #e91e63'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e91e63' }}>{patientStats.femalePatients}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>الإناث</div>
                </div>
              </div>
            )}

            {/* Search and Add */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="🔍 البحث بالاسم أو رقم الهاتف..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button
                onClick={() => {
                  fetchPatients(1, patientSearchQuery);
                  setPatientPage(1);
                }}
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔍 بحث
              </button>
              <button
                onClick={() => setShowAddPatientModal(true)}
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ➕ إضافة مريض
              </button>
            </div>

            {/* Patients List */}
            {loadingPatients ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>جاري تحميل المرضى...</div>
              </div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>لا توجد مرضى</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                {patients.map((patient) => (
                  <div key={patient._id} style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: '1rem',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {patient.gender === 'male' ? '👨' : '👩'}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>
                          {patient.name}
                        </h3>
                        <span style={{
                          background: patient.status === 'active' ? '#4caf50' : '#ff9800',
                          color: '#fff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 12,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {patient.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        📞 {patient.phone} | 🎂 {patient.age} سنة
                        {patient.address && ` | 📍 ${patient.address}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientDetailsModal(true);
                        }}
                        style={{
                          background: '#2196f3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        👁️ عرض
                      </button>
                      <button
                        onClick={() => deletePatient(patient._id)}
                        style={{
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {patientPagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => {
                    const newPage = patientPage - 1;
                    setPatientPage(newPage);
                    fetchPatients(newPage, patientSearchQuery);
                  }}
                  disabled={patientPage <= 1}
                  style={{
                    background: patientPage <= 1 ? '#ccc' : '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    cursor: patientPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ⬅️ السابق
                </button>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#f0f0f0',
                  borderRadius: 6,
                  fontWeight: 700
                }}>
                  {patientPage} من {patientPagination.totalPages}
                </span>
                <button
                  onClick={() => {
                    const newPage = patientPage + 1;
                    setPatientPage(newPage);
                    fetchPatients(newPage, patientSearchQuery);
                  }}
                  disabled={patientPage >= patientPagination.totalPages}
                  style={{
                    background: patientPage >= patientPagination.totalPages ? '#ccc' : '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    cursor: patientPage >= patientPagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  التالي ➡️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onAdd={addPatient}
        />
      )}

      {showPatientDetailsModal && selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientDetailsModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </>
  );
};
