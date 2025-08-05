import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function WorkTimesEditor({ profile, onClose, onUpdate }) {
  const [workTimes, setWorkTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    if (profile?.workTimes) {
      setWorkTimes(profile.workTimes);
    }
  }, [profile]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 WorkTimesEditor: إرسال أوقات الدوام المحدثة:', workTimes);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor/${profile._id}/work-times`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workTimes })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ WorkTimesEditor: تم تحديث أوقات الدوام بنجاح:', data);
        setSuccess('تم تحديث أوقات الدوام بنجاح!');
        // إرسال البيانات المحدثة فوراً مع البيانات المستلمة من السيرفر
        setTimeout(() => {
          const updatedWorkTimes = data.workTimes || workTimes;
          console.log('🔄 WorkTimesEditor: إرسال البيانات المحدثة:', updatedWorkTimes);
          onUpdate(updatedWorkTimes); // استخدام البيانات من السيرفر إذا كانت متوفرة
        }, 1500);
      } else {
        console.error('❌ WorkTimesEditor: خطأ من السيرفر:', data);
        setError(data.error || 'حدث خطأ أثناء تحديث أوقات الدوام');
      }
    } catch (err) {
      console.error('❌ WorkTimesEditor: خطأ في تحديث أوقات الدوام:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>أوقات الدوام الحالية:</h4>
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#7c4dff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              flex: 1
            }}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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