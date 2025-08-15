import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function WorkTimesEditor({ profile, onClose, onUpdate }) {
  const { t } = useTranslation();
  const [workTimes, setWorkTimes] = useState([]);
  const [vacationDays, setVacationDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('workTimes'); // 'workTimes' or 'vacationDays'

  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    if (profile?.workTimes) {
      setWorkTimes(profile.workTimes);
    }
    if (profile?.vacationDays) {
      setVacationDays(profile.vacationDays);
    }
  }, [profile]);

  // دوال أوقات العمل
  const addWorkTime = () => {
    setWorkTimes([...workTimes, { day: '', from: '09:00', to: '17:00' }]);
  };

  const removeWorkTime = (index) => {
    setWorkTimes(workTimes.filter((_, i) => i !== index));
  };

  const updateWorkTime = (index, field, value) => {
    const updated = [...workTimes];
    updated[index] = { ...updated[index], [field]: value };
    setWorkTimes(updated);
  };

  // دوال أيام الإجازات
  const addVacationDay = () => {
    setVacationDays([...vacationDays, { 
      type: 'single', // 'single', 'monthly', 'yearly'
      date: '', 
      month: '', 
      year: new Date().getFullYear(),
      description: '',
      isRecurring: false
    }]);
  };

  const removeVacationDay = (index) => {
    setVacationDays(vacationDays.filter((_, i) => i !== index));
  };

  const updateVacationDay = (index, field, value) => {
    const updated = [...vacationDays];
    updated[index] = { ...updated[index], [field]: value };
    setVacationDays(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 WorkTimesEditor: إرسال أوقات الدوام وأيام الإجازات المحدثة:', { workTimes, vacationDays });
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor/${profile._id}/work-schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workTimes, vacationDays })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ WorkTimesEditor: تم تحديث الجدول بنجاح:', data);
        setSuccess(t('changes_saved'));
        // إرسال البيانات المحدثة فوراً مع البيانات المستلمة من السيرفر
        setTimeout(() => {
          const updatedData = {
            workTimes: data.workTimes || workTimes,
            vacationDays: data.vacationDays || vacationDays
          };
          console.log('🔄 WorkTimesEditor: إرسال البيانات المحدثة:', updatedData);
          onUpdate(updatedData);
        }, 1500);
      } else {
        console.error('❌ WorkTimesEditor: خطأ من السيرفر:', data);
        setError(data.error || 'حدث خطأ أثناء تحديث الجدول');
      }
    } catch (err) {
      console.error('❌ WorkTimesEditor: خطأ في تحديث الجدول:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* تبويبات التنقل */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '1.5rem', 
        background: '#f5f5f5', 
        borderRadius: '8px', 
        padding: '0.3rem' 
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('workTimes')}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            border: 'none',
            background: activeTab === 'workTimes' ? '#0A8F82' : 'transparent',
            color: activeTab === 'workTimes' ? '#fff' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          ⏰ {t('work_times')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vacationDays')}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            border: 'none',
            background: activeTab === 'vacationDays' ? '#0A8F82' : 'transparent',
            color: activeTab === 'vacationDays' ? '#fff' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          🏖️ {t('vacation_days')}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* تبويب أوقات الدوام */}
        {activeTab === 'workTimes' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{t('work_times')}:</h4>
              {workTimes.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>لا توجد أوقات دوام محددة</div>
              ) : (
                workTimes.map((time, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <select
                      value={time.day}
                      onChange={(e) => updateWorkTime(index, 'day', e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    >
                      <option value="">اختر اليوم</option>
                      {weekdays.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={time.from}
                      onChange={(e) => updateWorkTime(index, 'from', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    />
                    <span style={{ alignSelf: 'center' }}>إلى</span>
                    <input
                      type="time"
                      value={time.to}
                      onChange={(e) => updateWorkTime(index, 'to', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkTime(index)}
                      style={{
                        background: '#e53935',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={addWorkTime}
              style={{
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + إضافة يوم عمل
            </button>
          </div>
        )}

        {/* تبويب أيام الإجازات */}
        {activeTab === 'vacationDays' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{t('vacation_days_title')}:</h4>
              {vacationDays.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>{t('no_vacation_days')}</div>
              ) : (
                vacationDays.map((vacation, index) => (
                  <div key={index} style={{ 
                    background: '#fff3e0',
                    border: '1px solid #ffcc02',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <h5 style={{ color: '#e65100', margin: 0, fontSize: '1rem' }}>{t('vacation_number')}{index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeVacationDay(index)}
                        style={{
                          background: '#e53935',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        حذف
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_type')}
                        </label>
                        <select
                          value={vacation.type}
                          onChange={(e) => updateVacationDay(index, 'type', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                        >
                          <option value="single">{t('single_day')}</option>
                          <option value="monthly">{t('monthly')}</option>
                          <option value="yearly">{t('yearly')}</option>
                        </select>
                      </div>
                      
                      {vacation.type === 'single' && (
                        <div>
                                                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_date')}
                        </label>
                          <input
                            type="date"
                            value={vacation.date}
                            onChange={(e) => updateVacationDay(index, 'date', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                            required
                          />
                        </div>
                      )}
                      
                      {vacation.type === 'monthly' && (
                        <div>
                                                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_month')}
                        </label>
                          <select
                            value={vacation.month}
                            onChange={(e) => updateVacationDay(index, 'month', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                            required
                          >
                            <option value="">{t('select_month')}</option>
                            <option value="1">{t('january')}</option>
                            <option value="2">{t('february')}</option>
                            <option value="3">{t('march')}</option>
                            <option value="4">{t('april')}</option>
                            <option value="5">{t('may')}</option>
                            <option value="6">{t('june')}</option>
                            <option value="7">{t('july')}</option>
                            <option value="8">{t('august')}</option>
                            <option value="9">{t('september')}</option>
                            <option value="10">{t('october')}</option>
                            <option value="11">{t('november')}</option>
                            <option value="12">{t('december')}</option>
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_year')}
                        </label>
                        <input
                          type="number"
                          value={vacation.year}
                          onChange={(e) => updateVacationDay(index, 'year', e.target.value)}
                          min={new Date().getFullYear()}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                          required
                        />
                      </div>
                      
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_description')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('vacation_description_placeholder')}
                          value={vacation.description}
                          onChange={(e) => updateVacationDay(index, 'description', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={addVacationDay}
              style={{
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + {t('add_vacation_day')}
            </button>
          </div>
        )}

        {/* أزرار الحفظ والإلغاء */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0A8F82',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              flex: 1
            }}
          >
            {loading ? t('saving') : t('save_changes')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            إلغاء
          </button>
        </div>

        {error && (
          <div style={{ color: '#e53935', marginTop: '0.5rem', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#4caf50', marginTop: '0.5rem', fontSize: '14px' }}>
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default WorkTimesEditor; 