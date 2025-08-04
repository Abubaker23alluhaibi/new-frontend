import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function AppointmentDurationEditor({ profile, onClose, onUpdate }) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile?.appointmentDuration) {
      setDuration(profile.appointmentDuration.toString());
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor/${profile._id}/appointment-duration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentDuration: Number(duration) })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('تم تحديث مدة الموعد الافتراضية بنجاح!');
        setTimeout(() => {
          onUpdate(Number(duration)); // إرسال البيانات المحدثة
        }, 1500);
      } else {
        setError(data.error || 'حدث خطأ أثناء تحديث مدة الموعد');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>مدة الموعد الافتراضية:</h4>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
            هذه المدة ستُستخدم لتقسيم الأوقات المتاحة في صفحة تفاصيل الطبيب
          </p>
          
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '2px solid #7c4dff',
              fontSize: '16px',
              background: '#f7fafd',
              marginBottom: '1rem'
            }}
            required
          >
            <option value="5">5 دقائق</option>
            <option value="10">10 دقائق</option>
            <option value="15">15 دقيقة</option>
            <option value="20">20 دقيقة</option>
            <option value="30">30 دقيقة</option>
            <option value="45">45 دقيقة</option>
            <option value="60">60 دقيقة</option>
          </select>

          <div style={{ 
            background: '#e8f5e8', 
            padding: '0.8rem', 
            borderRadius: '8px', 
            border: '1px solid #4caf50',
            marginTop: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', color: '#2e7d32', marginBottom: '0.3rem' }}>
              مثال على الأوقات المتاحة:
            </div>
            <div style={{ fontSize: '14px', color: '#388e3c' }}>
              إذا كان الدوام من 09:00 إلى 17:00، ستظهر المواعيد كل {duration} دقيقة
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#7c4dff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem 1.5rem',
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
              padding: '0.8rem 1.5rem',
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

export default AppointmentDurationEditor; 