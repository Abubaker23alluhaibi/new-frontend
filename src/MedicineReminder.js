import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useTranslation } from 'react-i18next';

function MedicineReminder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // جلب الأدوية من localStorage
  useEffect(() => {
    const savedMedicines = localStorage.getItem(`medicines_${user?._id}`);
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    }
  }, [user?._id]);

  // حفظ الأدوية في localStorage
  const saveMedicines = (newMedicines) => {
    localStorage.setItem(`medicines_${user?._id}`, JSON.stringify(newMedicines));
    setMedicines(newMedicines);
  };

  // إضافة دواء جديد
  const addMedicine = async (medicineData) => {
    setLoading(true);
    setError('');
    try {
      // تجهيز بيانات الإرسال
      const payload = {
        userId: user._id,
        medicineName: medicineData.name,
        dosage: medicineData.dosage,
        times: medicineData.reminders.map(r => r.time),
        startDate: new Date().toISOString().slice(0, 10), // يمكنك تعديلها حسب الحاجة
        endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10) // أسبوع افتراضي
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/medicine-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(t('error_adding_medicine') + ': ' + errorText);
      }
      // بعد الإضافة، أعد جلب قائمة الأدوية من السيرفر
      fetchMedicines();
    } catch (err) {
      setError(err.message || t('error_adding_medicine'));
      console.error('addMedicine error:', err);
    } finally {
      setLoading(false);
    }
  };

  // حذف دواء
  const deleteMedicine = (medicineId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
      const updatedMedicines = medicines.filter(m => m.id !== medicineId);
      saveMedicines(updatedMedicines);
    }
  };

  // تفعيل/إلغاء تفعيل دواء
  const toggleMedicine = (medicineId) => {
    const updatedMedicines = medicines.map(m => 
      m.id === medicineId ? { ...m, isActive: !m.isActive } : m
    );
    saveMedicines(updatedMedicines);
  };

  // إرسال إشعار تذكير
  const sendReminderNotification = async (medicine) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          type: 'medicine_reminder',
          message: t('medicine_reminder_message', { medicine: medicine.name, dosage: medicine.dosage }),
          phone: user.phone
        })
      });
      
      if (res.ok) {

      }
    } catch (err) {
      // فشل إرسال إشعار تذكير الدواء
    }
  };

  // فحص التذكيرات كل دقيقة
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      medicines.forEach(medicine => {
        if (medicine.isActive) {
          medicine.reminders.forEach(reminder => {
            const reminderTime = parseInt(reminder.time.split(':')[0]) * 60 + parseInt(reminder.time.split(':')[1]);
            if (Math.abs(currentTime - reminderTime) < 1) { // خلال دقيقة واحدة
              sendReminderNotification(medicine);
            }
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, [medicines, user?._id]);

  // دالة جلب الأدوية من السيرفر:
  const fetchMedicines = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/medicine-reminders/${user._id}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(t('error_fetching_medicines') + ': ' + errorText);
      }
      const data = await res.json();
      // معالجة كل عنصر ليحتوي على reminders مصفوفة كائنات
      const normalized = (data.reminders || []).map(med => ({
        ...med,
        reminders: Array.isArray(med.times) ? med.times.map(time => ({ time })) : [],
        name: med.medicineName || med.name || '',
        id: med._id || med.id || ''
      }));
      setMedicines(normalized);
    } catch (err) {
      setError(err.message || t('error_fetching_medicines'));
      console.error('fetchMedicines error:', err);
    } finally {
      setLoading(false);
    }
  };

  // استخدم fetchMedicines في useEffect بدلاً من localStorage:
  useEffect(() => {
    fetchMedicines();
  }, [user?._id]);

  if (!user) {
    return <div style={{textAlign:'center', marginTop:40}}>{t('login_required')}</div>;
  }

  return (
    <div style={{background:'#f7fafd', minHeight:'100vh', padding:'1rem'}}>
      {/* Header */}
      <div style={{maxWidth:800, margin:'0 auto'}}>
        <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #7c4dff22', padding:'2rem', marginBottom:'2rem'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem'}}>
            <h1 style={{color:'#7c4dff', margin:0, fontSize:'2rem', fontWeight:900}}>💊 {t('medicine_reminder_title')}</h1>
            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
              <button 
                onClick={() => setShowAdd(true)}
                style={{
                  background:'#4caf50',
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  padding:'0.7rem 1.5rem',
                  fontWeight:700,
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:'0.5rem'
                }}
              >
                ➕ {t('add_medicine')}
              </button>
              <button 
                onClick={() => navigate('/home')}
                style={{
                  background:'#00bcd4',
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  padding:'0.7rem 1.5rem',
                  fontWeight:700,
                  cursor:'pointer'
                }}
              >
                {t('back_to_home')}
              </button>
            </div>
          </div>
          <p style={{color:'#666', margin:0}}>
            {t('add_medicines_and_times')}
          </p>
        </div>

        {/* Statistics */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'2rem'}}>
          <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #7c4dff11', padding:'1.5rem', textAlign:'center'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>💊</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:'#4caf50', marginBottom:'0.5rem'}}>{medicines.length}</div>
            <div style={{color:'#666'}}>{t('total_medicines')}</div>
          </div>
          <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #7c4dff11', padding:'1.5rem', textAlign:'center'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>✅</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:'#2196f3', marginBottom:'0.5rem'}}>
              {medicines.filter(m => m.isActive).length}
            </div>
            <div style={{color:'#666'}}>{t('active_medicines')}</div>
          </div>
          <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #7c4dff11', padding:'1.5rem', textAlign:'center'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>⏰</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:'#ff9800', marginBottom:'0.5rem'}}>
              {medicines.reduce((total, m) => total + m.reminders.length, 0)}
            </div>
            <div style={{color:'#666'}}>{t('reminder_times')}</div>
          </div>
        </div>

        {/* Medicines List */}
        {medicines.length === 0 ? (
          <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #7c4dff22', padding:'3rem', textAlign:'center'}}>
            <div style={{fontSize:'4rem', marginBottom:'1rem'}}>💊</div>
            <h3 style={{color:'#7c4dff', marginBottom:'0.5rem'}}>{t('no_medicines')}</h3>
            <p style={{color:'#666', marginBottom:'2rem'}}>
              {t('add_first_medicine')}
            </p>
            <button 
              onClick={() => setShowAdd(true)}
              style={{
                background:'#4caf50',
                color:'#fff',
                border:'none',
                borderRadius:8,
                padding:'1rem 2rem',
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              {t('add_medicine_now')}
            </button>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {medicines.map(medicine => (
              <div key={medicine.id} style={{
                background:'#fff',
                borderRadius:16,
                boxShadow:'0 2px 12px #7c4dff11',
                padding:'1.5rem',
                borderLeft: `4px solid ${medicine.isActive ? '#4caf50' : '#ccc'}`
              }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                      <span style={{fontSize:'1.2rem'}}>💊</span>
                      <h3 style={{color:'#7c4dff', margin:'0 0 0.5rem 0', fontSize:'1.3rem'}}>
                        {medicine.name}
                      </h3>
                      <span style={{
                        background: medicine.isActive ? '#4caf50' : '#ccc',
                        color:'#fff',
                        padding:'0.2rem 0.8rem',
                        borderRadius:12,
                        fontSize:'0.8rem',
                        fontWeight:700
                      }}>
                        {medicine.isActive ? t('active') : t('inactive')}
                      </span>
                    </div>
                    <div style={{color:'#666', marginBottom:'0.5rem'}}>
                      💊 {t('dosage')}: {medicine.dosage}
                    </div>
                    <div style={{color:'#666', marginBottom:'0.5rem'}}>
                      📝 {t('description')}: {medicine.description || t('no_description')}
                    </div>
                    <div style={{color:'#666', marginBottom:'0.5rem'}}>
                      ⏰ {t('reminder_times_label')}
                    </div>
                    <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                      {medicine.reminders.map((reminder, index) => (
                        <span key={index} style={{
                          background:'#e3f2fd',
                          color:'#1976d2',
                          padding:'0.3rem 0.8rem',
                          borderRadius:12,
                          fontSize:'0.8rem',
                          fontWeight:600
                        }}>
                          {reminder.time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'flex', gap:'0.5rem'}}>
                    <button 
                      onClick={() => toggleMedicine(medicine.id)}
                      style={{
                        background: medicine.isActive ? '#ff9800' : '#4caf50',
                        color:'#fff',
                        border:'none',
                        borderRadius:8,
                        padding:'0.5rem 1rem',
                        fontWeight:600,
                        cursor:'pointer',
                        fontSize:'0.9rem'
                      }}
                    >
                      {medicine.isActive ? t('deactivate') : t('activate')}
                    </button>
                    <button 
                      onClick={() => deleteMedicine(medicine.id)}
                      style={{
                        background:'#e53935',
                        color:'#fff',
                        border:'none',
                        borderRadius:8,
                        padding:'0.5rem 1rem',
                        fontWeight:600,
                        cursor:'pointer',
                        fontSize:'0.9rem'
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAdd && (
        <AddMedicineForm 
          onClose={() => setShowAdd(false)}
          onAdd={addMedicine}
        />
      )}
    </div>
  );
}

// مكون إضافة دواء جديد
function AddMedicineForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    description: '',
    reminders: [{ time: '08:00' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const isMobile = window.innerWidth < 500;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { time: '08:00' }]
    }));
  };

  const removeReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const updateReminder = (index, time) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => i === index ? { time } : r)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim() || !formData.dosage.trim()) {
        throw new Error(t('fill_medicine_name_and_dosage'));
      }

      await onAdd(formData);
      onClose();
    } catch (err) {
      setError(err.message || t('error_adding_medicine'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position:'fixed',
      top:0,
      left:0,
      width:'100vw',
      height:'100vh',
      background:'rgba(0,0,0,0.5)',
      display:'flex',
      alignItems:'center', // إرجاع التمركز
      justifyContent:'center',
      zIndex:2000
    }}>
      <div style={{
        background:'#fff',
        borderRadius:18,
        boxShadow:'0 4px 24px #7c4dff33',
        padding: isMobile ? '1.2rem 0.7rem 0.7rem 0.7rem' : '2rem',
        maxWidth: isMobile ? '100vw' : 500,
        width: isMobile ? '100vw' : '90%',
        minHeight: isMobile ? '70vh' : undefined,
        maxHeight: isMobile ? '95vh' : '90vh',
        overflowY:'auto',
        position: 'relative',
        transition: 'all 0.3s',
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem'}}>
          <h2 style={{color:'#7c4dff', margin:0, fontWeight:700, fontSize: isMobile ? 18 : 22}}>💊 {t('add_medicine')}</h2>
          <button 
            onClick={onClose}
            style={{
              background:'none',
              border:'none',
              fontSize:'1.5rem',
              cursor:'pointer',
              color:'#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
          {/* معلومات الدواء */}
          <div style={{background:'#f8f9fa', borderRadius:12, padding:'1.5rem'}}>
            <h4 style={{color:'#4caf50', marginBottom:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem'}}>
              💊 {t('medicine_description')}
            </h4>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem'}}>
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>
                  {t('medicine_name')} *
                </label>
                <input
                  type="text"
                  placeholder={t('enter_medicine_name')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width:'100%',
                    padding:'0.8rem',
                    borderRadius:8,
                    border:'2px solid #e0e0e0',
                    fontSize:14,
                    transition:'border-color 0.3s'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>
                  {t('dosage')} *
                </label>
                <input
                  type="text"
                  placeholder={t('enter_dosage')}
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  style={{
                    width:'100%',
                    padding:'0.8rem',
                    borderRadius:8,
                    border:'2px solid #e0e0e0',
                    fontSize:14,
                    transition:'border-color 0.3s'
                  }}
                  required
                />
              </div>
            </div>
            <div style={{marginTop:'1rem'}}>
              <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>
                {t('medicine_description')}
              </label>
              <textarea
                placeholder={t('enter_medicine_description')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                style={{
                  width:'100%',
                  padding:'0.8rem',
                  borderRadius:8,
                  border:'2px solid #e0e0e0',
                  fontSize:14,
                  resize:'vertical'
                }}
              />
            </div>
          </div>

          {/* مواعيد التذكير */}
          <div style={{background:'#f8f9fa', borderRadius:12, padding:'1.5rem'}}>
            <h4 style={{color:'#ff9800', marginBottom:'1rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem'}}>
              ⏰ {t('reminder_times_header')}
            </h4>
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {formData.reminders.map((reminder, index) => (
                <div key={index} style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => updateReminder(index, e.target.value)}
                    style={{
                      padding:'0.8rem',
                      borderRadius:8,
                      border:'2px solid #e0e0e0',
                      fontSize:14
                    }}
                  />
                  {formData.reminders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      style={{
                        background:'#e53935',
                        color:'#fff',
                        border:'none',
                        borderRadius:8,
                        padding:'0.8rem 1rem',
                        fontWeight:600,
                        cursor:'pointer'
                      }}
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addReminder}
                style={{
                  background:'#2196f3',
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  padding:'0.8rem 1rem',
                  fontWeight:600,
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:'0.5rem'
                }}
              >
                ➕ {t('add_reminder_time')}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background:'#ffebee',
              color:'#c62828',
              padding:'1rem',
              borderRadius:8,
              fontSize:14
            }}>
              {error}
            </div>
          )}

          {/* الأزرار في الأسفل بشكل عادي */}
          <div style={{
            display:'flex', gap:'1rem', justifyContent:'flex-end',
            marginTop: isMobile ? 10 : 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background:'#ccc',
                color:'#333',
                border:'none',
                borderRadius:8,
                padding:'0.8rem 1.5rem',
                fontWeight:600,
                cursor:'pointer',
                fontSize: isMobile ? 15 : 16
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#4caf50',
                color:'#fff',
                border:'none',
                borderRadius:8,
                padding:'0.8rem 1.5rem',
                fontWeight:600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? 15 : 16
              }}
            >
              {loading ? t('adding_medicine') : t('add_medicine_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicineReminder; 